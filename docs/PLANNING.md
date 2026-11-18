# Blume — Planning & Stack (single source of truth)

> Satu list, urut per fase. `[x]` = selesai, `[ ]` = belum. Update file ini tiap ada keputusan baru.

## FASE 0 — Keputusan stack (sudah dikunci)

1. [x] **Backend = 1 service Python** (bukan Node + Python terpisah) — 12 dari 13 endpoint itu CRUD biasa, cuma 1 butuh model
2. [x] **Model = v3 hybrid** (ConvNeXt-Tiny + ViT-B/16), di-serve **server-side** — bukan TFLite on-device
3. [x] **Hosting = Oracle Cloud Always Free** — VM.Standard.A1.Flex (ARM), 2 OCPU / 12 GB, Ubuntu 24.04, region Singapore, $0
4. [x] **Database = PostgreSQL self-host** di VM yang sama — bukan SQLite ephemeral, bukan Neon
5. [x] **Foto scan = disk lokal** `/var/lib/blume/uploads/` — bukan Cloudinary
6. [x] **Chat = python-socketio** — bukan Node Socket.io
7. [x] **Reverse proxy = Caddy** — auto-TLS + WebSocket tanpa config tambahan
8. [x] **Ensemble MCP (DenseNet121 + EffNetB0 → XGBoost) tidak di-deploy** — tetap masuk bab perbandingan di laporan
9. [x] **PAYG ditunda** — pakai Always Free dulu, evaluasi setelah 1 minggu lihat memory metrics

## FASE 1 — Frontend (React Native)

10. [x] **RN 0.87.1** + React 19.2.3 + TypeScript 6.0.3 + Node ≥ 22.11
11. [x] **React Navigation 7.x** (native-stack + bottom-tabs) — RootNavigator, MainTabNavigator, AuthNavigator
12. [x] **Zustand 5.0.2** — state auth (`useAuthStore`)
13. [x] **axios 1.7.9** — `services/api.ts` dengan interceptor token
14. [x] **socket.io-client 4.8.1** — match python-socketio (EIO=4)
15. [x] **react-native-vision-camera 4.7.3** — `CameraScanScreen`
16. [x] **async-storage 2.1.0** — persist token
17. [x] **vector-icons 10.2.0** — ikon
18. [x] **Refactor teks plant → skin disease** di semua screen
19. [x] **Palette v2 sesuai Figma Variables** — background `#A8DB95`, sheet putih, primary pink `#F1A4B0`, secondary teal `#6FA39C`, text `#1B1C1A`/`#424942`, border input `#A65F6A`
20. [x] **Shadows hijau** `rgba(107,144,128,0.06–0.08)` — bukan hitam
21. [x] **Verifikasi render on-device** — histogram: `#A8DB95` 15.9%, `#EAE5E5` 5.3%, `#F1A4B0` 3.1%
22. [x] **Permissions Android** — CAMERA, ACCESS_NETWORK_STATE, READ_MEDIA_IMAGES, READ_EXTERNAL_STORAGE (maxSdk 32), uses-feature camera ×2
23. [x] **Permissions iOS** — NSCameraUsageDescription, NSPhotoLibraryUsageDescription, hapus NSLocation kosong
24. [x] **Build env Android** — `local.properties`, ANDROID_HOME, NDK 27.1, SDK 37.1, Gradle 9.4.1
25. [x] **Emulator** — Pixel_10_Pro_XL, partisi 12 GB, build + install + run verified
26. [ ] **Font Plus Jakarta Sans** — install ke `android/app/src/main/assets/fonts/` + `react-native.config.js`
27. [ ] **App icon & splash** — `assets/` masih kosong, masih icon default RN
28. [ ] **Pindah `API_BASE_URL` / `SOCKET_URL` ke `.env`** — pakai `react-native-config`, jangan hardcode
29. [ ] **Naikin `API_TIMEOUT`** — 15s → 30s (inference server 2–4s + upload)
30. [ ] **Audit screen dari Figma yang belum** — Profile, Camera, Splash, Onboarding 1–4, Register, OTP, Prescription
31. [ ] **Screen OTP** — ada di Figma (`13:781`), belum ada di RN
32. [ ] **Image picker galeri** — permission sudah siap, library belum (`react-native-image-picker`)
33. [ ] **JDK 24 → 17** — RN idealnya 17/21, sekarang 24 (risiko)

