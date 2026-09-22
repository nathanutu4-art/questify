# Questify - Backup Information (v4.0)

**Waktu Backup:** 23 September 2026, 03:40 WIB  
**Lokasi Backup:**
- **Folder:** `c:\Users\Prasta Gositus\Documents\questify-backup-v4.0`
- **Zip Archive:** `c:\Users\Prasta Gositus\Documents\questify-backup-v4.0.zip`

---

## Fitur & Pembaruan di Versi 4.0:
1. **Mode Siang & Malam Dinamis (Day/Night Toggle):**
   - Tombol toggle mode terpasang di Navbar Hero Section dengan icon animasi `Sun` & `Moon` serta badge teks status `SIANG` / `MALAM`.
   - **Mode Malam (Default):** Base background `BG1.jpeg`, reveal background `BG2.mp4`, ambient langit bertabur bintang, shooting star, dan bulan sabit.
   - **Mode Siang:** Base background `BG3.jpeg`, reveal background `BG4.mp4`, dengan caustic tint keemasan hangat (warm gold).
   - Pre-load seluruh 4 aset media langsung ke GPU memory untuk transisi instan tanpa buffering atau frame hitam.
   - GLSL Shader lerp cross-dissolve (400ms) untuk transisi halus antar-mode.

2. **Emotion Agency WebGL Fluid Simulation Reveal:**
   - Menggantikan spotlight biasa dengan simulasi dinamika fluida Navier-Stokes WebGL (advection, divergence, pressure Poisson solver, gradient subtraction, vorticity).
   - Efek swirl/pusaran air dinamis yang menyingkap video latar belakang di balik kursor/sentuhan.
   - Dilengkapi chromatic aberration, soft feathered edges, dan interaksi sentuh di layar mobile.

3. **Kursor Interaktif Medieval RPG:**
   - Kursor otomatis tersembunyi (*hidden*) pada kanvas Hero Section agar fokus pada interaksi fluida.
   - Kursor berubah menjadi pedang belati emas (*Medieval Golden Blade*) saat berada di atas tombol, tautan, atau kontrol interaktif.

4. **Penyesuaian Mobile & Layout Hero:**
   - Judul, deskripsi, dan tombol CTA otomatis berada di tengah (*center*) pada layar mobile.
   - Offset latar belakang 20% ke kanan pada layar mobile untuk komposisi visual yang seimbang.

5. **Fitur Lengkap Sebelumnya (v3.0):**
   - Desain warna pastel lembut (tanpa gradasi keras).
   - Tombol kapsul membulat (*rounded-full*).
   - 3D Trophy Room (Three.js), sistem Quest Tracker RPG, Audio FX, dan Supabase Auth/Database.

---

## Cara Restore / Mengembalikan ke Versi Ini:
Jika sewaktu-waktu Anda ingin kembali ke versi ini:
1. Salin isi folder `c:\Users\Prasta Gositus\Documents\questify-backup-v4.0` ke `c:\Users\Prasta Gositus\Documents\questify` (atau ekstrak dari file `questify-backup-v4.0.zip`).
2. Jalankan `npm install` (jika diperlukan pembaharuan dependensi).
3. Jalankan `npm run dev`.
