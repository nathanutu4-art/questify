'use client';

import React, { useState, useEffect } from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { X, User, Image, Check, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RPG_AVATAR_PRESETS = [
  {
    id: 'knight',
    name: 'Knight',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowKnight&backgroundColor=0284c7',
  },
  {
    id: 'mage',
    name: 'Mage',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ArcaneMage&backgroundColor=7c3aed',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberRogue&backgroundColor=10b981',
  },
  {
    id: 'paladin',
    name: 'Paladin',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SunPaladin&backgroundColor=f59e0b',
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ValkyrieHero&backgroundColor=ec4899',
  },
  {
    id: 'dragon',
    name: 'Dragon',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FireDragon&backgroundColor=ef4444',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useQuest();

  const [username, setUsername] = useState(profile.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        username: username.trim(),
        avatar_url: avatarUrl.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#24170f] border-4 border-[#855e24] rounded-3xl shadow-2xl overflow-hidden font-cinzel text-[#f5ebd0]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#5a3a22] bg-[#1a110a]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#332014] text-[#facc15] rounded-xl border border-[#ca8a04]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#fef08a] tracking-wide">
                  Edit Profil Petualang
                </h2>
                <p className="text-[11px] text-[#c4aa87] font-serif">
                  Sesuaikan nama identitas dan gambar avatarmu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#a8825c] hover:text-white rounded-lg hover:bg-[#351e11] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5 bg-gradient-to-b from-[#24170f] to-[#1a110a]">
            {/* Live Preview Avatar */}
            <div className="flex items-center gap-4 bg-[#140c07] p-4 rounded-2xl border-2 border-[#543b23]">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#1f150e] border-2 border-[#ca8a04] flex items-center justify-center shadow-lg shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xl font-black text-[#facc15]">
                    {username ? username.substring(0, 2).toUpperCase() : 'AD'}
                  </span>
                )}
                <div className="absolute bottom-0 right-0 p-1 bg-[#24170f] rounded-tl-lg text-[#ca8a04]">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-[#ffffff]">{username || 'Nama Petualang'}</div>
                <div className="text-xs text-[#fde047] font-bold">Level {profile.level} Petualang</div>
                <div className="text-[11px] text-[#cca981] font-serif">{profile.total_xp} Total XP &bull; {profile.current_streak} Hari Streak</div>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1.5">
                Nama Petualang (Username) *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama petualang..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04] transition"
              />
            </div>

            {/* Avatar Presets */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1.5">
                Pilih Preset Avatar RPG
              </label>
              <div className="grid grid-cols-6 gap-2">
                {RPG_AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                        isSelected
                          ? 'border-[#facc15] scale-105 shadow-md shadow-amber-500/40'
                          : 'border-[#4a311e] hover:border-[#855e24] bg-[#120b07]'
                      }`}
                      title={preset.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-lg" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#ca8a04]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Image URL */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1.5">
                Atau Masukkan URL Gambar Kustom
              </label>
              <div className="relative">
                <Image className="w-4 h-4 text-[#785b39] absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04] transition"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-[#452b17]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-bold text-[#c4aa87] hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || !username.trim()}
                className="px-6 py-2.5 bg-[#b85d56] hover:bg-[#a64e48] border-2 border-[#e8a59e] text-[#fff7f5] rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersimpan!</span>
                  </>
                ) : isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simpan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
