# Lofi App — README

## Tentang Proyek
"Lo-fi" di sini berarti **low-fidelity prototype**. Prototipe awal aplikasi berbasis **HTML, CSS, dan JavaScript** untuk sistem manajemen tugas & tim sederhana. Belum ada backend, semua data disimpan di **LocalStorage** browser.

Tujuan dari proyek ini adalah:
- Memberikan gambaran awal antarmuka (UI/UX).
- Memisahkan fitur **Free Plan** dan **Premium Plan**.
- Menjadi dasar untuk dikembangkan lebih lanjut ke aplikasi nyata (misalnya dengan backend Laravel, Appwrite, Node.js, dll).

---

## Struktur Folder
```
CleanHNote UI-UX/
├── index.html # Struktur halaman utama
├── style.css # Styling aplikasi
├── script.js # Logika aplikasi (login, register, navigasi)
└─ README.md           (Dokumentasi)
```

---

## Cara Menjalankan

### Buka langsung di browser
- Masukkan link `https://bagasrozzaqfadli.github.io/DesainUiUxCleanHNote/` ad.
- Login dengan akun:
  - **Premium**: `User1@gmail.com` / `user12345`
  - **Free**: daftar dulu via halaman **Register**

---

## Fitur yang Tersedia

### Free Plan
- Login & Register akun.
- Dashboard dengan notifikasi.
- Membuat & mengelola **Tugas Pribadi** (judul, deskripsi, level, tanggal).
- Bergabung ke tim via kode undangan (tidak bisa buat tim).

### Premium Plan
- Semua fitur Free Plan.
- Bisa **membuat tim** & membagikan kode undangan.
- Bisa **mengundang anggota**.
- Bisa membuat **tugas untuk anggota tim**.
- Halaman **Info Tim**, **Progress Tim**, dan **Laporan Kinerja Tim**.

---

## Catatan
- Semua data (akun, tugas, tim) masih dummy → disimpan di LocalStorage.
- Jika ingin dikembangkan serius: tambahkan backend (misalnya **Laravel, Express.js, atau Appwrite**).
- UI ini masih low-fidelity, bisa ditingkatkan dengan framework UI (Tailwind, Bootstrap) atau dipindah ke framework modern (Vue, React, Nuxt, Next).

---

Dengan README ini, siapa pun yang membuka repo di GitHub akan langsung paham bahwa **lofi adalah prototipe low-fidelity** untuk aplikasi manajemen tugas & tim.
