'use client';

import React from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { RadarChart } from './RadarChart';
import { Trophy, CheckCircle2, Flame, Hourglass, Sparkles, ChevronRight } from 'lucide-react';

interface PlayerStatsProps {
  onOpenTrophyRoom: () => void;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ onOpenTrophyRoom }) => {
  const { profile, categoryXPList, badges, quests } = useQuest();

  const completedQuestsCount = quests.filter((q) => q.is_completed).length;

  return (
    <div className="relative rounded-3xl p-4 sm:p-5 rpg-stone-alcove overflow-hidden border-4 border-[#334255] shadow-2xl">
      {/* Decorative Runic Pillars on Left and Right borders */}
      <div className="absolute top-8 left-2 flex flex-col items-center gap-4 text-xs rpg-rune-blue opacity-70 pointer-events-none select-none font-serif">
        <span>ᚱ</span>
        <span>ᚦ</span>
        <span>ᛗ</span>
      </div>
      <div className="absolute top-8 right-2 flex flex-col items-center gap-4 text-xs rpg-rune-blue opacity-70 pointer-events-none select-none font-serif">
        <span>ᚹ</span>
        <span>ᛈ</span>
        <span>ᛟ</span>
      </div>

      {/* Ribbon Header "STATUS PEMAIN" - Pastel Gold Rounded-Full */}
      <div className="flex justify-center mb-5 relative z-10">
        <div className="relative px-8 py-2 bg-[#fae8b6] border border-[#d6ba8d] rounded-full shadow-sm flex items-center justify-center">
          <h2 className="text-base sm:text-lg font-bold tracking-widest text-[#241407] font-cinzel uppercase">
            STATUS PEMAIN
          </h2>
        </div>
      </div>

      {/* 3 Carved Stat Boxes - Rounded-2xl Pastel */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mb-5 px-3">
        {/* TOTAL XP */}
        <div className="bg-[#121620] border-2 border-[#856b47] rounded-2xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-[#edd59e] uppercase tracking-wider font-cinzel">
            TOTAL XP
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#fae8b6] font-cinzel my-0.5">
            {profile.total_xp}
          </div>
        </div>

        {/* SELESAI */}
        <div className="bg-[#121620] border-2 border-[#856b47] rounded-2xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-[#edd59e] uppercase tracking-wider font-cinzel">
            SELESAI
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#86efac] font-cinzel my-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>{completedQuestsCount}</span>
          </div>
        </div>

        {/* STREAK */}
        <div className="bg-[#121620] border-2 border-[#856b47] rounded-2xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold text-[#edd59e] uppercase tracking-wider font-cinzel">
            STREAK
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#fdba74] font-cinzel my-0.5 flex items-center justify-center gap-1">
            <Hourglass className="w-4 h-4" />
            <span>{profile.current_streak}d</span>
          </div>
        </div>
      </div>

      {/* Transmutation Circle Skill Tree */}
      <div className="border-t border-[#3b4c65]/70 pt-4 flex flex-col items-center">
        <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#fae8b6] uppercase mb-1 font-cinzel">
          Skill Tree (XP Per Kategori)
        </h3>
        <RadarChart data={categoryXPList} size={280} />
      </div>

      {/* Bottom Rune Mana Bars */}
      <div className="mt-4 pt-3 border-t border-[#3b4c65]/60 space-y-2 px-3">
        {categoryXPList.map((cat, idx) => {
          const runes = ['ᚱ', '⚡', 'ᛗ', 'ᚹ', 'Ω'];
          return (
            <div key={cat.category_id} className="flex items-center gap-2.5 text-xs">
              <span
                className="w-5 text-center font-serif font-black text-sm select-none"
                style={{ color: cat.color }}
              >
                {runes[idx % runes.length]}
              </span>
              <div className="flex-1 h-3 bg-[#0a0d14] rounded-full overflow-hidden border border-[#475569] p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{
                    width: `${Math.min(100, Math.max(12, (cat.xp / 350) * 100))}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <span className="text-[11px] font-bold font-mono text-[#fae8b6] min-w-[36px] text-right">
                {cat.xp}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3D Trophy Room Entry - Rounded-Full with Pastel Colors */}
      <div className="mt-5 pt-3 border-t border-[#3b4c65]/80 px-2">
        <button
          onClick={onOpenTrophyRoom}
          className="w-full py-2.5 px-4 bg-[#33251a] hover:bg-[#423022] border-2 border-[#b89563] hover:border-[#fae8b6] rounded-full text-xs font-bold text-[#fae8b6] uppercase tracking-wider font-cinzel flex items-center justify-center gap-2 shadow-sm transition active:scale-95 group"
        >
          <Trophy className="w-4 h-4 text-[#e8c872] group-hover:scale-110 transition-transform" />
          <span>Buka Trophy Room 3D</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
