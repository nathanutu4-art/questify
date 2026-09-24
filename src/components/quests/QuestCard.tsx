'use client';

import React, { useState } from 'react';
import { Quest } from '@/types/quest';
import { useQuest } from '@/lib/store/QuestContext';
import { Shield, Check, Trash2, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestCardProps {
  quest: Quest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { completeQuest, deleteQuest } = useQuest();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCheck = async () => {
    if (quest.is_completed || isCompleting) return;
    setIsCompleting(true);
    await completeQuest(quest.id);
    setIsCompleting(false);
  };

  const isToday = quest.due_date === new Date().toISOString().split('T')[0];

  // Fantasy difficulty icons
  const getDifficultyIcons = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return '⭐';
      case 'MEDIUM':
        return '⭐⭐';
      case 'HARD':
        return '⭐⭐💀';
      case 'EPIC':
      default:
        return '⭐⭐💀🐉';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm ${
        quest.is_completed
          ? 'bg-[#18130e]/85 border-[#3d3329] opacity-65'
          : 'bg-[#221c16] border-[#4a3d31] hover:border-[#7a6450]'
      }`}
    >
      {/* Corner Iron Studs */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#694f3b] pointer-events-none" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#694f3b] pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#694f3b] pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#694f3b] pointer-events-none" />

      <div className="p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Shield Checkbox + Quest Details */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Shield Checkbox Button - Apple Glass Rounded-2xl */}
          <button
            onClick={handleCheck}
            disabled={quest.is_completed || isCompleting}
            className={`w-11 h-12 rounded-2xl flex items-center justify-center shrink-0 relative group/btn ${
              quest.is_completed
                ? 'glass-btn-emerald text-[#ffffff]'
                : 'glass-btn-secondary text-[#fae8b6]'
            }`}
            title={quest.is_completed ? 'Quest Selesai' : 'Klik untuk Selesaikan Quest'}
          >
            <Shield className="w-7 h-7 stroke-[1.8] fill-current opacity-20 absolute inset-0 m-auto" />
            <Check
              className={`w-4 h-4 stroke-[3.5] relative z-10 transition-transform ${
                quest.is_completed
                  ? 'text-[#ffffff] scale-110'
                  : 'text-[#fae8b6] opacity-50 group-hover/btn:opacity-100'
              }`}
            />
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Tag Pills Bar - Rounded-Full */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {/* Category Pill */}
              {quest.category && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#3b2d21] text-[#fae8b6] border border-[#a68252] font-cinzel">
                  {quest.category.name}
                </span>
              )}

              {/* Difficulty Pill */}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#332240] text-[#e0cbff] border border-[#784c96] font-cinzel">
                {quest.difficulty}
              </span>

              {/* Due Date Indicator */}
              {quest.due_date && (
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-cinzel ${
                    isToday
                      ? 'bg-[#451f28] text-[#ffd6de] border border-[#96475a]'
                      : 'bg-[#1f1812] text-[#d4b996] border border-[#523d2b]'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {isToday ? 'Hari Ini' : quest.due_date}
                </span>
              )}

              {/* Fantasy Difficulty Rating Icons */}
              <span className="text-xs tracking-wider select-none text-[#e8c872] ml-1">
                {getDifficultyIcons(quest.difficulty)}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`text-base sm:text-lg font-bold tracking-wide font-cinzel transition-all line-clamp-1 ${
                quest.is_completed
                  ? 'line-through text-[#7a6450]'
                  : 'text-[#fae8b6]'
              }`}
            >
              {quest.title}
            </h3>

            {/* Description */}
            {quest.description && (
              <p className="text-xs text-[#c9b499] line-clamp-2 mt-0.5 leading-relaxed font-serif">
                {quest.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Pastel Parchment XP Tag & Delete Button */}
        <div className="flex flex-col items-end justify-between shrink-0 gap-2">
          {/* Pastel Parchment XP Tag - Rounded-Full */}
          <div className="relative px-3.5 py-1 rounded-full bg-[#f5e8d0] border border-[#b89363] shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#855424]" />
            <span className="text-xs font-bold text-[#2e1708] font-cinzel">
              +{quest.base_xp} XP
            </span>
          </div>

          {/* Delete Action - Apple Frosted Icon Glass */}
          <button
            onClick={() => deleteQuest(quest.id)}
            className="glass-btn-icon opacity-0 group-hover:opacity-100 p-2 text-[#c4a07d] hover:text-[#f87171] rounded-full"
            title="Hapus Quest"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
