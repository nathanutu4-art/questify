'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Quest, Category, Badge, UserProfile, UserCategoryXP, QuestSuggestion } from '@/types/quest';
import { INITIAL_CATEGORIES, INITIAL_BADGES, INITIAL_SUGGESTIONS } from '@/lib/data/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

interface QuestContextType {
  user: User | null;
  isLoadingAuth: boolean;
  quests: Quest[];
  categories: Category[];
  badges: Badge[];
  suggestions: QuestSuggestion[];
  isLoadingSuggestions: boolean;
  profile: UserProfile;
  categoryXPList: UserCategoryXP[];
  isConfigured: boolean;
  addQuest: (quest: Omit<Quest, 'id' | 'is_completed' | 'created_at'>) => Promise<void>;
  addQuestFromSuggestion: (suggestion: QuestSuggestion, dueDate?: string) => Promise<void>;
  addMultipleQuestsFromSuggestions: (suggestions: QuestSuggestion[], dueDate?: string) => Promise<number>;
  reloadSuggestions: () => Promise<void>;
  completeQuest: (id: string) => Promise<{ xpGained: number; newBadges: Badge[]; levelUp: boolean }>;
  deleteQuest: (id: string) => Promise<void>;
  updateProfile: (data: { username: string; avatar_url: string }) => Promise<void>;
  signOut: () => Promise<void>;
  recentUnlockedBadge: Badge | null;
  setRecentUnlockedBadge: (badge: Badge | null) => void;
  levelUpNotification: { oldLevel: number; newLevel: number } | null;
  setLevelUpNotification: (val: { oldLevel: number; newLevel: number } | null) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  username: 'Petualang',
  avatar_url: '',
  total_xp: 0,
  level: 1,
  current_streak: 1,
  last_active_date: new Date().toISOString().split('T')[0],
  role: 'user',
};

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [suggestions, setSuggestions] = useState<QuestSuggestion[]>(INITIAL_SUGGESTIONS);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [recentUnlockedBadge, setRecentUnlockedBadge] = useState<Badge | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<{ oldLevel: number; newLevel: number } | null>(null);

  // Load daily quest suggestions from Supabase (fallback to INITIAL_SUGGESTIONS)
  const loadSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    if (!isSupabaseConfigured || !supabase) {
      setSuggestions(INITIAL_SUGGESTIONS);
      setIsLoadingSuggestions(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_quest_suggestions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: QuestSuggestion[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category_id: item.category_id,
          difficulty: item.difficulty,
          base_xp: item.base_xp,
          tags: item.tags || [],
          is_active: item.is_active,
          category: categories.find((c) => c.id === item.category_id),
        }));
        setSuggestions(mapped);
      } else {
        setSuggestions(INITIAL_SUGGESTIONS);
      }
    } catch (err) {
      console.warn('Error loading suggestions from Supabase:', err);
      setSuggestions(INITIAL_SUGGESTIONS);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [categories]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  // Load user data strictly for the logged-in user
  const loadUserData = useCallback(async (currentUser: User) => {
    if (!supabase) return;

    try {
      // Helper timeout supporting Supabase thenable PostgrestBuilder
      const queryTimeout = async <T,>(p: PromiseLike<T>, ms = 2500): Promise<T> => {
        return Promise.race([
          Promise.resolve(p),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Query timeout')), ms)),
        ]);
      };

      // 1. Fetch Profile from Supabase
      const profileRes: any = await queryTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()
      ).catch(() => ({ data: null }));

      const profileData = profileRes?.data;

      if (profileData) {
        setProfile({
          id: profileData.id,
          username: profileData.username || currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Petualang',
          avatar_url: profileData.avatar_url || '',
          total_xp: profileData.total_xp ?? 0,
          level: profileData.level ?? 1,
          current_streak: profileData.current_streak ?? 1,
          last_active_date: profileData.last_active_date,
          role: (profileData.role as 'user' | 'admin') || 'user',
        });
      } else {
        // Fallback: Create initial profile if trigger has not created it
        const initialName = currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Petualang';
        const newProfileRow = {
          id: currentUser.id,
          username: initialName,
          total_xp: 0,
          level: 1,
          current_streak: 1,
          avatar_url: '',
          last_active_date: new Date().toISOString().split('T')[0],
          role: 'user' as const,
        };

        queryTimeout(supabase.from('profiles').upsert(newProfileRow), 2000).catch(() => {});
        setProfile(newProfileRow);
      }

      // 2. Fetch Quests ONLY for this user
      const questRes: any = await queryTimeout(
        supabase
          .from('quests')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false }),
        2500
      ).catch(() => ({ data: null }));

      const questData = questRes?.data;

      if (questData) {
        const mappedQuests: Quest[] = questData.map((q: any) => ({
          id: q.id,
          user_id: q.user_id,
          title: q.title,
          description: q.description,
          category_id: q.category_id,
          difficulty: q.difficulty,
          base_xp: q.base_xp,
          due_date: q.due_date,
          is_completed: q.is_completed,
          completed_at: q.completed_at,
          created_at: q.created_at,
          category: categories.find((c) => c.id === q.category_id),
        }));
        setQuests(mappedQuests);
      }

      // 3. Fetch unlocked user badges
      const userBadgesRes: any = await queryTimeout(
        supabase
          .from('user_badges')
          .select('badge_id, unlocked_at')
          .eq('user_id', currentUser.id),
        2000
      ).catch(() => ({ data: null }));

      if (userBadgesRes?.data) {
        const unlockedMap = new Map<string, string>();
        userBadgesRes.data.forEach((ub: any) => {
          if (ub?.badge_id) {
            unlockedMap.set(String(ub.badge_id), String(ub.unlocked_at || ''));
          }
        });
        setBadges((prev) =>
          prev.map((b) => ({
            ...b,
            is_unlocked: unlockedMap.has(b.id),
            unlocked_at: unlockedMap.get(b.id) || b.unlocked_at,
          }))
        );
      }
    } catch (err) {
      console.warn('Error loading user data from Supabase:', err);
    }
  }, [categories]);

  // Listen to Supabase Auth State with strict safety timeout for mobile networks
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;

    // Safety fallback: Never keep the user waiting for more than 2 seconds
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingAuth(false);
      }
    }, 2000);

    // Check active session on initial mount
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user).catch((e) => console.warn(e));
        } else {
          setUser(null);
          setQuests([]);
          setProfile(DEFAULT_PROFILE);
        }
      })
      .catch((err) => {
        console.warn('supabase getSession failed:', err);
      })
      .finally(() => {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsLoadingAuth(false);
        }
      });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadUserData(session.user).catch((e) => console.warn(e));
      } else {
        setUser(null);
        setQuests([]);
        setProfile(DEFAULT_PROFILE);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Compute category XP dynamically based on completed quests of current user
  const categoryXPList = useMemo<UserCategoryXP[]>(() => {
    return categories.map((cat) => {
      const xp = quests
        .filter((q) => q.is_completed && q.category_id === cat.id)
        .reduce((sum, q) => sum + (q.base_xp || 0), 0);
      return {
        category_id: cat.id,
        category_name: cat.name,
        xp,
        color: cat.color,
      };
    });
  }, [quests, categories]);

  // Add a new quest for the active user (with optimistic update and demo support)
  const addQuest = async (questData: Omit<Quest, 'id' | 'is_completed' | 'created_at'>) => {
    const category = categories.find((c) => c.id === questData.category_id);
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const localQuest: Quest = {
      ...questData,
      id: tempId,
      user_id: user?.id || 'demo-user',
      is_completed: false,
      created_at: new Date().toISOString(),
      category,
    };

    // Optimistic UI update
    setQuests((prev) => [localQuest, ...prev]);

    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('quests')
        .insert({
          user_id: user.id,
          title: questData.title,
          description: questData.description,
          category_id: questData.category_id,
          difficulty: questData.difficulty,
          base_xp: questData.base_xp,
          due_date: questData.due_date,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setQuests((prev) =>
          prev.map((q) => (q.id === tempId ? { ...q, id: data.id, created_at: data.created_at } : q))
        );
      }
    } catch (err) {
      console.error('Failed to insert quest in Supabase:', err);
    }
  };

  // Add a single quest from a suggestion template
  const addQuestFromSuggestion = async (suggestion: QuestSuggestion, dueDate?: string) => {
    const targetDate = dueDate || new Date().toISOString().split('T')[0];
    await addQuest({
      title: suggestion.title,
      description: suggestion.description || '',
      category_id: suggestion.category_id,
      difficulty: suggestion.difficulty,
      base_xp: suggestion.base_xp,
      due_date: targetDate,
    });
  };

  // Add multiple quests in batch from suggestions
  const addMultipleQuestsFromSuggestions = async (
    suggestionsList: QuestSuggestion[],
    dueDate?: string
  ): Promise<number> => {
    const targetDate = dueDate || new Date().toISOString().split('T')[0];
    let count = 0;
    for (const sug of suggestionsList) {
      await addQuest({
        title: sug.title,
        description: sug.description || '',
        category_id: sug.category_id,
        difficulty: sug.difficulty,
        base_xp: sug.base_xp,
        due_date: targetDate,
      });
      count++;
    }
    return count;
  };

  // Reload suggestions from Supabase (for admin sync or user refresh)
  const reloadSuggestions = async () => {
    await loadSuggestions();
  };

  // Complete a quest and update final XP to user profile in Supabase
  const completeQuest = async (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.is_completed || !user || !supabase) {
      return { xpGained: 0, newBadges: [], levelUp: false };
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#10b981', '#a855f7', '#fbbf24'],
      });
    } catch (e) {}

    // Multiplier & Final XP calculation
    const streakMultiplier = 1 + (profile.current_streak * 0.05);
    const finalXPGained = Math.round(quest.base_xp * streakMultiplier);
    const newTotalXP = profile.total_xp + finalXPGained;
    const oldLevel = profile.level;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newTotalXP / 50)) + 1);
    const isLevelUp = newLevel > oldLevel;
    const newStreak = profile.current_streak + 1;
    const today = new Date().toISOString().split('T')[0];

    // 1. Optimistic local state update
    const updatedQuests = quests.map((q) =>
      q.id === id ? { ...q, is_completed: true, completed_at: new Date().toISOString() } : q
    );
    setQuests(updatedQuests);

    const updatedProfile: UserProfile = {
      ...profile,
      total_xp: newTotalXP,
      level: newLevel,
      current_streak: newStreak,
      last_active_date: today,
    };
    setProfile(updatedProfile);

    if (isLevelUp) {
      setLevelUpNotification({ oldLevel, newLevel });
    }

    // 2. Check Badge unlocks
    const newUnlockedBadges: Badge[] = [];
    const updatedBadges = badges.map((b) => {
      if (b.is_unlocked) return b;

      let shouldUnlock = false;
      if (b.id === 'first_step') {
        shouldUnlock = true;
      } else if (!b.category_id && newTotalXP >= b.required_xp) {
        shouldUnlock = true;
      } else if (b.category_id && b.category_id === quest.category_id) {
        const catXP = updatedQuests
          .filter((q) => q.is_completed && q.category_id === b.category_id)
          .reduce((sum, q) => sum + q.base_xp, 0);
        if (catXP >= b.required_xp) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        const unlockedBadge = { ...b, is_unlocked: true, unlocked_at: new Date().toISOString() };
        newUnlockedBadges.push(unlockedBadge);
        return unlockedBadge;
      }
      return b;
    });

    setBadges(updatedBadges);
    if (newUnlockedBadges.length > 0) {
      setRecentUnlockedBadge(newUnlockedBadges[0]);
    }

    // 3. Persist directly to Supabase
    try {
      // Update quest record
      await supabase
        .from('quests')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      // Update user profile total_xp, level, and streak
      await supabase
        .from('profiles')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          current_streak: newStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Persist newly unlocked badges
      for (const b of newUnlockedBadges) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: b.id,
          })
          .maybeSingle();
      }
    } catch (err) {
      console.error('Error syncing completed quest to Supabase:', err);
    }

    return {
      xpGained: finalXPGained,
      newBadges: newUnlockedBadges,
      levelUp: isLevelUp,
    };
  };

  // Delete quest from user's quest list and Supabase
  const deleteQuest = async (id: string) => {
    if (!user || !supabase) return;

    setQuests((prev) => prev.filter((q) => q.id !== id));

    try {
      await supabase
        .from('quests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  };

  // Update username and avatar in Supabase profiles and local state
  const updateProfile = async (data: { username: string; avatar_url: string }) => {
    if (!user || !supabase) return;

    // Update local state
    setProfile((prev) => ({
      ...prev,
      username: data.username,
      avatar_url: data.avatar_url,
    }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update profile in Supabase:', err);
      throw err;
    }
  };

  // Sign out user
  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setQuests([]);
      setProfile(DEFAULT_PROFILE);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  return (
    <QuestContext.Provider
      value={{
        user,
        isLoadingAuth,
        quests,
        categories,
        badges,
        suggestions,
        isLoadingSuggestions,
        profile,
        categoryXPList,
        isConfigured: isSupabaseConfigured,
        addQuest,
        addQuestFromSuggestion,
        addMultipleQuestsFromSuggestions,
        reloadSuggestions,
        completeQuest,
        deleteQuest,
        updateProfile,
        signOut,
        recentUnlockedBadge,
        setRecentUnlockedBadge,
        levelUpNotification,
        setLevelUpNotification,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
}
