"""
Generator metadata model Skindex v3 untuk backend Blume.

Menghasilkan 3 file JSON:
  - class_labels.json : urutan 22 kelas (WAJIB sama persis dengan output model)
  - disease_info.json : deskripsi, tingkat keparahan, dan rekomendasi (Bahasa Indonesia)
  - model_meta.json   : parameter preprocessing, info model, dan disclaimer

Jalankan ulang kalau ada deskripsi yang mau diubah (dari root repo):
    python ml/gen_artifacts.py

Output langsung ditulis ke services/api/app/ml/artifacts/ supaya tidak ada
duplikat yang bisa beda versi antara generator dan runtime backend.

@format
"""

import io
import json
import os
import pickle
import zipfile
from collections import OrderedDict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # ml/
REPO_ROOT = os.path.dirname(BASE_DIR)                          # root monorepo
OUT_DIR = os.path.join(REPO_ROOT, "services", "api", "app", "ml", "artifacts")
CKPT = os.path.join(BASE_DIR, "models", "best_skindex_v5_320.pt")

# ─────────────────────────────────────────────────────────────
# 1. Urutan kelas — HARUS identik dengan urutan folder dataset
#    (ImageFolder mengurutkan nama folder secara alfabetis)
# ─────────────────────────────────────────────────────────────
CLASS_LABELS = [
    "Acne",
    "Actinic keratosis",
    "Benign keratosis",
    "Cacar Air",
    "Cellulitis",
    "Dermatofibroma",
    "Dry",
    "Eczema_Dermatitis_Group",
    "Herpes Zoster",
    "Impetigo",
    "Jamur Kuku",
    "Kutu Air",
    "Larva Migrans",
    "Melanocytic nevus",
    "Melanoma",
    "Normal",
    "Oily",
    "Psoriasis",
    "Scabies",
    "Squamous cell carcinoma",
    "Tinea Ringworm Candidiasis",
    "Vascular lesion",
]

