'use client';

import React from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { getLevelProgress } from '@/lib/utils';
import { Shield, Swords, UserCog, LogOut, Scroll, User } from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenTrophyRoom: () => void;
  onOpenEditProfile: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreate,
  onOpenTrophyRoom,
  onOpenEditProfile,
  onSignOut,
}) => {
  const { profile, signOut } = useQuest();
  const progress = getLevelProgress(profile.total_xp, profile.level);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#18120c]/95 border-b-2 border-[#3d2919] backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Shield Crest & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Metallic Shield Crest Logo */}
            <div className="w-10 h-10 rounded-2xl bg-[#26201a] border-2 border-[#b89363] flex items-center justify-center shadow-sm relative">
              <Shield className="w-6 h-6 text-[#93c5fd] stroke-[1.8] fill-[#1e3a8a]/40" />
              <span className="absolute text-[11px] font-black text-[#fae8b6] font-serif">ψ</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-wider text-[#fae8b6] font-cinzel">
                  QUESTIFY
                </span>
              </div>
              <p className="text-[10px] text-[#c9b499] font-serif tracking-wide">
                Gamified Daily Quests
              </p>
            </div>
          </div>

          {/* Level Indicator on Mobile */}
          <div className="md:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#271d15] border border-[#a68252]">
            <span className="text-xs font-bold text-[#fae8b6] font-cinzel">
              LV. {profile.level}
            </span>
          </div>
        </div>

        {/* Center: Gilded Filigree Level & XP Gauge Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-sm w-full justify-center">
          {/* Left Wing filigree */}
          <span className="text-[#b89363] text-xs font-serif hidden sm:inline select-none">
            ❧
          </span>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1 text-xs font-cinzel">
              <span className="font-bold text-[#fae8b6] flex items-center gap-1 tracking-wider">
                ⚔ LV. {profile.level}
              </span>
              <span className="text-[11px] font-medium text-[#f5ebd7] font-mono tracking-tight">
                {progress.progressInLevel} / {progress.neededForNext} XP
              </span>
            </div>

            {/* Bronze Bezel XP Bar with Pastel Fill */}
            <div className="w-full h-2.5 bg-[#0e0c09] rounded-full overflow-hidden border border-[#6b5235] p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#edd59e]"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Right Wing filigree */}
          <span className="text-[#b89363] text-xs font-serif hidden sm:inline select-none">
            ☙
          </span>
        </div>

        {/* Right: Medieval Player Plate & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Pastel Player Plate */}
          <div
            onClick={onOpenTrophyRoom}
            className="flex items-center gap-2 bg-[#f5e8d0] border border-[#b89363] rounded-full px-3 py-1 shadow-sm cursor-pointer hover:bg-[#faebd7] transition"
            title="Klik untuk membuka Trophy Room 3D"
          >
          

            {/* Avatar Frame */}
            <div className="w-5 h-5 rounded-full bg-[#1f2937] border border-[#875d27] overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-[#93c5fd]" />
              )}
            </div>

            <span className="text-xs font-bold text-[#2e1d08] font-cinzel truncate max-w-[85px]">
              {profile.username || 'Petualang'}
            </span>
          </div>

          {/* Edit Profil Button - Pastel Slate Rounded-Full */}
          <button
            onClick={onOpenEditProfile}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25323a] hover:bg-[#30414b] border border-[#5a7682] rounded-full text-xs font-bold text-[#c7dee3] font-cinzel transition shadow-sm"
            title="Edit Profil Petualang"
          >
            <UserCog className="w-3.5 h-3.5 text-[#88a8b3]" />
            <span className="hidden sm:inline">Edit Profil</span>
          </button>

          {/* Buat Quest Button - Pastel Terracotta Rounded-Full */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#b85d56] hover:bg-[#a64e48] border-2 border-[#e8a59e] rounded-full text-xs font-bold text-[#fff7f5] font-cinzel transition hover:scale-105 active:scale-95 shadow-sm"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#752a25] flex items-center justify-center border border-[#e8a59e]">
              <Swords className="w-2 h-2 text-white" />
            </div>
            <span>Buat Quest</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              } else {
                signOut();
              }
            }}
            className="p-1.5 text-[#a8825c] hover:text-[#ef4444] hover:bg-[#351e11] rounded-full transition"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
