export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Quest {
  id: string;
  user_id?: string;
  category_id?: string;
  title: string;
  description?: string;
  difficulty: QuestDifficulty;
  base_xp: number;
  due_date?: string; // YYYY-MM-DD
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
  category?: Category;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  current_streak: number;
  last_active_date?: string;
  role?: 'user' | 'admin';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category_id?: string | null;
  required_xp: number;
  badge_type: 'crystal' | 'shield' | 'sword' | 'crown' | 'gem';
  color: string;
  is_unlocked?: boolean;
  unlocked_at?: string;
}

export interface UserCategoryXP {
  category_id: string;
  category_name: string;
  xp: number;
  color: string;
}

export interface QuestSuggestion {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  difficulty: QuestDifficulty;
  base_xp: number;
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  category?: Category;
}

