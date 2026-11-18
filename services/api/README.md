# Blume API (FastAPI + Socket.io)

Backend untuk aplikasi React Native **Blume** (deteksi penyakit kulit +
konsultasi dokter). Satu proses ASGI melayani HTTP (`/api`, `/uploads`,
`/health`) dan Socket.io (`/socket.io`) di port **3000**.

## Install

Butuh Python 3.11+. Dari folder `services/api`:

```bash
python -m venv .venv
source .venv/Scripts/activate     # Windows git-bash
# source .venv/bin/activate       # Linux/macOS
pip install -r requirements.txt
cp .env.example .env              # lalu sesuaikan (JWT_SECRET wajib diganti di produksi)
```

Alternatif dari root repo: `bash scripts/run-api.sh` (venv + install +
uvicorn otomatis).

## Menjalankan

```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

### Mode demo (default)

Tanpa torch/torchvision, prediksi memakai generator dummy deterministik
(gambar sama → hasil sama). Semua endpoint tetap bisa dites end-to-end.
`GET /health` menunjukkan `"modelMode": "demo"`.

### Mode real (model PyTorch)

1. Install dependency ML (CPU-only disarankan):

   ```bash
   pip install -r requirements-ml.txt --index-url https://download.pytorch.org/whl/cpu
   ```

2. Letakkan checkpoint di path `MODEL_PATH` pada `.env`
   (default `../../ml/models/best_skindex_v5_320.pt`, relatif dari
   `services/api`).
3. Set `WARM_MODEL=1` supaya model dimuat saat startup, lalu jalankan
   ulang uvicorn. `GET /health` menunjukkan `"modelMode": "real"`.

> **Catatan:** file model `best_skindex_v5_320.pt` berukuran ±460 MB dan
> **TIDAK di-commit** ke git (lihat `.gitignore`). Dapatkan file-nya
> terpisah (mis. dari rilis dataset/training notebook di `ml/notebooks`).
> Kalau file tidak ada, backend otomatis fallback ke mode demo.

## Endpoint (13)

Semua endpoint HTTP berada di prefix `/api` kecuali `/health`.
Field response **camelCase**. Error memakai `{"detail": "..."}`.
Endpoint bertanda 🔒 butuh header `Authorization: Bearer <token>`.

| #  | Method | Path                        | Ket                                              |
| -- | ------ | --------------------------- | ------------------------------------------------ |
| 1  | POST   | `/api/auth/register`        | Daftar → `{token, user}` (201)                    |
| 2  | POST   | `/api/auth/login`           | Login → `{token, user}`                           |
| 3  | GET    | `/api/auth/profile` 🔒      | Profil user login                                 |
| 4  | PATCH  | `/api/auth/profile` 🔒      | Update name/phone/avatarUrl                       |
| 5  | GET    | `/api/doctors` 🔒           | Daftar dokter (online dulu, lalu rating)          |
| 6  | GET    | `/api/doctors/{id}` 🔒      | Detail dokter                                     |
| 7  | POST   | `/api/detection` 🔒         | Upload gambar (multipart `image`) → hasil deteksi |
| 8  | GET    | `/api/detection/history` 🔒 | Riwayat deteksi user (terbaru dulu)               |
| 9  | GET    | `/api/detection/{id}` 🔒    | Detail satu hasil deteksi                         |
| 10 | DELETE | `/api/detection/{id}` 🔒    | Hapus deteksi + file gambar → `{success: true}`   |
| 11 | POST   | `/api/chat/rooms` 🔒        | Buat/ambil room `{doctorId}` → `ChatRoomOut`      |
| 12 | GET    | `/api/chat/{roomId}/messages` 🔒 | Riwayat pesan (urut naik, `isMine`)         |
| 13 | GET    | `/health`                   | Status server, model, database                    |

Dokumen interaktif: <http://localhost:3000/docs> (hanya FastAPI; Socket.io
tidak muncul di Swagger).

## Socket.io (chat realtime)

Server Socket.io ada di path **`/socket.io`** (BUKAN di bawah `/api`).
Autentikasi memakai JWT yang sama: kirim `{"token": "..."}` di `auth`
saat handshake (atau fallback `?token=...`).

Event:

| Event           | Arah          | Data                                          |
| --------------- | ------------- | --------------------------------------------- |
| `joinRoom`      | client→server | `{roomId}`                                    |
| `leaveRoom`     | client→server | `{roomId}`                                    |
| `sendMessage`   | client→server | `{roomId, content}`                           |
| `receiveMessage`| server→client | `{id, roomId, senderId, content, createdAt, status}` |

### Cara test socket

Client Socket.io butuh dependency tambahan (tidak termasuk
`requirements.txt`):

```bash
pip install "python-socketio[client]"
```

Contoh client (simpan sebagai `test_socket.py`, jalankan setelah server
nyala dan punya token dari `/api/auth/login`):

```python
import socketio

TOKEN = "<token dari login>"
sio = socketio.Client()

@sio.on("receiveMessage")
def on_receive(data):
    print("receiveMessage:", data)

sio.connect("http://localhost:3000", auth={"token": TOKEN})
room_id = "<roomId dari POST /api/chat/rooms>"
sio.emit("joinRoom", {"roomId": room_id})
sio.emit("sendMessage", {"roomId": room_id, "content": "Halo dokter!"})
sio.sleep(2)
sio.disconnect()
```

Pesan yang dikirim akan dibroadcast balik sebagai `receiveMessage` ke
semua anggota room (termasuk pengirim), dan tersimpan di database
(terlihat lewat `GET /api/chat/{roomId}/messages`).

## Struktur

```
services/api/
├─ app/
│  ├─ config.py         # settings (baca .env)
│  ├─ database.py       # engine, SessionLocal, Base, get_db
│  ├─ models.py         # ORM: User, Doctor, Detection, ChatRoom, Message
│  ├─ schemas.py        # Pydantic camelCase (match src/types/*.ts)
│  ├─ security.py       # PBKDF2 password hash + JWT
│  ├─ deps.py           # get_current_user
│  ├─ seed.py           # seed user demo + 5 dokter (idempotent)
│  ├─ sockets.py        # Socket.io AsyncServer + event handlers
│  ├─ main.py           # entry point ASGI (FastAPI + Socket.io)
│  ├─ ml/               # architecture.py, inference.py, artifacts/
│  └─ routers/          # auth.py, doctors.py, detection.py, chat.py
├─ uploads/             # gambar hasil upload (dibuat otomatis)
├─ requirements.txt
├─ requirements-ml.txt
└─ .env.example
```

## Deploy (VM Linux, port 3000)

Jalankan dengan uvicorn/gunicorn di port 3000, atau di balik reverse
proxy (nginx/caddy). Set `PUBLIC_BASE_URL` ke URL publik agar `imageUrl`
hasil deteksi absolut, dan ganti `JWT_SECRET` dengan string acak panjang:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```
