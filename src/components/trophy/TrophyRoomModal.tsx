'use client';

import React, { useState } from 'react';
import { Badge } from '@/types/quest';
import { Badge3DCanvas } from './Badge3DCanvas';
import { X, Trophy, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ isOpen, onClose, badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge>(badges[0] || null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#1e130c] border-4 border-[#855e24] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-cinzel text-[#f5ebd0]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#543b23] bg-[#140b06]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2e1d13] border-2 border-[#ca8a04] rounded-xl text-[#facc15]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wide text-[#fef08a] flex items-center gap-2">
                  Trophy Room 3D
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#451a03] text-[#fde047] border border-[#a16207]">
                    Interaktif
                  </span>
                </h2>
                <p className="text-xs text-[#cca981] font-serif">
                  Putar lencana 3D dengan menggeser (drag) kursor untuk memeriksa detailnya.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#a8825c] hover:text-white rounded-lg hover:bg-[#351e11] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left 3D Viewport */}
            <div className="md:col-span-6 bg-gradient-to-b from-[#100905] to-[#1a1009] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r-2 border-[#543b23]">
              <div className="relative flex flex-col items-center">
                {selectedBadge ? (
                  <>
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full blur-2xl opacity-30 pointer-events-none"
                        style={{ backgroundColor: selectedBadge.is_unlocked ? selectedBadge.color : '#334155' }}
                      />
                      <Badge3DCanvas
                        badgeType={selectedBadge.badge_type}
                        color={selectedBadge.color}
                        isUnlocked={selectedBadge.is_unlocked}
                        size={240}
                        interactive={true}
                      />
                    </div>
                    <div className="text-center mt-3 space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        {selectedBadge.is_unlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#1b120b] text-[#8a6b4b] border border-[#4a311d] font-bold">
                            <Lock className="w-3.5 h-3.5" /> Terkunci
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a1a0f] text-[#fef08a] border border-[#a16207]">
                          {selectedBadge.required_xp} XP Diperlukan
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#ffffff] mt-2">{selectedBadge.name}</h3>
                      <p className="text-xs text-[#d4b996] max-w-xs font-serif leading-relaxed">{selectedBadge.description}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-[#a8825c]">Pilih lencana untuk melihat model 3D</p>
                )}
              </div>
            </div>

            {/* Right Badge Grid List */}
            <div className="md:col-span-6 p-6 overflow-y-auto max-h-[500px] space-y-3 bg-[#180e07]">
              <div className="flex items-center justify-between pb-2 border-b border-[#452b17] text-xs text-[#cca981]">
                <span>KOLEKSI LENCANA ({badges.filter(b => b.is_unlocked).length} / {badges.length} TERBUKA)</span>
                <span>Klik untuk rotasi 3D</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {badges.map((badge) => {
                  const isSelected = selectedBadge?.id === badge.id;
                  return (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#facc15] bg-[#3a2516] shadow-md'
                          : badge.is_unlocked
                          ? 'border-[#5a3a22] bg-[#24170e] hover:border-[#855e24]'
                          : 'border-[#382111] bg-[#140b06] opacity-60 hover:opacity-85'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: badge.is_unlocked ? `${badge.color}25` : '#1c1209',
                          borderColor: badge.is_unlocked ? badge.color : '#422816',
                          color: badge.is_unlocked ? badge.color : '#6b472a',
                        }}
                      >
                        {badge.is_unlocked ? <Sparkles className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{badge.name}</div>
                        <div className="text-[10px] text-[#fef08a] truncate">{badge.required_xp} XP</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
