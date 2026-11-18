"""Smoke test Blume API — 13 endpoint HTTP + socket, tanpa curl manual.

Menjalankan uvicorn di thread, lalu menguji semuanya dari dalam proses yang sama.
Otomatis melaporkan mode model yang aktif (demo / real).

Jalankan dari folder services/api/:
    .venv/Scripts/python.exe scripts/smoke_test.py
"""

from __future__ import annotations

import io
import sys
import threading
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402
import socketio  # noqa: E402
import uvicorn  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402

PORT = 3099
BASE = f"http://127.0.0.1:{PORT}"

lolos = 0
gagal = 0


def cek(nama: str, kondisi: bool, detail: str = "") -> bool:
    global lolos, gagal
    if kondisi:
        lolos += 1
        print(f"  ✅ {nama}" + (f" — {detail}" if detail else ""))
    else:
        gagal += 1
        print(f"  ❌ {nama}" + (f" — {detail}" if detail else ""))
    return kondisi


def gambar_jpeg() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (640, 480), (205, 160, 150)).save(buf, "JPEG")
    return buf.getvalue()


def tunggu_server(server: uvicorn.Server) -> None:
    for _ in range(150):
        if server.started:
            return
        time.sleep(0.1)
    raise RuntimeError("uvicorn tidak siap dalam 15 detik")


