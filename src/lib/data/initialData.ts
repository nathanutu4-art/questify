import { Category, Quest, Badge, UserProfile } from '@/types/quest';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'work',
    name: 'Pekerjaan',
    icon: 'Briefcase',
    color: '#38bdf8', // Neon Sky Blue
    description: 'Tugas karir, proyek, dan pekerjaan profesional',
  },
  {
    id: 'health',
    name: 'Kesehatan',
    icon: 'HeartPulse',
    color: '#10b981', // Neon Emerald
    description: 'Olahraga, nutrisi, hidrasi, dan pola hidup sehat',
  },
  {
    id: 'education',
    name: 'Edukasi',
    icon: 'GraduationCap',
    color: '#a855f7', // Neon Purple
    description: 'Belajar skill baru, membaca buku, dan kursus',
  },
  {
    id: 'personal',
    name: 'Pribadi',
    icon: 'User',
    color: '#f59e0b', // Neon Amber
    description: 'Kebersihan, hobi, dan manajemen diri',
  },
  {
    id: 'finance',
    name: 'Keuangan',
    icon: 'Coins',
    color: '#ec4899', // Neon Pink
    description: 'Budgeting, investasi, dan pengeluaran',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'Langkah Pertama',
    description: 'Selesaikan quest pertamamu',
    category_id: null,
    required_xp: 50,
    badge_type: 'crystal',
    color: '#38bdf8',
    is_unlocked: true,
  },
  {
    id: 'work_initiate',
    name: 'Apprentice Worker',
    description: 'Kumpulkan 150 XP di Kategori Pekerjaan',
    category_id: 'work',
    required_xp: 150,
    badge_type: 'sword',
    color: '#0284c7',
    is_unlocked: false,
  },
  {
    id: 'work_master',
    name: 'Grand Architect',
    description: 'Kumpulkan 500 XP di Kategori Pekerjaan',
    category_id: 'work',
    required_xp: 500,
    badge_type: 'crown',
    color: '#38bdf8',
    is_unlocked: false,
  },
  {
    id: 'health_scout',
    name: 'Vitality Seeker',
    description: 'Kumpulkan 150 XP di Kategori Kesehatan',
    category_id: 'health',
    required_xp: 150,
    badge_type: 'shield',
    color: '#059669',
    is_unlocked: false,
  },
  {
    id: 'health_titan',
    name: 'Iron Body',
    description: 'Kumpulkan 500 XP di Kategori Kesehatan',
    category_id: 'health',
    required_xp: 500,
    badge_type: 'gem',
    color: '#10b981',
    is_unlocked: false,
  },
  {
    id: 'edu_scholar',
    name: 'Arcane Scholar',
    description: 'Kumpulkan 150 XP di Kategori Edukasi',
    category_id: 'education',
    required_xp: 150,
    badge_type: 'crystal',
    color: '#7c3aed',
    is_unlocked: false,
  },
  {
    id: 'edu_sage',
    name: 'Omniscient Sage',
    description: 'Kumpulkan 500 XP di Kategori Edukasi',
    category_id: 'education',
    required_xp: 500,
    badge_type: 'crown',
    color: '#c084fc',
    is_unlocked: false,
  },
  {
    id: 'quest_master',
    name: 'Legendary Adventurer',
    description: 'Capai Total 1000 XP',
    category_id: null,
    required_xp: 1000,
    badge_type: 'crown',
    color: '#fbbf24',
    is_unlocked: false,
  },
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Selesaikan Desain UI Questify',
    description: 'Rancang tampilan Dark Mode RPG dengan aksen neon untuk dashboard utama.',
    category_id: 'work',
    difficulty: 'HARD',
    base_xp: 150,
    due_date: today,
    is_completed: false,
    category: INITIAL_CATEGORIES[0],
  },
  {
    id: 'q2',
    title: 'Jogging Pagi 30 Menit',
    description: 'Jaga stamina dan kebugaran tubuh sebelum memulai coding.',
    category_id: 'health',
    difficulty: 'MEDIUM',
    base_xp: 100,
    due_date: today,
    is_completed: false,
    category: INITIAL_CATEGORIES[1],
  },
  {
    id: 'q3',
    title: 'Pelajari Supabase Row Level Security (RLS)',
    description: 'Baca dokumentasi resmi dan pahami implementasi auth policy.',
    category_id: 'education',
    difficulty: 'EASY',
    base_xp: 50,
    due_date: today,
    is_completed: true,
    completed_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[2],
  },
  {
    id: 'q4',
    title: 'Catat Pengeluaran Mingguan',
    description: 'Audit budget dan sinkronkan mutasi tabungan.',
    category_id: 'finance',
    difficulty: 'EASY',
    base_xp: 50,
    due_date: today,
    is_completed: false,
    category: INITIAL_CATEGORIES[4],
  },
];

export const INITIAL_PROFILE: UserProfile = {
  id: 'adventurer-1',
  username: 'ShadowKnight',
  avatar_url: '',
  total_xp: 50,
  level: 1,
  current_streak: 3,
  last_active_date: today,
};

