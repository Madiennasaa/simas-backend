# SIMAS Backend

Backend Express + Prisma buat SIMAS (Sistem Informasi Manajemen Sekolah SDN Sukorame 1 Kediri), dikonsumsi oleh aplikasi Flutter.

## Setup

1. `npm install`
2. Copy `.env.example` jadi `.env`, sesuaikan `DATABASE_URL` (buat database MySQL kosong dulu di lokal/hosting)
3. `npx prisma migrate dev --name init` — ini generate tabel di MySQL sesuai `prisma/schema.prisma`
4. `npm run dev` — jalan di `http://localhost:3000`

## Struktur folder

```
src/
  app.js                    -> setup express, middleware global, mount routes
  server.js                 -> entry point, listen port
  config/
    db.js                   -> inisialisasi Prisma Client (singleton)
    jwt.js                  -> konstanta secret & expiry JWT, dibaca dari .env
  middlewares/
    authMiddleware.js       -> cek JWT token dari header Authorization
    roleMiddleware.js       -> cek role user sesuai endpoint (admin/guru/siswa/wali/kepsek)
    errorMiddleware.js      -> tangkep semua error, format response konsisten
  controllers/
    authController.js       -> login, cek token
    attendanceController.js -> CONTOH LENGKAP, validasi kepemilikan data sebelum panggil service
  services/
    authService.js          -> query Prisma buat login
    attendanceService.js    -> CONTOH LENGKAP, semua query Prisma absensi
  routes/
    authRoutes.js
    attendanceRoutes.js     -> definisi endpoint + role siapa yang boleh akses
    api.js                  -> router gabungan, semua route di-mount di sini
  utils/
    jwt.js                  -> fungsi sign()/verify() token
    response.js             -> helper success()/failure() biar format response API seragam
```

## Pola bikin fitur baru

Ikutin pola `attendance` (controller + service + routes). Tiap fitur baru nambah 3 file dengan nama seragam, contoh buat fitur `grades`:

- `services/gradeService.js` — isinya query Prisma murni, gak boleh ada `req`/`res` di sini
- `controllers/gradeController.js` — baca `req.body`/`req.params`, validasi kepemilikan data (misal: guru cuma boleh input nilai mapel yang dia ampu), panggil service, kirim response pakai `success()`/`failure()`
- `routes/gradeRoutes.js` — definisi path + middleware `authenticate` dan `authorize(...roles)` per endpoint

Setelah itu daftarin di `src/routes/api.js`:
```js
router.use("/grades", require("./gradeRoutes"));
```

## Autentikasi dari sisi Flutter

1. POST `/api/auth/login` dengan `{ username, password }`, dapat balik `{ token, user }`
2. Simpan token (misal pakai `flutter_secure_storage`)
3. Tiap request selanjutnya kirim header `Authorization: Bearer <token>`
4. Kalau dapat response 401, berarti token expired/invalid — redirect ke halaman login lagi

## Catatan penting

- Semester yang `is_locked = true` di `academic_years` menolak semua write (insert/update) kecuali lewat endpoint khusus admin — logic ini dicek di tiap service sebelum nulis data (lihat contoh di `attendanceService.js`)
- Field `proofUrl` di attendance dan `linkUrl`/`attachmentUrl` di materials/assignments cuma nyimpen link Google Drive, bukan file asli — upload filenya lewat Google Drive API langsung dari Flutter atau lewat endpoint terpisah yang proxy ke Drive
- Password di-hash pakai `bcrypt` sebelum disimpan — jangan pernah simpan plain text
- Fitur yang masih perlu dibuat mengikuti pola di atas: students, teachers, classes, subjects, schedules, materials, assignments, grades, quizzes, announcements, report-cards, school-profile