# ─────────────────────────────────────────────────────────────
# 2. Info penyakit
#    severity: "ringan" | "sedang" | "berat"
# ─────────────────────────────────────────────────────────────
DISEASE_INFO = {
    "Acne": {
        "description": "Jerawat, yaitu peradangan folikel rambut dan kelenjar minyak yang menimbulkan komedo, papul, atau pustul.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Bersihkan wajah dua kali sehari dengan pembersih lembut",
            "Jangan memencet jerawat agar tidak meninggalkan bekas",
            "Gunakan produk berisi benzoil peroksida atau asam salisilat",
            "Konsultasi dokter bila jerawat meradang atau bernanah",
        ],
    },
    "Actinic keratosis": {
        "description": "Bercak kasar dan bersisik pada kulit yang rusak akibat paparan sinar matahari jangka panjang; termasuk lesi pra-kanker.",
        "severity": "sedang",
        "isContagious": False,
        "recommendations": [
            "Periksakan ke dokter spesialis kulit untuk penanganan dini",
            "Hindari paparan sinar matahari berlebih",
            "Gunakan tabir surya SPF 30+ setiap hari",
        ],
    },
    "Benign keratosis": {
        "description": "Keratosis seboroik, yaitu benjolan jinak berwarna cokelat yang tampak seperti menempel di permukaan kulit.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Umumnya tidak berbahaya dan tidak perlu tindakan",
            "Periksa bila berubah ukuran, warna, atau terasa gatal",
        ],
    },
    "Cacar Air": {
        "description": "Infeksi virus varicella-zoster yang menimbulkan bintil berisi cairan, gatal, dan menyebar di seluruh tubuh.",
        "severity": "sedang",
        "isContagious": True,
        "recommendations": [
            "Jangan menggaruk bintil agar tidak terjadi infeksi",
            "Gunakan losion kalamin untuk mengurangi gatal",
            "Konsultasi dokter bila demam tinggi atau bintil bernanah",
        ],
    },
    "Cellulitis": {
        "description": "Infeksi bakteri pada lapisan kulit yang lebih dalam, ditandai area merah, bengkak, hangat, dan nyeri.",
        "severity": "berat",
        "isContagious": False,
        "recommendations": [
            "Segera ke dokter — umumnya memerlukan antibiotik",
            "Jangan dipijat atau dikompres panas",
            "Posisikan area yang terinfeksi lebih tinggi untuk mengurangi bengkak",
        ],
    },
    "Dermatofibroma": {
        "description": "Benjolan jinak keras berwarna cokelat kemerahan, umumnya di tungkai, akibat reaksi jaringan terhadap luka kecil.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Umumnya tidak perlu tindakan",
            "Pantau bila berubah ukuran, warna, atau berdarah",
        ],
    },
    "Dry": {
        "description": "Kulit kering (xerosis) akibat berkurangnya kelembapan pada lapisan kulit terluar.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Gunakan pelembap setelah mandi",
            "Hindari sabun berbahan keras dan air panas",
            "Cukupi asupan air dan gunakan pakaian berbahan lembut",
        ],
    },
    "Eczema_Dermatitis_Group": {
        "description": "Kelompok peradangan kulit (eksim/dermatitis) dengan gejala kemerahan, gatal, dan kulit bersisik.",
        "severity": "sedang",
        "isContagious": False,
        "recommendations": [
            "Gunakan pelembap bebas pewangi secara rutin",
            "Hindari pemicu seperti deterjen keras, debu, dan stres",
            "Konsultasi dokter untuk krim steroid topikal",
        ],
    },
    "Herpes Zoster": {
        "description": "Cacar api akibat reaktivasi virus varicella-zoster, menimbulkan vesikel dan nyeri terbakar pada satu sisi tubuh.",
        "severity": "sedang",
        "isContagious": True,
        "recommendations": [
            "Segera ke dokter — antivirus paling efektif dalam 72 jam pertama",
            "Jaga vesikel tetap bersih dan kering",
            "Hindari kontak dengan bayi dan ibu hamil",
        ],
    },
    "Impetigo": {
        "description": "Infeksi bakteri superfisial pada kulit, ditandai lepuhan yang pecah dan membentuk kerak kekuningan seperti madu.",
        "severity": "sedang",
        "isContagious": True,
        "recommendations": [
            "Cuci tangan setelah menyentuh area terinfeksi",
            "Jangan berbagi handuk atau pakaian",
            "Konsultasi dokter untuk antibiotik topikal atau oral",
        ],
    },
    "Jamur Kuku": {
        "description": "Infeksi jamur pada kuku (onikomikosis) yang membuat kuku menebal, menguning, dan mudah rapuh.",
        "severity": "ringan",
        "isContagious": True,
        "recommendations": [
            "Jaga kuku tetap kering dan potong pendek",
            "Gunakan antijamur sesuai anjuran dokter",
            "Hindari memakai sepatu tertutup terlalu lama",
        ],
    },
    "Kutu Air": {
        "description": "Infeksi jamur pada sela jari kaki (tinea pedis) yang menimbulkan rasa gatal dan kulit mengelupas.",
        "severity": "ringan",
        "isContagious": True,
        "recommendations": [
            "Keringkan kaki hingga sela jari setelah mandi",
            "Gunakan antijamur topikal",
            "Ganti kaus kaki setiap hari dan pilih bahan yang menyerap keringat",
        ],
    },
    "Larva Migrans": {
        "description": "Infeksi cacing kulit akibat larva yang menembus kulit, menimbulkan garis berkelok kemerahan dan rasa gatal.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Konsultasi dokter untuk obat antiparasit",
            "Hindari berjalan tanpa alas kaki di tanah atau pasir",
        ],
    },
    "Melanocytic nevus": {
        "description": "Tahi lalat jinak akibat kumpulan sel penghasil pigmen (melanosit).",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Pantau dengan aturan ABCDE (Asimetri, Batas, Warna, Diameter, Evolving)",
            "Segera periksa bila berubah bentuk atau berdarah",
            "Gunakan tabir surya saat beraktivitas di luar ruangan",
        ],
    },
    "Melanoma": {
        "description": "Kanker kulit paling agresif yang berasal dari melanosit, tampak sebagai lesi asimetris dengan warna tidak merata.",
        "severity": "berat",
        "isContagious": False,
        "recommendations": [
            "SEGERA periksakan ke dokter spesialis kulit",
            "Jangan digaruk atau diobati sendiri",
            "Catat perubahan ukuran dan warna untuk disampaikan ke dokter",
        ],
    },
    "Normal": {
        "description": "Tidak ditemukan indikasi penyakit kulit pada gambar.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Pertahankan kebersihan dan kelembapan kulit",
            "Gunakan tabir surya setiap hari",
            "Lakukan pemeriksaan berkala bila ada perubahan pada kulit",
        ],
    },
    "Oily": {
        "description": "Kulit berminyak akibat produksi sebum berlebih, sering disertai pori membesar dan komedo.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Gunakan pembersih ringan dua kali sehari",
            "Pilih pelembap non-komedogenik",
            "Hindari produk dengan kandungan alkohol tinggi",
        ],
    },
    "Psoriasis": {
        "description": "Penyakit autoimun yang menimbulkan plak tebal bersisik keperakan, umumnya di siku, lutut, dan kulit kepala.",
        "severity": "sedang",
        "isContagious": False,
        "recommendations": [
            "Konsultasi dokter untuk terapi topikal atau sistemik",
            "Hindari pemicu seperti stres, infeksi, alkohol, dan rokok",
            "Jaga kulit tetap lembap",
        ],
    },
    "Scabies": {
        "description": "Infeksi tungau Sarcoptes scabiei yang menimbulkan gatal hebat terutama malam hari, dengan terowongan kecil di kulit.",
        "severity": "sedang",
        "isContagious": True,
        "recommendations": [
            "Konsultasi dokter untuk krim permetrin",
            "Cuci semua pakaian dan sprei dengan air panas",
            "Seluruh anggota keluarga serumah perlu diobati bersamaan",
        ],
    },
    "Squamous cell carcinoma": {
        "description": "Kanker kulit dari sel skuamosa, tampak sebagai benjolan keras, bersisik, atau luka yang tidak kunjung sembuh.",
        "severity": "berat",
        "isContagious": False,
        "recommendations": [
            "SEGERA periksakan ke dokter spesialis kulit",
            "Jangan diobati sendiri",
            "Hindari paparan sinar matahari berlebih",
        ],
    },
    "Tinea Ringworm Candidiasis": {
        "description": "Infeksi jamur pada kulit dengan ruam melingkar bertepi merah dan bagian tengah tampak lebih terang.",
        "severity": "ringan",
        "isContagious": True,
        "recommendations": [
            "Jaga area tetap kering dan bersih",
            "Gunakan antijamur topikal secara rutin",
            "Jangan berbagi handuk atau pakaian",
        ],
    },
    "Vascular lesion": {
        "description": "Kelainan pembuluh darah pada kulit seperti hemangioma atau angioma, umumnya bersifat jinak.",
        "severity": "ringan",
        "isContagious": False,
        "recommendations": [
            "Umumnya tidak berbahaya dan tidak perlu tindakan",
            "Periksa bila berubah ukuran, warna, atau berdarah",
        ],
    },
}


