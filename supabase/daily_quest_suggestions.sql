-- ====================================================================
-- Daily Quest Suggestions Schema & Migration for Questify
-- ====================================================================
-- Run this script in your Supabase SQL Editor to enable database 
-- persistence for the Quest Builder feature and Admin Management.
-- ====================================================================

-- 1. Create Daily Quest Suggestions Table
CREATE TABLE IF NOT EXISTS public.daily_quest_suggestions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EPIC')),
    base_xp INTEGER NOT NULL DEFAULT 50,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.daily_quest_suggestions ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent Policy Definitions
DROP POLICY IF EXISTS "Daily quest suggestions are readable by authenticated users" ON public.daily_quest_suggestions;
DROP POLICY IF EXISTS "Admins have full access to daily_quest_suggestions" ON public.daily_quest_suggestions;

-- Allow all authenticated users to read active suggestions
CREATE POLICY "Daily quest suggestions are readable by authenticated users" 
ON public.daily_quest_suggestions
FOR SELECT TO authenticated 
USING (true);

-- Allow admins full access (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins have full access to daily_quest_suggestions" 
ON public.daily_quest_suggestions
FOR ALL TO authenticated 
USING (public.is_admin());

-- 4. Grant Permissions
GRANT ALL ON public.daily_quest_suggestions TO authenticated;
GRANT ALL ON public.daily_quest_suggestions TO service_role;

-- 5. Seed Initial Curated Suggestions (19 Activities)
INSERT INTO public.daily_quest_suggestions (
    id, title, description, category_id, difficulty, base_xp, tags, is_active
) VALUES
    -- Kesehatan (Health)
    ('sug-health-1', 'Minum 2 Liter Air Putih (Potion of Hydration)', 'Penuhi asupan cairan tubuh dengan meminum minimal 8 gelas atau 2 liter air putih segar sepanjang hari.', 'health', 'EASY', 50, ARRAY['hidrasi', 'kesehatan', 'kebiasaan'], true),
    ('sug-health-2', 'Latihan Fisik / Gym 45 Menit (Warrior Training)', 'Lakukan olahraga kardio, kalistenik, atau angkat beban minimal 45 menit untuk menempa ketahanan fisik.', 'health', 'MEDIUM', 100, ARRAY['olahraga', 'kebugaran', 'gym'], true),
    ('sug-health-3', 'Tidur Berkualitas 8 Jam (Deep Slumber Rest)', 'Matikan layar gadget 30 menit sebelum tidur dan dapatkan istirahat optimal selama 7-8 jam penuh.', 'health', 'MEDIUM', 100, ARRAY['tidur', 'recovery', 'kesehatan'], true),
    ('sug-health-4', 'Jalan Kaki 10.000 Langkah (Ranger Expedition)', 'Jelajahi langkah kakimu di luar ruangan atau treadmill hingga mencapai target 10.000 langkah harian.', 'health', 'HARD', 150, ARRAY['kardio', 'langkah', 'outdoor'], true),
    
    -- Pekerjaan (Work)
    ('sug-work-1', 'Review & Bersihkan Inbox Email (Clear the Mess)', 'Sortir dan proses email masuk penting, arsipkan pesan usang, dan capai status Inbox Zero.', 'work', 'EASY', 50, ARRAY['email', 'inbox-zero', 'organisir'], true),
    ('sug-work-2', 'Deep Work 90 Menit Tanpa Distraksi (Arcane Focus)', 'Blokir semua notifikasi media sosial dan selesaikan tugas paling rumit dengan konsentrasi penuh.', 'work', 'MEDIUM', 100, ARRAY['fokus', 'produktivitas', 'deep-work'], true),
    ('sug-work-3', 'Tuntaskan Deliverable Proyek Utama (Conquer the Task)', 'Kirimkan tugas besar atau serahkan laporan penting proyek ke tim atau klien hari ini.', 'work', 'HARD', 150, ARRAY['proyek', 'tugas-utama', 'deliverable'], true),
    ('sug-work-4', 'Rencanakan Prioritas Esok Hari (Tactical Blueprint)', 'Catat 3 prioritas mutlak yang harus dituntaskan esok pagi sebelum hari ini berakhir.', 'work', 'EASY', 50, ARRAY['rencana', 'prioritas', 'evaluasi'], true),
    
    -- Edukasi (Education)
    ('sug-edu-1', 'Membaca Buku Non-Fiksi 20 Halaman (Tome of Wisdom)', 'Dapatkan wawasan berharga dari buku pengembangan diri, sains, kepemimpinan, atau teknologi.', 'education', 'EASY', 50, ARRAY['literasi', 'buku', 'pengembangan-diri'], true),
    ('sug-edu-2', 'Belajar Kosakata / Bahasa Asing 15 Menit (Linguist Scroll)', 'Latih aplikasi bahasa atau hafalkan 10 kosakata baru untuk memperkaya kemampuan berbahasa.', 'education', 'EASY', 50, ARRAY['bahasa', 'kosakata', 'duolingo'], true),
    ('sug-edu-3', 'Selesaikan 1 Modul Kursus / Tutorial (Scholar Enlightenment)', 'Tonton video materi dan kerjakan kuis latihan dari platform pembelajaran yang sedang kamu ikuti.', 'education', 'MEDIUM', 100, ARRAY['kursus', 'online-learning', 'skill'], true),
    ('sug-edu-4', 'Coding / Problem Solving 60 Menit (Spellcraft Mastery)', 'Selesaikan setidaknya 2 soal algoritma di LeetCode/Codewars atau buat fitur baru pada proyek coding.', 'education', 'HARD', 150, ARRAY['coding', 'leetcode', 'algoritma'], true),
    
    -- Pribadi (Personal)
    ('sug-personal-1', 'Merapikan Meja Kerja & Kamar (Domain Sanctuary)', 'Bersihkan debu, rapikan kabel, dan atur lingkungan sekitarmu agar pikiran terasa lebih jernih.', 'personal', 'EASY', 50, ARRAY['kebersihan', 'ruang-kerja', 'declutter'], true),
    ('sug-personal-2', 'Meditasi / Jurnal Refleksi Diri 10 Menit (Soul Calming)', 'Duduk tenang dalam hening, atur nafas meditatif, atau tuliskan rasa syukur di buku catatanmu.', 'personal', 'EASY', 50, ARRAY['mindfulness', 'meditasi', 'jurnal'], true),
    ('sug-personal-3', 'Digital Detox 2 Jam Sebelum Tidur (Shield of Peace)', 'Jauhkan ponsel dan media sosial. Luangkan waktu untuk mengobrol santai, membaca, atau hobi santai.', 'personal', 'MEDIUM', 100, ARRAY['detox', 'kesehatan-mental', 'gadget-free'], true),
    
    -- Keuangan (Finance)
    ('sug-finance-1', 'Audit Pengeluaran Harian & Catat Struk (Vault Inspection)', 'Catat semua transaksi masuk dan keluar hari ini ke aplikasi keuangan atau buku kas pribadi.', 'finance', 'EASY', 50, ARRAY['budgeting', 'catatan-keuangan', 'struk'], true),
    ('sug-finance-2', 'No Spend Day - Masak Makanan Sendiri (Frugal Discipline)', 'Tantang dirimu untuk tidak mengeluarkan uang konsumtif dan nikmati masakan lezat buatan sendiri.', 'finance', 'MEDIUM', 100, ARRAY['hemat', 'memasak', 'no-spend'], true),
    ('sug-finance-3', 'Alokasikan Dana Tabungan / Investasi (Treasury Vault)', 'Pindahkan sebagian pendapatan ke pos tabungan darurat, deposito, atau reksadana/saham.', 'finance', 'HARD', 150, ARRAY['investasi', 'tabungan', 'aset'], true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    difficulty = EXCLUDED.difficulty,
    base_xp = EXCLUDED.base_xp,
    tags = EXCLUDED.tags,
    is_active = EXCLUDED.is_active;

