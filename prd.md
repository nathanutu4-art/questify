# Product Requirements Document (PRD)
**Nama Produk:** Questify (Nama Sementara)
**Platform:** Web Application (Responsive Desktop & Mobile)
**Status Dokumen:** Approved for Development (Iterasi 1)

## 1. Ringkasan Eksekutif
Aplikasi ini adalah platform manajemen tugas (to-do list) yang dirancang untuk mengubah rutinitas sehari-hari menjadi petualangan berbasis *Role-Playing Game* (RPG). Dengan mengadaptasi mekanik permainan seperti "Quest", *Experience Points* (XP), Level, dan *Badges*, aplikasi ini bertujuan untuk menyelesaikan masalah kurangnya motivasi dalam menyelesaikan daftar pekerjaan harian.

## 2. Tujuan & Metrik Keberhasilan (KPIs)
*   **Daily Active Users (DAU):** Mempertahankan pengguna untuk login setiap hari guna menjaga *streak* harian.
*   **Task Completion Rate:** Meningkatkan persentase tugas yang diselesaikan tepat waktu.
*   **Badge Unlock Rate:** Rata-rata *badge* yang berhasil dikumpulkan pengguna dalam 30 hari pertama untuk mengukur tingkat *engagement*.

## 3. Arsitektur & Tech Stack
Proyek ini akan dikembangkan dan dijalankan pada ekosistem AntiGravity dengan *stack* modern:
*   **Frontend:** Next.js (App Router), React, Tailwind CSS.
*   **Animasi & Interaksi:** Framer Motion (UI micro-interactions), React Three Fiber / Three.js (3D Badge Rendering).
*   **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security, Real-time Subscriptions).
*   **Deployment:** PM2 / Nginx (via AntiGravity environment).

## 4. Fitur Utama (Core Features)

### A. Quest Management (Sistem Manajemen Tugas)
*   **Misi Harian (Daily Quests):** Daftar tugas yang difilter khusus untuk *deadline* hari ini.
*   **Pembuatan Quest:** Pengguna dapat membuat tugas dengan parameter: Judul, Deskripsi, Kategori, Tingkat Kesulitan (Menentukan base XP), dan Tenggat Waktu.
*   **Sistem Selesai (Quest Completion):** Saat tugas ditandai selesai, sistem memicu animasi *reward* dan kalkulasi poin.

### B. Gamification Engine (Mesin Progresi)
*   **Kalkulasi XP & Level:** Total akumulasi XP akan menaikkan level pengguna secara keseluruhan (misal: Level 1 -> Level 2).
*   **Kategori XP (Skill Tree):** XP juga dilacak secara spesifik berdasarkan kategori (Contoh: Pekerjaan, Kesehatan, Edukasi) untuk membentuk "Status Pemain" ala RPG.
*   **Sistem Streak:** Login harian atau penyelesaian Misi Harian secara beruntun memberikan *multiplier* pada XP yang didapatkan.

### C. Achievement & Badge System (Trophy Room)
*   **Lencana Kondisional:** Sistem mengecek secara otomatis (*via Database Triggers*) saat XP Kategori tertentu mencapai ambang batas, lalu membuka akses ke lencana baru.
*   **Trophy Room 3D:** Halaman khusus tempat pengguna bisa melihat lencana yang terkunci dan terbuka, dirender sebagai objek 3D interaktif yang bisa diputar (drag/scroll).

## 5. Skema Database (Supabase / PostgreSQL)

1.  **`users`**: Ekstensi `auth.users`. Menyimpan `username`, `total_xp`, `level`, dan `current_streak`.
2.  **`categories`**: Tabel referensi statis untuk kategori (Pekerjaan, Kesehatan, dll).
3.  **`quests`**: Tabel to-do list. Menyimpan tugas, `difficulty`, `base_xp`, tenggat waktu, dan relasi ke `category_id`.
4.  **`user_category_xp`**: Menyimpan total XP secara spesifik untuk kombinasi unik `user_id` dan `category_id`.
5.  **`badges`**: Definisi lencana dan syarat batas `required_xp` pada `category_id` tertentu.
6.  **`user_badges`**: Tabel relasi *many-to-many* yang mencatat lencana apa saja yang sudah dimiliki oleh *user*.

## 6. Antarmuka & Pengalaman Pengguna (UI/UX)
*   **Tema Visual:** *Dark Mode* / *Modern RPG* (Dominasi warna gelap *slate/navy* dengan aksen neon seperti *cyan*, *emerald*, dan ungu).
*   **Top Navigation:** Berisi profil, status *Level* beserta *progress bar*, ikon *Streak*, dan tombol aksi "+ Buat Quest".
*   **Kolom Kiri (Quest Board):** Menampilkan daftar tugas dalam bentuk *card* interaktif. Kartu memiliki *hover state* yang dinamis dan terhubung dengan *Framer Motion* untuk animasi selesai.
*   **Kolom Kanan (Player Stats):** Menampilkan *Radar Chart* untuk visualisasi XP per kategori dan *Trophy Room Preview* (menampilkan 3 lencana 3D terakhir yang didapatkan).

## 7. Fase Pengembangan (Roadmap)
*   **Phase 1 (MVP):** Autentikasi Supabase, CRUD Misi Harian, Skema *Database* dasar, Kalkulasi total XP statis.
*   **Phase 2:** Implementasi kalkulasi *Category XP*, *Badge System*, dan animasi UI (Framer Motion).
*   **Phase 3:** Integrasi 3D *Rendering* (Three.js) untuk lencana dan optimalisasi performa *real-time* dengan Supabase Subscriptions.