class _Storage:
    """Placeholder untuk storage tensor saat membaca checkpoint tanpa torch."""

    def __init__(self, dtype, key, location, numel):
        self.dtype, self.key, self.location, self.numel = dtype, key, location, numel


def _rebuild_tensor_v2(storage, offset, size, stride, requires_grad, hooks, metadata=None):
    return {"storage": storage, "shape": tuple(size)}


class _Unpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "collections" and name == "OrderedDict":
            return OrderedDict
        if module == "torch._utils" and name == "_rebuild_tensor_v2":
            return _rebuild_tensor_v2
        if module == "torch" and name.endswith("Storage"):
            return name
        if module == "torch":
            return lambda *a, **k: a
        raise pickle.UnpicklingError(f"kelas tak dikenal: {module}.{name}")

    def persistent_load(self, pid):
        _, stype, key, location, numel = pid
        return _Storage(stype, key, location, numel)


def count_parameters(ckpt_path):
    """Hitung jumlah parameter langsung dari checkpoint tanpa butuh torch."""
    with zipfile.ZipFile(ckpt_path) as zf:
        inner = [n for n in zf.namelist() if n.endswith("data.pkl")][0]
        state = _Unpickler(io.BytesIO(zf.read(inner))).load()
    return sum(v["storage"].numel for v in state.values() if isinstance(v, dict))


def main():
    missing = [c for c in CLASS_LABELS if c not in DISEASE_INFO]
    if missing:
        raise SystemExit(f"Kelas belum punya info: {missing}")
    extra = [c for c in DISEASE_INFO if c not in CLASS_LABELS]
    if extra:
        raise SystemExit(f"Info untuk kelas yang tidak ada di CLASS_LABELS: {extra}")

    os.makedirs(OUT_DIR, exist_ok=True)

    with open(os.path.join(OUT_DIR, "class_labels.json"), "w", encoding="utf-8") as f:
        json.dump(CLASS_LABELS, f, indent=2, ensure_ascii=False)

    with open(os.path.join(OUT_DIR, "disease_info.json"), "w", encoding="utf-8") as f:
        json.dump(DISEASE_INFO, f, indent=2, ensure_ascii=False)

    param_count = None
    if os.path.exists(CKPT):
        param_count = count_parameters(CKPT)
        print(f"Parameter dari checkpoint: {param_count/1e6:.1f}M")

    meta = {
        "modelName": "SkindexHybrid v3",
        "architecture": "ConvNeXt-Tiny + ViT-B/16 -> concat 1024-D -> MLP head",
        "framework": "PyTorch",
        "numClasses": len(CLASS_LABELS),
        "parameterCount": param_count,
        "inputSize": 320,
        "resizeSize": 352,
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225],
        },
        "classOrder": CLASS_LABELS,
        "healthyClasses": ["Normal"],
        "tta": {
            "enabled": False,
            "reason": "TTA 4-flip menghasilkan 89.46%, lebih rendah dari 89.57% tanpa TTA. "
                      "Menonaktifkan TTA membuat inference ~4x lebih cepat tanpa kehilangan akurasi.",
        },
        "metrics": {
            "valAccuracy": 89.57,
            "ttaAccuracy": 89.46,
            "macroF1": 0.90,
            "valSamples": 6433,
            "trainSamples": 25729,
            "datasetSize": 32162,
        },
        "disclaimer": "Hasil deteksi bukan diagnosis medis. Selalu konsultasikan "
                      "kondisi kulit ke dokter spesialis.",
    }
    with open(os.path.join(OUT_DIR, "model_meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(CLASS_LABELS)} kelas, {len(DISEASE_INFO)} info penyakit")
    for name in ("class_labels.json", "disease_info.json", "model_meta.json"):
        size = os.path.getsize(os.path.join(OUT_DIR, name))
        print(f"   {name:22s} {size/1024:6.1f} KB")
    print(f"   output: {OUT_DIR}")


if __name__ == "__main__":
    main()