def main() -> int:
    print("=" * 64)
    print("BLUME API — SMOKE TEST")
    print("=" * 64)

    config = uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="warning")
    server = uvicorn.Server(config)
    threading.Thread(target=server.run, daemon=True).start()
    tunggu_server(server)

    with httpx.Client(base_url=BASE, timeout=60) as c:
        # ── health ──
        print("\n[1] GET /health")
        r = c.get("/health")
        h = r.json() if r.status_code == 200 else {}
        cek("status 200", r.status_code == 200)
        cek("modelMode terisi", "modelMode" in h, f"mode={h.get('modelMode')}")
        cek("modelLoaded", h.get("modelLoaded") is not None, str(h.get("modelLoaded")))
        cek("numClasses = 22", h.get("numClasses") == 22, str(h.get("numClasses")))

        # ── register ──
        print("\n[2] POST /api/auth/register")
        email = f"test_{uuid.uuid4().hex[:8]}@blume.id"
        r = c.post("/api/auth/register", json={"name": "Test User", "email": email, "password": "rahasia123"})
        cek("status 201", r.status_code == 201, str(r.status_code))
        body = r.json() if r.status_code == 201 else {}
        cek("ada token", bool(body.get("token")))
        cek("user.email benar", body.get("user", {}).get("email") == email)

        print("\n[3] register email duplikat -> 400")
        r = c.post("/api/auth/register", json={"name": "X", "email": email, "password": "rahasia123"})
        cek("status 400", r.status_code == 400, str(r.status_code))

        # ── login ──
        print("\n[4] POST /api/auth/login (user seed)")
        r = c.post("/api/auth/login", json={"email": "demo@blume.id", "password": "demo1234"})
        cek("status 200", r.status_code == 200, str(r.status_code))
        token = r.json().get("token") if r.status_code == 200 else None
        cek("token diterima", bool(token))

        print("\n[5] login password salah -> 401")
        r = c.post("/api/auth/login", json={"email": "demo@blume.id", "password": "salahbanget"})
        cek("status 401", r.status_code == 401, str(r.status_code))

        if not token:
            print("\n⛔ token tidak ada, sisa tes dilewati")
            return 1

        H = {"Authorization": f"Bearer {token}"}

        # ── profile ──
        print("\n[6] GET /api/auth/profile")
        r = c.get("/api/auth/profile", headers=H)
        cek("status 200", r.status_code == 200, str(r.status_code))
        cek("camelCase createdAt", "createdAt" in r.json() if r.status_code == 200 else False)

        print("\n[7] PATCH /api/auth/profile")
        r = c.patch("/api/auth/profile", headers=H, json={"name": "Demo Blume"})
        cek("status 200", r.status_code == 200, str(r.status_code))
        cek("name terupdate", r.json().get("name") == "Demo Blume" if r.status_code == 200 else False)

        print("\n[8] GET /api/auth/profile tanpa token -> 401")
        cek("status 401", c.get("/api/auth/profile").status_code == 401)

        # ── doctors ──
        print("\n[9] GET /api/doctors")
        r = c.get("/api/doctors", headers=H)
        cek("status 200", r.status_code == 200, str(r.status_code))
        docs = r.json() if r.status_code == 200 else []
        cek("ada >= 5 dokter", len(docs) >= 5, f"{len(docs)} dokter")

        print("\n[10] GET /api/doctors/{id}")
        if docs:
            r = c.get(f"/api/doctors/{docs[0]['id']}", headers=H)
            cek("status 200", r.status_code == 200, str(r.status_code))

        # ── detection ──
        print("\n[11] POST /api/detection (multipart)")
        t0 = time.perf_counter()
        r = c.post(
            "/api/detection",
            headers=H,
            files={"image": ("kulit.jpg", gambar_jpeg(), "image/jpeg")},
        )
        dt = time.perf_counter() - t0
        cek("status 201/200", r.status_code in (200, 201), str(r.status_code))
        det = r.json() if r.status_code in (200, 201) else {}
        cek("diseaseName terisi", bool(det.get("diseaseName")), str(det.get("diseaseName")))
        cek("confidence 0..1", isinstance(det.get("confidence"), (int, float)))
        cek("recommendations list", isinstance(det.get("recommendations"), list))
        cek("topPredictions list", isinstance(det.get("topPredictions"), list))
        cek("modelMode terisi", bool(det.get("modelMode")), f"mode={det.get('modelMode')}")
        print(f"     ⏱  inferensi+upload: {dt*1000:.0f} ms")

        print("\n[12] GET imageUrl (static /uploads)")
        if det.get("imageUrl"):
            path = det["imageUrl"].replace(BASE, "")
            r = c.get(path)
            cek("status 200", r.status_code == 200, str(r.status_code))
            cek("content-type image", r.headers.get("content-type", "").startswith("image/"),
                r.headers.get("content-type", ""))

        print("\n[13] GET /api/detection/history")
        r = c.get("/api/detection/history", headers=H)
        cek("status 200", r.status_code == 200, str(r.status_code))
        hist = r.json() if r.status_code == 200 else []
        cek("history tidak kosong", len(hist) > 0, f"{len(hist)} item")
        cek("pakai field scannedAt", "scannedAt" in hist[0] if hist else False)

        print("\n[14] GET /api/detection/{id}")
        det_id = det.get("id")
        if det_id:
            r = c.get(f"/api/detection/{det_id}", headers=H)
            cek("status 200", r.status_code == 200, str(r.status_code))

        # ── chat ──
        print("\n[15] POST /api/chat/rooms")
        room_id = None
        if docs:
            r = c.post("/api/chat/rooms", headers=H, json={"doctorId": docs[0]["id"]})
            cek("status 200/201", r.status_code in (200, 201), str(r.status_code))
            room_id = r.json().get("id") if r.status_code in (200, 201) else None

            r2 = c.post("/api/chat/rooms", headers=H, json={"doctorId": docs[0]["id"]})
            cek("idempoten (room sama)", r2.json().get("id") == room_id if r2.status_code in (200, 201) else False)

        print("\n[16] GET /api/chat/{roomId}/messages")
        if room_id:
            r = c.get(f"/api/chat/{room_id}/messages", headers=H)
            cek("status 200", r.status_code == 200, str(r.status_code))

        # ── socket ──
        print("\n[17] SOCKET: connect + joinRoom + sendMessage -> receiveMessage")
        sio = socketio.Client(logger=False, engineio_logger=False)
        diterima: list[dict] = []
        event = threading.Event()

        @sio.on("receiveMessage")
        def _recv(data):  # noqa: ANN001
            diterima.append(data)
            event.set()

        try:
            sio.connect(BASE, auth={"token": token}, transports=["websocket"], wait_timeout=10)
            cek("connect berhasil", sio.connected)

            if room_id:
                sio.emit("joinRoom", {"roomId": room_id})
                time.sleep(0.4)
                sio.emit("sendMessage", {"roomId": room_id, "content": "halo dokter"})
                ketemu = event.wait(timeout=10)
                cek("receiveMessage diterima", ketemu)
                if ketemu:
                    m = diterima[0]
                    cek("isi pesan benar", m.get("content") == "halo dokter", str(m.get("content")))
                    cek("ada senderId", bool(m.get("senderId")))
                    cek("ada createdAt", bool(m.get("createdAt")))
            sio.disconnect()
        except Exception as exc:  # noqa: BLE001
            cek("socket", False, f"{type(exc).__name__}: {exc}")

        # ── cleanup ──
        print("\n[18] DELETE /api/detection/{id}")
        if det_id:
            r = c.delete(f"/api/detection/{det_id}", headers=H)
            cek("status 200", r.status_code == 200, str(r.status_code))
            cek("success true", r.json().get("success") is True if r.status_code == 200 else False)

    print("\n" + "=" * 64)
    print(f"HASIL: {lolos} lolos, {gagal} gagal")
    print("=" * 64)
    return 0 if gagal == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
