# ml/models/

Folder ini **tidak di-commit** isinya (lihat `.gitignore` root).

## Yang harus ada di sini

```
best_skindex_v5_320.pt     460 MB   checkpoint model v3 (ConvNeXt-Tiny + ViT-B/16)
```

## Cara mendapatkan

1. **Dari Kaggle** — jalankan notebook `ml/notebooks/skindex-v3-zian-version.ipynb`
   sampai cell training, lalu download output `best_skindex_v5_320.pt`
2. **Dari GitHub Release** — repo ini menyimpan checkpoint sebagai release asset
   (limit GitHub 100 MB per file untuk git biasa, 2 GB untuk release asset)

## Catatan

- Nama file menyebut **v5** karena mengikuti versi notebook, tapi **arsitektur modelnya v3**
- Checkpoint disimpan dari CUDA → selalu load dengan `map_location="cpu"`
- Verifikasi cepat tanpa torch:

```bash
python -c "
import zipfile
z = zipfile.ZipFile('ml/models/best_skindex_v5_320.pt')
print('entries:', len(z.infolist()))
print('valid:', z.testzip() is None)
"
```

- 115.073.144 parameter, 352 tensor, output `mlp_head.8.weight` berbentuk `(22, 256)`
