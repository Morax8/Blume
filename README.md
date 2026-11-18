# Blume 🌿

Aplikasi deteksi penyakit kulit berbasis React Native + FastAPI + model deep learning 22 kelas.

**Repo ini monorepo**: aplikasi mobile, backend, dan artefak model ada di satu tempat.

## Struktur

```
Blume/
├── apps/mobile/          React Native app (Android + iOS)
├── services/api/         Backend FastAPI + python-socketio
├── ml/                   Notebook, generator artefak, checkpoint model
├── docs/                 Planning & dokumentasi
└── scripts/              Script bantu
```

## Prasyarat

| Tool | Versi |
|---|---|
| Node.js | ≥ 22.11 |
| JDK | 17 atau 21 (24 belum ideal untuk RN) |
| Android SDK | platform 37, NDK 27.1 |
| Python | ≥ 3.11 |
| Git | terbaru |

## Quick start

### 1. Mobile app

```bash
cd apps/mobile
npm install
cp .env.example .env        # isi API_BASE_URL & SOCKET_URL
npm run android             # butuh emulator / HP tersambung
```

### 2. Backend API

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 3000
```

Cek: <http://localhost:3000/health>

Backend punya **2 mode**:

| Mode | Syarat | Perilaku |
|---|---|---|
| `demo` | tanpa `torch` / tanpa file `.pt` | prediksi dummy deterministik — alur tetap bisa dites |
| `real` | `pip install -r requirements-ml.txt` + `.pt` ada | model v3 asli (89.57% val acc) |

Install PyTorch CPU-only (hemat ~2 GB):

```bash
pip install -r requirements-ml.txt --index-url https://download.pytorch.org/whl/cpu
```

### 3. Model ML

Checkpoint **tidak di-commit** (460 MB). Ambil dari salah satu:

- Kaggle Dataset / output notebook → taruh di `ml/models/best_skindex_v5_320.pt`
- GitHub Release asset repo ini → `wget` lalu taruh di path yang sama

Regenerate metadata kelas (kalau deskripsi penyakit diubah):

```bash
python ml/gen_artifacts.py
# output → services/api/app/ml/artifacts/
```

## API

Base URL: `http://<host>:3000/api` · Socket: `http://<host>:3000` (path `/socket.io`)

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register` | — |
| POST | `/auth/login` | — |
| GET | `/auth/profile` | ✅ |
| PATCH | `/auth/profile` | ✅ |
| POST | `/detection` | ✅ |
| GET | `/detection/history` | ✅ |
| GET | `/detection/:id` | ✅ |
| DELETE | `/detection/:id` | ✅ |
| GET | `/doctors` | ✅ |
| GET | `/doctors/:id` | ✅ |
| POST | `/chat/rooms` | ✅ |
| GET | `/chat/:roomId/messages` | ✅ |
| GET | `/health` | — |

Socket events: `joinRoom`, `leaveRoom`, `sendMessage` → `receiveMessage`

## Emulator Android

`10.0.2.2` = `localhost` mesin host dari dalam emulator.

```env
API_BASE_URL=http://10.0.2.2:3000/api
SOCKET_URL=http://10.0.2.2:3000
```

## Dokumentasi

- [`docs/PLANNING.md`](docs/PLANNING.md) — roadmap, keputusan stack, risiko
- [`services/api/README.md`](services/api/README.md) — detail backend

## Lisensi

Proyek akademik — Universitas (Semester 5, mata kuliah MCP & Deep Learning).
