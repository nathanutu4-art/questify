-- ==============================================================================
-- MISIKU (QUESTIFY) - ADMIN ACCESS & FULL PERMISSIONS MIGRATION SCHEMA
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Pastikan kolom 'role' ada pada tabel public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- 2. Buat fungsi helper is_admin() yang aman (SECURITY DEFINER)
-- Fungsi ini mem-bypass RLS untuk memeriksa apakah user yang sedang login adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(v_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Berikan izin eksekusi ke authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ==============================================================================
-- 3. HAPUS KEBIJAKAN ADMIN LAMA (JIKA ADA) AGAR TIDAK KONFLIK
-- ==============================================================================
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to quests" ON public.quests;
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Admins have full access to badges" ON public.badges;
DROP POLICY IF EXISTS "Admins have full access to user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Admins have full access to user_category_xp" ON public.user_category_xp;

-- ==============================================================================
-- 4. BUAT KEBIJAKAN RLS LENGKAP UNTUK ROLE ADMIN (CRUD KE SELURUH DATA)
-- ==============================================================================

-- A. PROFILES: Admin dapat melihat, mengubah, dan menghapus seluruh profil pengguna
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- B. QUESTS: Admin dapat melihat, menambah, mengubah, dan menghapus seluruh quest semua user
CREATE POLICY "Admins have full access to quests" 
ON public.quests
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- C. CATEGORIES: Admin dapat menambah, mengubah, dan menghapus kategori misi
CREATE POLICY "Admins have full access to categories" 
ON public.categories
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- D. BADGES: Admin dapat menambah, mengubah, dan menghapus lencana & trofi 3D
CREATE POLICY "Admins have full access to badges" 
ON public.badges
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- E. USER_BADGES: Admin dapat melihat dan mengelola lencana petualang
CREATE POLICY "Admins have full access to user_badges" 
ON public.user_badges
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- F. USER_CATEGORY_XP: Admin dapat melihat dan mengelola skill tree semua user
CREATE POLICY "Admins have full access to user_category_xp" 
ON public.user_category_xp
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. CARA MENJADIKAN AKUN ANDA SEBAGAI ADMIN (PILIH SALAH SATU CARA DI BAWAH):
-- ==============================================================================

-- CARA 1 (Paling Mudah): Angkat berdasarkan EMAIL Anda
-- Ganti 'email_anda@domain.com' dengan email yang Anda gunakan saat login di Misiku:
/*
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'email_anda@domain.com'
);
*/

-- CARA 2: Jadikan semua user yang sudah ada saat ini sebagai admin (opsional untuk tahap dev)
-- UPDATE public.profiles SET role = 'admin';

-- ==============================================================================
-- 6. VERIFIKASI HASIL:
-- Jalankan query ini untuk memastikan role admin sudah aktif:
-- SELECT id, username, role, level, total_xp FROM public.profiles;
-- ==============================================================================
