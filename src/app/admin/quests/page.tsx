"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_QUESTS, INITIAL_CATEGORIES } from "@/lib/data/initialData";
import { Quest, QuestDifficulty } from "@/types/quest";
import { 
  Scroll, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  AlertCircle,
  Save
} from "lucide-react";

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "MEDIUM" as QuestDifficulty,
    base_xp: 100,
    category_id: "work",
    due_date: new Date().toISOString().split("T")[0],
  });

  // Load quests
  const loadQuests = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setQuests(INITIAL_QUESTS);
      setCategories(INITIAL_CATEGORIES);
      setLoading(false);
      return;
    }

    try {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      const { data: questData, error } = await supabase
        .from("quests")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      if (!error && questData) {
        setQuests(questData);
      }
    } catch (err) {
      console.error("Failed to load quests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  // Filtered quests
  const filteredQuests = quests.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase()));

    const matchesDiff = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === "ALL" || q.category_id === selectedCategory;
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "COMPLETED" ? q.is_completed : !q.is_completed);

    return matchesSearch && matchesDiff && matchesCat && matchesStatus;
  });

  // Handle Create Quest
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("quests").insert([
          {
            user_id: user?.id || "00000000-0000-0000-0000-000000000000",
            title: formData.title.trim(),
            description: formData.description.trim(),
            difficulty: formData.difficulty,
            base_xp: Number(formData.base_xp),
            category_id: formData.category_id,
            due_date: formData.due_date,
            is_completed: false,
          },
        ]).select("*, category:categories(*)").single();

        if (!error && data) {
          setQuests([data, ...quests]);
        }
      } catch (err) {
        console.error("Error creating quest:", err);
      }
    } else {
      // Demo local state
      const newQ: Quest = {
        id: `quest-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        base_xp: Number(formData.base_xp),
        category_id: formData.category_id,
        due_date: formData.due_date,
        is_completed: false,
        category: categories.find((c) => c.id === formData.category_id),
      };
      setQuests([newQ, ...quests]);
    }

    setIsCreateModalOpen(false);
    setFormData({
      title: "",
      description: "",
      difficulty: "MEDIUM",
      base_xp: 100,
      category_id: "work",
      due_date: new Date().toISOString().split("T")[0],
    });
  };

  // Handle Update Quest
  const handleUpdateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuest) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("quests")
          .update({
            title: editingQuest.title,
            description: editingQuest.description,
            difficulty: editingQuest.difficulty,
            base_xp: editingQuest.base_xp,
            category_id: editingQuest.category_id,
            is_completed: editingQuest.is_completed,
          })
          .eq("id", editingQuest.id);

        if (!error) {
          setQuests(quests.map((q) => (q.id === editingQuest.id ? editingQuest : q)));
        }
      } catch (err) {
        console.error("Error updating quest:", err);
      }
    } else {
      setQuests(quests.map((q) => (q.id === editingQuest.id ? editingQuest : q)));
    }

    setEditingQuest(null);
  };

  // Handle Delete Quest
  const handleDeleteQuest = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus quest ini?")) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("quests").delete().eq("id", id);
        if (!error) {
          setQuests(quests.filter((q) => q.id !== id));
        }
      } catch (err) {
        console.error("Error deleting quest:", err);
      }
    } else {
      setQuests(quests.filter((q) => q.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-[#fae8b6] flex items-center gap-2.5">
            <Scroll className="w-6 h-6 text-amber-400" />
            <span>Manajemen Quests</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Lihat, filter, edit, dan kelola semua tugas petualangan pemain di Misiku.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="glass-btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Quest Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#12151f] border border-[#242938] space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari judul quest atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 font-sans"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto font-sans text-xs">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-300 focus:outline-none focus:border-amber-400/60"
            >
              <option value="ALL">Semua Kesulitan</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
              <option value="EPIC">EPIC</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-300 focus:outline-none focus:border-amber-400/60"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-300 focus:outline-none focus:border-amber-400/60"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quests Table */}
      <div className="bg-[#12151f] border border-[#242938] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#242938] bg-[#161a26] text-slate-400 font-cinzel">
                <th className="py-3.5 px-4 font-bold">Judul Quest</th>
                <th className="py-3.5 px-4 font-bold">Kategori</th>
                <th className="py-3.5 px-4 font-bold">Kesulitan</th>
                <th className="py-3.5 px-4 font-bold">XP</th>
                <th className="py-3.5 px-4 font-bold">Batas Waktu</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2333]">
              {filteredQuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-cinzel">
                    Tidak ada quest yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredQuests.map((quest) => {
                  const cat = categories.find((c) => c.id === quest.category_id);
                  return (
                    <tr key={quest.id} className="hover:bg-[#181d2c] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{quest.title}</div>
                        {quest.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {quest.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${cat?.color || "#38bdf8"}15`,
                            color: cat?.color || "#38bdf8",
                            border: `1px solid ${cat?.color || "#38bdf8"}40`,
                          }}
                        >
                          {cat?.name || quest.category_id || "Umum"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            quest.difficulty === "EPIC"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : quest.difficulty === "HARD"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : quest.difficulty === "MEDIUM"
                              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {quest.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        +{quest.base_xp} XP
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {quest.due_date || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        {quest.is_completed ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-600/30 text-slate-400 text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingQuest({ ...quest })}
                          className="glass-btn-icon p-2 rounded-lg text-slate-300 hover:text-amber-400"
                          title="Edit Quest"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="glass-btn-icon p-2 rounded-lg text-slate-400 hover:text-red-400"
                          title="Hapus Quest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Quest Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-lg w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Buat Quest Baru</span>
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="glass-btn-icon p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuest} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Judul Quest *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selesaikan Laporan Keuangan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Tujuan & instruksi quest..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Tingkat Kesulitan</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => {
                      const diff = e.target.value as QuestDifficulty;
                      const xpMap = { EASY: 50, MEDIUM: 100, HARD: 150, EPIC: 300 };
                      setFormData({ ...formData, difficulty: diff, base_xp: xpMap[diff] });
                    }}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="EASY">EASY (50 XP)</option>
                    <option value="MEDIUM">MEDIUM (100 XP)</option>
                    <option value="HARD">HARD (150 XP)</option>
                    <option value="EPIC">EPIC (300 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Base XP</label>
                  <input
                    type="number"
                    value={formData.base_xp}
                    onChange={(e) => setFormData({ ...formData, base_xp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Batas Waktu</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="glass-btn-gold px-5 py-2 rounded-xl font-bold font-cinzel tracking-wider"
                >
                  Simpan Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Quest */}
      {editingQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-lg w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-400" />
                <span>Edit Quest</span>
              </h2>
              <button
                onClick={() => setEditingQuest(null)}
                className="glass-btn-icon p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuest} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Judul Quest *</label>
                <input
                  type="text"
                  required
                  value={editingQuest.title}
                  onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editingQuest.description || ""}
                  onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Kategori</label>
                  <select
                    value={editingQuest.category_id || "work"}
                    onChange={(e) => setEditingQuest({ ...editingQuest, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Tingkat Kesulitan</label>
                  <select
                    value={editingQuest.difficulty}
                    onChange={(e) => setEditingQuest({ ...editingQuest, difficulty: e.target.value as QuestDifficulty })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                    <option value="EPIC">EPIC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Base XP</label>
                  <input
                    type="number"
                    value={editingQuest.base_xp}
                    onChange={(e) => setEditingQuest({ ...editingQuest, base_xp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Status Penyelesaian</label>
                  <select
                    value={editingQuest.is_completed ? "true" : "false"}
                    onChange={(e) => setEditingQuest({ ...editingQuest, is_completed: e.target.value === "true" })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="false">Aktif (Belum Selesai)</option>
                    <option value="true">Selesai (Completed)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setEditingQuest(null)}
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="glass-btn-gold px-5 py-2 rounded-xl font-bold font-cinzel tracking-wider"
                >
                  Perbarui Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