## FASE 2 — ML (model & artefak)

34. [x] **Notebook v3** — PyTorch, ConvNeXt-Tiny + ViT-B/16, 22 kelas, 32.162 gambar, input 320×320
35. [x] **Hasil training** — val acc **89.57%**, TTA 89%, macro F1 0.90
36. [ ] **Download `best_skindex_v5_320.pt`** (~456 MB) dari output Kaggle
37. [ ] **`ml/labels.py`** — 22 nama kelas + deskripsi Indonesia + rekomendasi per penyakit *(perlu validasi medis)*
38. [ ] **`ml/model.py`** — copy `SkindexHybridModel` + `FlexibleViT` dari notebook v3
39. [ ] **`ml/inference.py`** — preprocess 320×320, TTA 4-flip, softmax, top-5
40. [ ] **Fallback mode** — kalau `.pt` tidak ada, output dummy deterministik supaya backend tetap bisa dites
41. [ ] *(opsional)* **Export ONNX int8** — 456 MB → ~120 MB, hemat RAM & lebih cepat
42. [ ] *(ditunda)* **Model TFLite on-device** — MobileNetV3-Large 224 int8 ~6 MB, akurasi ~83–86%

## FASE 3 — Backend (FastAPI)

43. [x] **Kontrak API dibaca dari RN** — 13 endpoint, tipe `User`/`Doctor`/`DetectionResult`/`ChatMessage` sudah dipetakan
44. [ ] **Setup project** — FastAPI + uvicorn + SQLAlchemy, struktur `app/{routers,ml}/`
45. [ ] **Skema DB** — `User`, `Doctor`, `Detection`, `Message`, `ChatRoom`
46. [ ] **Auth** — JWT (PyJWT) + PBKDF2 hash; `POST /auth/login`, `POST /auth/register` → `{token, user}`
47. [ ] **Dependency `get_current_user`** — baca `Authorization: Bearer`
48. [ ] **`GET /auth/profile` + `PATCH /auth/profile`** — match tipe `User`
49. [ ] **Seed data** — 1 user demo + 5 dokter
50. [ ] **`POST /detection`** — multipart `image`, jalankan inference, simpan, return `DetectionResult`
51. [ ] **`GET /detection/history`** — return `DetectionHistoryItem[]`, urut terbaru
52. [ ] **`GET /detection/:id` + `DELETE /detection/:id`**
53. [ ] **`GET /doctors` + `GET /doctors/:id`** — match tipe `Doctor` (rating, isOnline, price)
54. [ ] **Socket mount** — `socketio.ASGIApp` di path `/socket.io`
55. [ ] **Handshake auth** — verifikasi JWT dari `auth.token` yang dikirim `socketService`
56. [ ] **Event `joinRoom` / `leaveRoom`** — socket.io room per `roomId`
57. [ ] **Event `sendMessage` → `receiveMessage`** — simpan ke DB, broadcast dengan `id`/`createdAt`/`senderId`
58. [ ] **`GET /chat/:roomId/messages`** — history chat saat buka room
59. [ ] **`GET /health`** — healthcheck untuk monitoring

## FASE 4 — Deploy (Oracle)

