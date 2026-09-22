'use client';

import React, { useState } from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { QuestDifficulty } from '@/types/quest';
import { X, Sparkles, Scroll, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({ isOpen, onClose }) => {
  const { categories, addQuest } = useQuest();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'work');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('MEDIUM');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const difficultyXPMap: Record<QuestDifficulty, number> = {
    EASY: 50,
    MEDIUM: 100,
    HARD: 150,
    EPIC: 300,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addQuest({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        difficulty,
        base_xp: difficultyXPMap[difficulty],
        due_date: dueDate,
      });

      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
                <Scroll className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#fef08a] tracking-wide">
                  Tulis Quest Baru
                </h2>
                <p className="text-[11px] text-[#c4aa87] font-serif">
                  Tentukan tantangan dan imbalan XP untuk petualanganmu
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gradient-to-b from-[#24170f] to-[#1a110a]">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1">
                Judul Quest *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Taklukkan Proyek Desain Q4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] focus:outline-none focus:border-[#ca8a04] text-sm transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1">
                Deskripsi
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan detail atau langkah-langkah misi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] focus:outline-none focus:border-[#ca8a04] text-sm transition resize-none font-serif"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1">
                Kategori Skill Tree
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-[#ca8a04] bg-[#3a2618] shadow-md'
                          : 'border-[#422916] bg-[#170e08] hover:border-[#633e21]'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                      />
                      <span className="text-[11px] font-bold text-[#e2d0ba]">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1">
                Tingkat Kesulitan & Imbalan XP
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['EASY', 'MEDIUM', 'HARD', 'EPIC'] as QuestDifficulty[]).map((diff) => {
                  const isSelected = difficulty === diff;
                  const xp = difficultyXPMap[diff];
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-[#facc15] bg-[#422814] shadow-lg shadow-amber-950/60'
                          : 'border-[#422916] bg-[#170e08] hover:border-[#633e21]'
                      }`}
                    >
                      <div className="text-xs font-black text-[#ffffff]">{diff}</div>
                      <div className="text-[11px] font-bold text-[#facc15]">+{xp} XP</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-[#fde047] uppercase tracking-wider mb-1">
                Tenggat Waktu (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] focus:outline-none focus:border-[#ca8a04] text-sm transition"
              />
            </div>

            {/* Actions */}
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
                disabled={isSubmitting || !title.trim()}
                className="px-6 py-2.5 bg-[#b85d56] hover:bg-[#a64e48] border-2 border-[#e8a59e] text-[#fff7f5] rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Swords className="w-4 h-4 text-white" />
                <span>Mulai Quest</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
