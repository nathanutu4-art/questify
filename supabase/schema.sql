-- Questify Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Profiles / Users table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'Adventurer',
    avatar_url TEXT,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration query if profiles table already exists:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL, -- hex or tailwind neon color
    description TEXT
);

-- Seed initial categories
INSERT INTO public.categories (id, name, icon, color, description) VALUES
    ('work', 'Pekerjaan', 'Briefcase', '#38bdf8', 'Tugas karir, proyek, dan pekerjaan profesional'),
    ('health', 'Kesehatan', 'HeartPulse', '#10b981', 'Olahraga, nutrisi, hidrasi, dan pola hidup sehat'),
    ('education', 'Edukasi', 'GraduationCap', '#a855f7', 'Belajar skill baru, membaca buku, dan kursus'),
    ('personal', 'Pribadi', 'User', '#f59e0b', 'Kebersihan, hobi, dan manajemen diri'),
    ('finance', 'Keuangan', 'Coins', '#ec4899', 'Budgeting, investasi, dan pengeluaran')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description;

-- 3. Quests table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EPIC')),
    base_xp INTEGER NOT NULL DEFAULT 50,
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Category XP (Skill Tree)
CREATE TABLE IF NOT EXISTS public.user_category_xp (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, category_id)
);

-- 5. Badges definition
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    required_xp INTEGER NOT NULL,
    badge_type TEXT NOT NULL DEFAULT 'shield', -- 'crystal', 'shield', 'sword', 'crown', 'gem'
    color TEXT NOT NULL DEFAULT '#38bdf8',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed badges
INSERT INTO public.badges (id, name, description, category_id, required_xp, badge_type, color) VALUES
    ('first_step', 'Langkah Pertama', 'Selesaikan quest pertamamu', NULL, 50, 'crystal', '#38bdf8'),
    ('work_initiate', 'Apprentice Worker', 'Kumpulkan 150 XP di Kategori Pekerjaan', 'work', 150, 'sword', '#0284c7'),
    ('work_master', 'Grand Architect', 'Kumpulkan 500 XP di Kategori Pekerjaan', 'work', 500, 'crown', '#38bdf8'),
    ('health_scout', 'Vitality Seeker', 'Kumpulkan 150 XP di Kategori Kesehatan', 'health', 150, 'shield', '#059669'),
    ('health_titan', 'Iron Body', 'Kumpulkan 500 XP di Kategori Kesehatan', 'health', 500, 'gem', '#10b981'),
    ('edu_scholar', 'Arcane Scholar', 'Kumpulkan 150 XP di Kategori Edukasi', 'education', 150, 'crystal', '#7c3aed'),
    ('edu_sage', 'Omniscient Sage', 'Kumpulkan 500 XP di Kategori Edukasi', 'education', 500, 'crown', '#c084fc'),
    ('quest_master', 'Legendary Adventurer', 'Capai Total 1000 XP', NULL, 1000, 'crown', '#fbbf24')
ON CONFLICT (id) DO NOTHING;

-- 6. User Badges (Unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_category_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Helper function to check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by owner" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin());

-- Policies for categories
CREATE POLICY "Categories are readable by everyone authenticated" ON public.categories
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins have full access to categories" ON public.categories
    FOR ALL TO authenticated USING (public.is_admin());

-- Policies for quests
CREATE POLICY "Users can view their own quests" ON public.quests
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quests" ON public.quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quests" ON public.quests
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quests" ON public.quests
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to quests" ON public.quests
    FOR ALL TO authenticated USING (public.is_admin());

-- Policies for user_category_xp
CREATE POLICY "Users can view their own category xp" ON public.user_category_xp
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify their own category xp" ON public.user_category_xp
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to user_category_xp" ON public.user_category_xp
    FOR ALL TO authenticated USING (public.is_admin());

-- Policies for badges
CREATE POLICY "Badges are viewable by everyone" ON public.badges
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins have full access to badges" ON public.badges
    FOR ALL TO authenticated USING (public.is_admin());

-- Policies for user_badges
CREATE POLICY "Users can view their unlocked badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock their badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins have full access to user_badges" ON public.user_badges
    FOR ALL TO authenticated USING (public.is_admin());

-- Function & Trigger: Automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, total_xp, level, current_streak)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'Adventurer'),
        new.raw_user_meta_data->>'avatar_url',
        0,
        1,
        1
    );

    -- Initialize category XP rows for user
    INSERT INTO public.user_category_xp (user_id, category_id, xp)
    SELECT new.id, id, 0 FROM public.categories;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to complete quest and reward XP + badges
