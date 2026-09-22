'use client';

import React from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { Badge3DCanvas } from '../trophy/Badge3DCanvas';
import { Sparkles, Trophy, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LevelUpModal: React.FC = () => {
  const {
    levelUpNotification,
    setLevelUpNotification,
    recentUnlockedBadge,
    setRecentUnlockedBadge,
  } = useQuest();

  const isOpen = Boolean(levelUpNotification || recentUnlockedBadge);

  const handleClose = () => {
    setLevelUpNotification(null);
    setRecentUnlockedBadge(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#2a1b11] via-[#1f130b] to-[#140b06] border-4 border-[#ca8a04] rounded-3xl p-6 shadow-2xl text-center overflow-hidden font-cinzel text-[#f5ebd0]"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-[#cca981] hover:text-white rounded-full bg-[#170e08] border border-[#543b23] transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Level Up content */}
          {levelUpNotification && (
            <div className="space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-[#3d2717] border-2 border-[#facc15] text-[#facc15] mb-1">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-black text-[#facc15]">
                  SELAMAT, PETUALANG!
                </span>
                <h2 className="text-3xl font-black text-[#ffffff] tracking-wide mt-1">LEVEL UP!</h2>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="px-4 py-2 bg-[#120b07] rounded-xl border-2 border-[#543b23] text-[#a8825c] font-black text-lg font-cinzel">
                  LV. {levelUpNotification.oldLevel}
                </div>
                <ArrowUpRight className="w-6 h-6 text-[#facc15]" />
                <div className="px-5 py-2.5 bg-gradient-to-r from-[#ca8a04] via-[#facc15] to-[#fef08a] text-[#1f130b] rounded-xl font-black text-xl font-cinzel shadow-lg">
                  LV. {levelUpNotification.newLevel}
                </div>
              </div>

              <p className="text-xs text-[#d4b996] font-serif max-w-xs mx-auto leading-relaxed">
                Kekuatan dan dedikasimu bertambah! Terus selesaikan quest harian untuk membuka lencana legendaris berikutnya.
              </p>
            </div>
          )}

          {/* Badge Unlock content */}
          {!levelUpNotification && recentUnlockedBadge && (
            <div className="space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-[#3d2717] border-2 border-[#facc15] text-[#facc15] mb-1">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-black text-[#facc15]">
                  LENCANA BARU DIBUKA!
                </span>
                <h2 className="text-2xl font-black text-[#ffffff] mt-1">{recentUnlockedBadge.name}</h2>
              </div>

              {/* 3D Badge rendering */}
              <div className="flex justify-center -my-2">
                <Badge3DCanvas
                  badgeType={recentUnlockedBadge.badge_type}
                  color={recentUnlockedBadge.color}
                  isUnlocked={true}
                  size={160}
                  interactive={true}
                />
              </div>

              <p className="text-xs text-[#d4b996] font-serif max-w-xs mx-auto">
                {recentUnlockedBadge.description}
              </p>
            </div>
          )}

          {/* Claim / Continue Button */}
          <div className="pt-5">
            <button
              onClick={handleClose}
              className="w-full py-3 rpg-wax-seal rounded-xl text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 text-white"
            >
              Lanjutkan Petualangan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
