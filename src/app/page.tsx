'use client';

import React, { useState, useEffect } from 'react';
import { QuestProvider, useQuest } from '@/lib/store/QuestContext';
import { Navbar } from '@/components/layout/Navbar';
import { QuestBoard } from '@/components/quests/QuestBoard';
import { PlayerStats } from '@/components/gamification/PlayerStats';
import { CreateQuestModal } from '@/components/quests/CreateQuestModal';
import { QuestBuilderModal } from '@/components/quests/QuestBuilderModal';
import { TrophyRoomModal } from '@/components/trophy/TrophyRoomModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { HeroSection } from '@/components/landing/HeroSection';
import InteractiveStoneBackground from '@/components/ui/interactive-stone-bg';
import { Shield, RotateCw } from 'lucide-react';

function AppContent() {
  const { user, isLoadingAuth, badges, signOut } = useQuest();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuestBuilderOpen, setIsQuestBuilderOpen] = useState(false);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Auth routing state for non-logged-in users: 'hero' | 'login' | 'signup'
  const [authView, setAuthView] = useState<'hero' | 'login' | 'signup'>('hero');
  const [forceDoneLoading, setForceDoneLoading] = useState(false);

  // When user is not logged in or logs out, ensure authView returns to 'hero'
  useEffect(() => {
    if (!user) {
      setAuthView('hero');
    }
  }, [user]);

  // Maximum 1.5s visual splash on any device
  useEffect(() => {
    const timer = setTimeout(() => setForceDoneLoading(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 1. Loading screen
  if (isLoadingAuth && !forceDoneLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#fde047] flex flex-col items-center justify-center relative font-cinzel">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ca8a04] via-[#78350f] to-[#451a03] p-0.5 shadow-2xl shadow-amber-500/30 animate-pulse">
            <div className="w-full h-full bg-[#120c08] rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#facc15]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#fef08a]">
            <RotateCw className="w-4 h-4 animate-spin text-[#ca8a04]" />
            <span>Memuat Gerbang Petualang...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Visitor flow (not logged in)
  if (!user) {
    if (authView === 'login') {
      return (
        <AuthScreen
          initialMode="signin"
          onBack={() => setAuthView('hero')}
        />
      );
    }

    if (authView === 'signup') {
      return (
        <AuthScreen
          initialMode="signup"
          onBack={() => setAuthView('hero')}
        />
      );
    }

    // Default: Editorial Hero Section matching the reference layout
    return (
      <HeroSection
        onStartAdventure={() => setAuthView('signup')}
        onBeginQuest={() => setAuthView('login')}
      />
    );
  }

  // 3. User Dashboard with Interactive Stone Wall & Magma Crevices
  return (
    <div className="min-h-screen bg-[#07080b] text-[#f4ebd0] flex flex-col relative overflow-x-hidden">
      {/* Interactive Stone Masonry Wall with Fire-Emitting Gaps */}
      <InteractiveStoneBackground />

      {/* Top Navbar */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenTrophyRoom={() => setIsTrophyOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onSignOut={async () => {
          setAuthView('hero');
          await signOut();
        }}
      />

      {/* Main Container with Carved Wood Outer Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 relative z-10">
        {/* Heavy Carved Wood Outer Frame Structure */}
        <div className="relative rounded-3xl p-3 sm:p-5 rpg-wood-frame">
          {/* Left Wooden Pillar with Engraved Mystical Runes */}
          <div className="hidden lg:flex flex-col items-center justify-around absolute left-2 top-8 bottom-8 w-6 text-sm font-serif select-none pointer-events-none text-[#ca8a04] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
            <span>ψ</span>
            <span>ᚱ</span>
            <span>ᚦ</span>
            <span>ᚹ</span>
            <span>ᛗ</span>
            <span>ᛈ</span>
            <span>ψ</span>
          </div>

          {/* Right Wooden Pillar with Corner Studs */}
          <div className="hidden lg:flex flex-col items-center justify-around absolute right-2 top-8 bottom-8 w-6 text-sm font-serif select-none pointer-events-none text-[#ca8a04] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
            <span>ψ</span>
            <span>ᛉ</span>
            <span>ᛊ</span>
            <span>ᛏ</span>
            <span>ᛒ</span>
            <span>ᛟ</span>
            <span>ψ</span>
          </div>

          {/* 2-Column RPG Layout inside Wood Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:px-6">
            {/* Left Column: Quest Board (8 cols) */}
            <section className="lg:col-span-8">
              <QuestBoard 
                onOpenCreate={() => setIsCreateOpen(true)} 
                onOpenQuestBuilder={() => setIsQuestBuilderOpen(true)} 
              />
            </section>

            {/* Right Column: Player Stats & Arcane Circle (4 cols) */}
            <aside className="lg:col-span-4">
              <PlayerStats onOpenTrophyRoom={() => setIsTrophyOpen(true)} />
            </aside>
          </div>

          {/* Bottom Center Ornate Metallic Insignia / Sigil */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-b from-[#2e1d13] to-[#140b06] border-2 border-[#ca8a04] rounded-full shadow-2xl flex items-center justify-center gap-1.5 z-30">
            <span className="text-xs font-black text-[#facc15] font-serif tracking-widest drop-shadow">
              ⚜ ψ ⚜
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3d2719] py-3 text-center text-xs text-[#a37f59] font-cinzel">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Misiku &bull; Classic Fantasy Tabletop RPG</span>
          <span className="text-[11px] text-[#785b39]">Parchment, Wood & Transmutation Arcana</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateQuestModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onOpenQuestBuilder={() => setIsQuestBuilderOpen(true)}
      />
      <QuestBuilderModal 
        isOpen={isQuestBuilderOpen} 
        onClose={() => setIsQuestBuilderOpen(false)} 
        onOpenCreateCustom={() => setIsCreateOpen(true)}
      />
      <TrophyRoomModal isOpen={isTrophyOpen} onClose={() => setIsTrophyOpen(false)} badges={badges} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <LevelUpModal />
    </div>
  );
}

export default function Home() {
  return (
    <QuestProvider>
      <AppContent />
    </QuestProvider>
  );
}