CREATE OR REPLACE FUNCTION public.complete_quest(quest_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_base_xp INTEGER;
    v_cat_id TEXT;
    v_is_completed BOOLEAN;
    v_new_total_xp INTEGER;
    v_new_level INTEGER;
    v_new_cat_xp INTEGER;
    v_unlocked_badges TEXT[] := ARRAY[]::TEXT[];
    r_badge RECORD;
BEGIN
    -- Verify quest belongs to user and is not already completed
    SELECT user_id, base_xp, category_id, is_completed
    INTO v_user_id, v_base_xp, v_cat_id, v_is_completed
    FROM public.quests
    WHERE id = quest_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quest not found or unauthorized';
    END IF;

    IF v_is_completed THEN
        RETURN jsonb_build_object('success', false, 'message', 'Quest already completed');
    END IF;

    -- Mark quest completed
    UPDATE public.quests
    SET is_completed = true,
        completed_at = timezone('utc'::text, now())
    WHERE id = quest_id;

    -- Update user total XP and Level
    -- Level curve: Level 1 = 0-99 XP, Level 2 = 100-249 XP, Level 3 = 250-449 XP, etc. (Floor(sqrt(total_xp / 50)) + 1)
    UPDATE public.profiles
    SET total_xp = total_xp + v_base_xp,
        level = GREATEST(1, FLOOR(SQRT((total_xp + v_base_xp) / 50))::INTEGER + 1),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id
    RETURNING total_xp, level INTO v_new_total_xp, v_new_level;

    -- Update category XP if category is present
    IF v_cat_id IS NOT NULL THEN
        INSERT INTO public.user_category_xp (user_id, category_id, xp)
        VALUES (v_user_id, v_cat_id, v_base_xp)
        ON CONFLICT (user_id, category_id)
        DO UPDATE SET xp = public.user_category_xp.xp + v_base_xp
        RETURNING xp INTO v_new_cat_xp;
    END IF;

    -- Check badge unlock conditions
    -- 1. First quest badge
    IF NOT EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = v_user_id AND badge_id = 'first_step') THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (v_user_id, 'first_step');
        v_unlocked_badges := array_append(v_unlocked_badges, 'first_step');
    END IF;

    -- 2. Category / Total XP badges
    FOR r_badge IN 
        SELECT b.id, b.required_xp, b.category_id 
        FROM public.badges b
        LEFT JOIN public.user_badges ub ON ub.badge_id = b.id AND ub.user_id = v_user_id
        WHERE ub.id IS NULL
    LOOP
        IF r_badge.category_id IS NULL AND v_new_total_xp >= r_badge.required_xp THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (v_user_id, r_badge.id);
            v_unlocked_badges := array_append(v_unlocked_badges, r_badge.id);
        ELSIF r_badge.category_id = v_cat_id AND v_new_cat_xp >= r_badge.required_xp THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (v_user_id, r_badge.id);
            v_unlocked_badges := array_append(v_unlocked_badges, r_badge.id);
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'xp_gained', v_base_xp,
        'total_xp', v_new_total_xp,
        'level', v_new_level,
        'category_xp', v_new_cat_xp,
        'unlocked_badges', v_unlocked_badges
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