60. [ ] **Signup Oracle Free Tier** — region **Singapore**, kartu kredit/debit (bukan prepaid/virtual), hold ~$1
61. [ ] **Buat instance** — banner "Always Free" → shape `VM.Standard.A1.Flex`, 2 OCPU / 12 GB, Ubuntu 24.04 ARM, boot volume default ~47 GB, public IPv4 ON
62. [ ] **Buka port di 2 tempat** — Security List (console) + `ufw` (VM): 80, 443, 22
63. [ ] **Buat user non-root + SSH key**
64. [ ] **Install stack** — Python 3.11+, venv, torch CPU aarch64, PostgreSQL, Caddy
65. [ ] **Clone repo + `.env`** — JWT_SECRET, DATABASE_URL, MODEL_PATH
66. [ ] **systemd service** — auto-start uvicorn, restart on failure
67. [ ] **Caddy** — TLS otomatis, pakai `sslip.io` kalau tidak punya domain (`140-82-x-x.sslip.io`)
68. [ ] **Upload model `.pt`** — 456 MB ke `/opt/blume/models/`
69. [ ] **Budget alert $1** — Billing → Budgets, alert 1% forecast
70. [ ] **Aturan anti-tagihan** — jangan bikin NAT Gateway ($32/bln!), jangan volume >200 GB, jangan shape non-free
71. [ ] **Cek memory metrics hari ke-7** — kalau >20% aman dari idle reclamation; kalau tidak, baru upgrade PAYG

## FASE 5 — Wiring frontend ke backend

72. [ ] **`API_BASE_URL`** → `https://<ip>.sslip.io/api`
73. [ ] **`SOCKET_URL`** → `https://<ip>.sslip.io`
74. [ ] **Test login dari emulator** — `10.0.2.2` hanya untuk localhost, pakai URL publik
75. [ ] **Test scan** — upload foto → `diseaseName` + `confidence` + `description` + `recommendations`
76. [ ] **Test chat** — 2 client, pesan realtime
77. [ ] **Loading & error state** — di `ScanResultScreen` dan `ChatRoom`

## FASE 6 — Testing & dokumentasi

78. [ ] **Test 13 endpoint** — Postman/curl
79. [ ] **Test di HP fisik** — kamera emulator beda dengan asli
80. [ ] **Test cold start & reconnect socket**
81. [ ] **README backend** — cara run lokal + deploy
82. [ ] **Screenshot untuk laporan** — UI, confusion matrix, arsitektur

## FASE 7 — Offline (opsional, ditunda)

83. [ ] **Notebook MobileNetV3 → TFLite int8** — input 224, ~6 MB, akurasi ~83–86%
84. [ ] **Distilasi dari v3 ke MobileNetV3** — akurasi ~86–88%, nilai plus untuk laporan
85. [ ] **Integrasi `react-native-fast-tflite`** — frame processor vision-camera
86. [ ] **Sync queue** — hasil scan offline masuk AsyncStorage, sync saat online

---

## Estimasi total

| Fase | Estimasi |
|---|---|
| 1. Frontend sisa | ~6 jam |
| 2. ML artefak | ~2 jam (+ download model) |
| 3. Backend | ~11 jam |
| 4. Deploy Oracle | ~3 jam |
| 5. Wiring | ~2 jam |
| 6. Testing | ~3 jam |
| **Total** | **~27 jam** (± 4–5 hari kerja) |
| 7. Offline (opsional) | +~1 hari |

## Catatan risiko

- **Oracle out of capacity** saat bikin A1 → retry berkala, atau turunkan ke 1 OCPU/6 GB, atau upgrade PAYG
- **Idle reclamation** → jaga memory >20% (2,4 GB) dengan stack lengkap; PyTorch sendiri sudah ~1,5 GB
- **Cold start tidak ada** di Oracle (beda dengan HF/Modal) — jadi lebih baik untuk demo
- **ARM aarch64** — PyTorch, Pillow, numpy, psycopg2 semua punya wheel resmi; library niche mungkin perlu build from source
- **Socket.io Python** kurang contoh dibanding Node — tapi cuma 3 event, tidak masalah
