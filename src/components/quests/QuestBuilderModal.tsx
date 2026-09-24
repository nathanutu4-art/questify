'use client';

import React, { useState, useMemo } from 'react';
import { useQuest } from '@/lib/store/QuestContext';
import { QuestDifficulty, QuestSuggestion } from '@/types/quest';
import { 
  X, 
  Sparkles, 
  Search, 
  Plus, 
  Check, 
  CheckSquare, 
  Square, 
  Calendar, 
  Zap, 
  Briefcase, 
  HeartPulse, 
  GraduationCap, 
  User as UserIcon, 
  Coins, 
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateCustom?: () => void;
}

export const QuestBuilderModal: React.FC<QuestBuilderModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateCustom,
}) => {
  const { suggestions, quests, categories, addQuestFromSuggestion, addMultipleQuestsFromSuggestions } = useQuest();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper function to show quick feedback toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filter suggestions based on search, category, and difficulty
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category_id !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && item.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query (title, description, tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [suggestions, selectedCategory, selectedDifficulty, searchQuery]);

  // Check if a suggestion is already active in user quests for this dueDate
  const isAlreadyInQuests = (item: QuestSuggestion) => {
    return quests.some(
      (q) =>
        q.title.trim().toLowerCase() === item.title.trim().toLowerCase() &&
        q.due_date === dueDate &&
        !q.is_completed
    );
  };

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all filtered
  const toggleSelectAllFiltered = () => {
    if (selectedIds.size === filteredSuggestions.length && filteredSuggestions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSuggestions.map((s) => s.id)));
    }
  };

  // 1-Click add single suggestion
  const handleAddSingle = async (suggestion: QuestSuggestion) => {
    setIsSubmitting(true);
    try {
      await addQuestFromSuggestion(suggestion, dueDate);
      setAddedIds((prev) => new Set(prev).add(suggestion.id));
      triggerToast(`Misi "${suggestion.title.slice(0, 24)}..." berhasil ditambahkan!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch add selected suggestions
  const handleBatchAdd = async () => {
    if (selectedIds.size === 0) return;

    setIsSubmitting(true);
    try {
      const toAdd = suggestions.filter((s) => selectedIds.has(s.id));
      const count = await addMultipleQuestsFromSuggestions(toAdd, dueDate);
      
      setAddedIds((prev) => {
        const next = new Set(prev);
        selectedIds.forEach((id) => next.add(id));
        return next;
      });
      setSelectedIds(new Set());
      triggerToast(`${count} misi harian berhasil ditambahkan ke daftar misimu!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Icon helper
  const renderCategoryIcon = (catId?: string, className = 'w-3.5 h-3.5') => {
    switch (catId) {
      case 'health':
        return <HeartPulse className={className} />;
      case 'work':
        return <Briefcase className={className} />;
      case 'education':
        return <GraduationCap className={className} />;
      case 'personal':
        return <UserIcon className={className} />;
      case 'finance':
        return <Coins className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  // Difficulty color badge helper
  const getDifficultyBadge = (diff: QuestDifficulty) => {
    switch (diff) {
      case 'EASY':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400';
      case 'MEDIUM':
        return 'border-sky-500/50 bg-sky-950/40 text-sky-400';
      case 'HARD':
        return 'border-purple-500/50 bg-purple-950/40 text-purple-300';
      case 'EPIC':
        return 'border-amber-500/60 bg-amber-950/50 text-amber-300 shadow-sm shadow-amber-500/20';
      default:
        return 'border-neutral-500 bg-neutral-900 text-neutral-300';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#1c130b] border-4 border-[#855e24] rounded-3xl shadow-2xl overflow-hidden font-cinzel text-[#f5ebd0]"
        >
          {/* Top Decorative Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b-2 border-[#4d301b] bg-[#140c06] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ca8a04] via-[#78350f] to-[#451a03] p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#1c1109] rounded-[14px] flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#fef08a] tracking-wide">
                    Quest Builder
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Saran Sistem
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#c4aa87] font-serif">
                  Pilih kegiatan terkurasi untuk dijadikan quest harianmu dengan 1-klik atau borongan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="glass-btn-icon p-2 rounded-full text-[#cca981] hover:text-white"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="bg-emerald-900/90 border-b border-emerald-500/50 px-4 py-2 text-center text-xs font-bold text-emerald-200 animate-fadeIn flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Filter & Search Bar Area */}
          <div className="p-4 sm:p-5 border-b border-[#3b2313] bg-[#160e07] space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8a6845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari rekomendasi quest (contoh: air putih, coding, leetcode, email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0c0704] border border-[#4d301b] rounded-xl text-sm text-[#fef08a] placeholder-[#785b39] focus:outline-none focus:border-[#ca8a04] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a6845] hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Target Due Date Picker */}
              <div className="flex items-center gap-2 bg-[#0c0704] border border-[#4d301b] rounded-xl px-3 py-1.5 self-start sm:self-auto">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] text-[#a37f59] font-bold">Jadwal:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-xs text-[#fef08a] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'glass-btn-gold border-amber-400 text-white'
                    : 'glass-pill text-[#cca981] hover:text-white'
                }`}
              >
                <span>Semua Kategori</span>
                <span className="text-[10px] opacity-75">({suggestions.length})</span>
              </button>

              {categories.map((cat) => {
                const count = suggestions.filter((s) => s.category_id === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'glass-btn-gold border-amber-400 text-white'
                        : 'glass-pill text-[#cca981] hover:text-white'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                    />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Difficulty Sub-filter & Multi-Select Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Difficulty filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-[#8a6845] font-bold">Tingkat:</span>
                {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      selectedDifficulty === diff
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-[#8a6845] hover:text-[#cca981]'
                    }`}
                  >
                    {diff === 'ALL' ? 'Semua' : diff}
                  </button>
                ))}
              </div>

              {/* Multi-Select Stats & Quick Action */}
              <div className="flex items-center gap-2">
                {filteredSuggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllFiltered}
                    className="text-[11px] font-bold text-[#cca981] hover:text-[#fef08a] flex items-center gap-1 transition"
                  >
                    {selectedIds.size === filteredSuggestions.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Batal Pilih Semua</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Pilih Semua ({filteredSuggestions.length})</span>
                      </>
                    )}
                  </button>
                )}

                {selectedIds.size > 0 && (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                    {selectedIds.size} dipilih
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cards List (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-[#160e07] to-[#120a05]">
            {filteredSuggestions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#26170d] border border-[#523720] flex items-center justify-center text-[#8a6845] mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#e2d0ba]">Tidak ada quest yang cocok</h4>
                <p className="text-xs text-[#8a6845] max-w-sm mt-1 font-serif">
                  Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan tingkat kesulitan.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedDifficulty('ALL');
                  }}
                  className="mt-3 text-xs text-amber-400 hover:underline font-bold"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSuggestions.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isAlreadyAdded = addedIds.has(item.id) || isAlreadyInQuests(item);
                  const category = categories.find((c) => c.id === item.category_id);

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-[#29180d] border-amber-400/80 shadow-lg shadow-amber-950/50'
                          : 'bg-[#20140b]/80 border-[#472d1a] hover:border-[#ca8a04]/50 hover:bg-[#25170d]'
                      }`}
                    >
                      {/* Top Card Info */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          {/* Selection Checkbox */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSelect(item.id)}
                              className="text-[#8a6845] hover:text-amber-400 transition"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Square className="w-4 h-4 text-[#6e5033]" />
                              )}
                            </button>

                            {/* Category Badge */}
                            {category && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border"
                                style={{
                                  borderColor: `${category.color}40`,
                                  backgroundColor: `${category.color}15`,
                                  color: category.color,
                                }}
                              >
                                {renderCategoryIcon(category.id, 'w-3 h-3')}
                                <span>{category.name}</span>
                              </span>
                            )}
                          </div>

                          {/* Difficulty & XP Badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border tracking-wider ${getDifficultyBadge(
                                item.difficulty
                              )}`}
                            >
                              {item.difficulty}
                            </span>
                            <span className="text-[11px] font-black text-amber-300 flex items-center gap-0.5 bg-amber-950/70 border border-amber-700/50 px-1.5 py-0.5 rounded-md">
                              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                              +{item.base_xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-[#fef08a] leading-snug mb-1">
                          {item.title}
                        </h3>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-[#c4aa87] font-serif leading-relaxed line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] text-[#8a6845] bg-[#140b05] px-1.5 py-0.5 rounded border border-[#3b2313]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Footer / Action */}
                      <div className="pt-2 border-t border-[#3b2313] flex items-center justify-between mt-auto">
                        <div>
                          {isAlreadyAdded ? (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Sudah di daftar misi</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8a6845]">
                              Klik tambah untuk hari ini
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleAddSingle(item)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isAlreadyAdded
                              ? 'glass-btn-emerald text-emerald-200'
                              : 'glass-btn-primary text-white'
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Lagi</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Tambah</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-5 border-t-2 border-[#4d301b] bg-[#140c06] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs text-[#a37f59]">
              {onOpenCreateCustom && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateCustom();
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition underline decoration-dotted"
                >
                  <span>Ingin buat quest sendiri dari awal? Klik di sini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="glass-btn-secondary px-5 py-2 rounded-full text-xs font-bold text-[#cca981] hover:text-white"
              >
                Tutup
              </button>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBatchAdd}
                  className="glass-btn-gold px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/70"
                >
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>Tambahkan {selectedIds.size} Misi Terpilih</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

