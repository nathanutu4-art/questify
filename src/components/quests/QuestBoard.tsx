'use client';

import React, { useState } from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { QuestCard } from './QuestCard';
import { Flame, Swords, Check, Plus, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestBoardProps {
  onOpenCreate: () => void;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ onOpenCreate }) => {
  const { quests, categories } = useQuest();
  const [filterTab, setFilterTab] = useState<'daily' | 'all' | 'completed'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering logic
  const filteredQuests = quests.filter((q) => {
    if (filterTab === 'daily') {
      const isDueTodayOrOverdue = !q.due_date || q.due_date <= todayStr;
      if (!isDueTodayOrOverdue) return false;
      if (q.is_completed) return false;
    } else if (filterTab === 'completed') {
      if (!q.is_completed) return false;
    }

    if (selectedCategory && q.category_id !== selectedCategory) {
      return false;
    }

    return true;
  });

  const dailyCount = quests.filter(
    (q) => (!q.due_date || q.due_date <= todayStr) && !q.is_completed
  ).length;

  return (
    <div className="relative rounded-3xl p-5 sm:p-7 rpg-parchment overflow-hidden border-4 border-[#855e24] shadow-2xl">
      {/* 1. Curled Parchment Scroll Header Banner */}
      <div className="relative mb-6 text-center">
        {/* Scroll Outer Frame with Rolled Handles - Pastel Parchment */}
        <div className="relative inline-block w-full max-w-2xl bg-[#f5e8d0] border-2 border-[#b89363] rounded-2xl px-6 py-4 shadow-sm">
          {/* Left Scroll Rod */}
          <div className="absolute -left-3 -top-2 -bottom-2 w-4 bg-[#4a321f] rounded-full shadow-md border border-[#2e1d11]" />
          {/* Right Scroll Rod */}
          <div className="absolute -right-3 -top-2 -bottom-2 w-4 bg-[#4a321f] rounded-full shadow-md border border-[#2e1d11]" />

          <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-[#2b170a] font-cinzel">
            Papan Petualangan Harian
          </h2>
          <p className="text-xs sm:text-sm text-[#543317] mt-1 font-serif italic max-w-lg mx-auto">
            Selesaikan misimu, kumpulkan XP, dan tingkatkan status petualangmu di dunia Questify!
          </p>
        </div>
      </div>

      {/* 2. Medieval Beveled Filter Tabs - Rounded-Full with Pastel Colors */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-5">
        {/* Tab Misi Harian */}
        <button
          onClick={() => setFilterTab('daily')}
          className={`px-5 py-2.5 rounded-full border-2 transition-all font-cinzel text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm ${
            filterTab === 'daily'
              ? 'bg-[#334155] border-[#d6ba8d] text-[#fae8b6]'
              : 'bg-[#1e293b] border-[#334155] text-[#94a3b8] hover:text-[#e2e8f0]'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>Misi Harian</span>
          {dailyCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#271d15] text-[#fae8b6] border border-[#a68252]">
              {dailyCount}
            </span>
          )}
        </button>

        {/* Tab Semua Quest */}
        <button
          onClick={() => setFilterTab('all')}
          className={`px-5 py-2.5 rounded-full border-2 transition-all font-cinzel text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm ${
            filterTab === 'all'
              ? 'bg-[#334155] border-[#d6ba8d] text-[#fae8b6]'
              : 'bg-[#1e293b] border-[#334155] text-[#94a3b8] hover:text-[#e2e8f0]'
          }`}
        >
          <Swords className="w-4 h-4 text-[#e8c872]" />
          <span>Semua Quest</span>
        </button>

        {/* Tab Selesai - Soft Pastel Sage/Forest Rounded-Full */}
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-6 py-2 rounded-full border-2 transition-all font-cinzel text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm ${
            filterTab === 'completed'
              ? 'bg-[#284e44] border-[#d6ba8d] text-[#ffffff]'
              : 'bg-[#1a3830] border-[#2d5c50] text-[#a7d1c6] hover:border-[#387667]'
          }`}
        >
          {/* Pastel Ruby Wax Seal Circle */}
          <div className="w-5 h-5 rounded-full bg-[#b85d56] border-2 border-[#fae8b6] flex items-center justify-center shadow-sm">
            <Check className="w-3 h-3 text-white stroke-[3.5]" />
          </div>
          <span>Selesai</span>
        </button>
      </div>

      {/* 3. Category Filter Pills with Pastel Colors */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full border text-xs font-bold font-cinzel transition-all ${
            selectedCategory === null
              ? 'bg-[#3b2d21] border-[#d6ba8d] text-[#fae8b6] shadow-sm'
              : 'bg-[#241c14] border-[#4d3827] text-[#c9b499] hover:border-[#855e24]'
          }`}
        >
          Semua Kategori
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold font-cinzel transition-all ${
                isSelected
                  ? 'bg-[#3b2d21] border-[#d6ba8d] text-[#fae8b6] shadow-sm'
                  : 'bg-[#241c14] border-[#4d3827] text-[#c9b499] hover:border-[#855e24]'
              }`}
            >
              {/* Gemstone Orb */}
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{
                  backgroundColor: cat.color,
                }}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Quest Cards List */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 text-center border-2 border-dashed border-[#8d6935]/70 rounded-2xl bg-[#f5e7cc]/40"
            >
              <ShieldAlert className="w-10 h-10 text-[#7a4e25] mx-auto mb-2" />
              <h4 className="text-base font-black text-[#2f190c] font-cinzel mb-1">
                Tidak Ada Misi Tersedia
              </h4>
              <p className="text-xs text-[#5e3817] font-serif max-w-sm mx-auto mb-4">
                {filterTab === 'daily'
                  ? 'Semua misi harian Anda telah tuntas atau belum ditambahkan hari ini!'
                  : 'Belum ada quest pada kategori atau filter ini.'}
              </p>
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 bg-[#2d1b10] hover:bg-[#3d2719] text-[#fef08a] text-xs font-bold rounded-xl border-2 border-[#ca8a04] font-cinzel transition inline-flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Tambah Quest Baru
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
