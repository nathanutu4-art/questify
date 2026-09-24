"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_SUGGESTIONS, INITIAL_CATEGORIES } from "@/lib/data/initialData";
import { QuestDifficulty, QuestSuggestion, Category } from "@/types/quest";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Tag, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  HeartPulse, 
  Briefcase, 
  GraduationCap, 
  User as UserIcon, 
  Coins, 
  Compass,
  RotateCw
} from "lucide-react";

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<QuestSuggestion[]>(INITIAL_SUGGESTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<QuestSuggestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    difficulty: "MEDIUM" as QuestDifficulty,
    base_xp: 100,
    category_id: "health",
    tagsString: "",
    is_active: true,
  });

  const difficultyXPMap: Record<QuestDifficulty, number> = {
    EASY: 50,
    MEDIUM: 100,
    HARD: 150,
    EPIC: 300,
  };

  // Load suggestions & categories
  const loadData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setSuggestions(INITIAL_SUGGESTIONS);
      setCategories(INITIAL_CATEGORIES);
      setLoading(false);
      return;
    }

    try {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData && catData.length > 0) setCategories(catData);

      const { data: sugData, error } = await supabase
        .from("daily_quest_suggestions")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && sugData && sugData.length > 0) {
        const mapped: QuestSuggestion[] = sugData.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          category_id: item.category_id,
          difficulty: item.difficulty,
          base_xp: item.base_xp,
          tags: item.tags || [],
          is_active: item.is_active ?? true,
          category: (catData || INITIAL_CATEGORIES).find((c) => c.id === item.category_id),
        }));
        setSuggestions(mapped);
      } else {
        setSuggestions(INITIAL_SUGGESTIONS);
      }
    } catch (err) {
      console.error("Failed to load suggestions:", err);
      setSuggestions(INITIAL_SUGGESTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered suggestions
  const filteredSuggestions = suggestions.filter((sug) => {
    const matchesSearch =
      sug.title.toLowerCase().includes(search.toLowerCase()) ||
      (sug.description && sug.description.toLowerCase().includes(search.toLowerCase())) ||
      (sug.tags && sug.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesDiff = selectedDifficulty === "ALL" || sug.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === "ALL" || sug.category_id === selectedCategory;
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" ? sug.is_active !== false : sug.is_active === false);

    return matchesSearch && matchesDiff && matchesCat && matchesStatus;
  });

  // Handle open create modal
  const handleOpenCreate = () => {
    setFormData({
      id: `sug-${Date.now().toString(36)}`,
      title: "",
      description: "",
      difficulty: "MEDIUM",
      base_xp: 100,
      category_id: categories[0]?.id || "health",
      tagsString: "",
      is_active: true,
    });
    setIsCreateModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (sug: QuestSuggestion) => {
    setEditingSuggestion(sug);
    setFormData({
      id: sug.id,
      title: sug.title,
      description: sug.description || "",
      difficulty: sug.difficulty,
      base_xp: sug.base_xp,
      category_id: sug.category_id || categories[0]?.id || "health",
      tagsString: sug.tags ? sug.tags.join(", ") : "",
      is_active: sug.is_active !== false,
    });
  };

  // Handle Create Suggestion
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tags = formData.tagsString
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newSuggestion: QuestSuggestion = {
      id: formData.id.trim() || `sug-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id,
      difficulty: formData.difficulty,
      base_xp: Number(formData.base_xp) || 50,
      tags,
      is_active: formData.is_active,
      category: categories.find((c) => c.id === formData.category_id),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("daily_quest_suggestions")
          .insert({
            id: newSuggestion.id,
            title: newSuggestion.title,
            description: newSuggestion.description,
            category_id: newSuggestion.category_id,
            difficulty: newSuggestion.difficulty,
            base_xp: newSuggestion.base_xp,
            tags: newSuggestion.tags,
            is_active: newSuggestion.is_active,
          })
          .select()
          .single();

        if (!error && data) {
          setSuggestions((prev) => [
            {
              ...newSuggestion,
              category: categories.find((c) => c.id === data.category_id),
            },
            ...prev,
          ]);
        } else {
          setSuggestions((prev) => [newSuggestion, ...prev]);
        }
      } catch (err) {
        console.error(err);
        setSuggestions((prev) => [newSuggestion, ...prev]);
      }
    } else {
      setSuggestions((prev) => [newSuggestion, ...prev]);
    }

    setIsCreateModalOpen(false);
  };

  // Handle Update Suggestion
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSuggestion || !formData.title.trim()) return;

    const tags = formData.tagsString
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updatedData: Partial<QuestSuggestion> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id,
      difficulty: formData.difficulty,
      base_xp: Number(formData.base_xp) || 50,
      tags,
      is_active: formData.is_active,
      category: categories.find((c) => c.id === formData.category_id),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("daily_quest_suggestions")
          .update({
            title: updatedData.title,
            description: updatedData.description,
            category_id: updatedData.category_id,
            difficulty: updatedData.difficulty,
            base_xp: updatedData.base_xp,
            tags: updatedData.tags,
            is_active: updatedData.is_active,
          })
          .eq("id", editingSuggestion.id);

        if (error) console.error("Update error:", error);
      } catch (err) {
        console.error(err);
      }
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === editingSuggestion.id ? { ...s, ...updatedData } : s))
    );
    setEditingSuggestion(null);
  };

  // Handle Toggle Active
  const handleToggleActive = async (sug: QuestSuggestion) => {
    const nextActive = !sug.is_active;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("daily_quest_suggestions")
          .update({ is_active: nextActive })
          .eq("id", sug.id);
      } catch (err) {
        console.error(err);
      }
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === sug.id ? { ...s, is_active: nextActive } : s))
    );
  };

  // Handle Delete Suggestion
  const handleDelete = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("daily_quest_suggestions").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }

    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  // Category Icon helper
  const renderCategoryIcon = (catId?: string, className = "w-3.5 h-3.5") => {
    switch (catId) {
      case "health":
        return <HeartPulse className={className} />;
      case "work":
        return <Briefcase className={className} />;
      case "education":
        return <GraduationCap className={className} />;
      case "personal":
        return <UserIcon className={className} />;
      case "finance":
        return <Coins className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-[#fae8b6]">
              Rekomendasi Quests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              Quest Builder Catalog
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Kelola template aktivitas harian terkurasi yang dapat dipilih petualang di fitur Quest Builder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b2130] hover:bg-[#252c40] border border-white/10 text-slate-300 font-bold text-xs transition"
            title="Muat ulang data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs tracking-wider transition shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekomendasi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141824] border border-[#242938] flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, deskripsi, atau tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-xs text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d1017] border border-[#242938] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Kategori ({suggestions.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Kesulitan:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#0d1017] border border-[#242938] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="EASY">EASY (50 XP)</option>
            <option value="MEDIUM">MEDIUM (100 XP)</option>
            <option value="HARD">HARD (150 XP)</option>
            <option value="EPIC">EPIC (300 XP)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0d1017] border border-[#242938] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Suggestions List Table */}
      <div className="bg-[#141824] border border-[#242938] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0f131c] text-[#94a3b8] uppercase tracking-wider text-[11px] border-b border-[#242938]">
              <tr>
                <th className="py-3 px-4 font-bold">Rekomendasi Quest</th>
                <th className="py-3 px-4 font-bold">Kategori</th>
                <th className="py-3 px-4 font-bold">Tingkat & XP</th>
                <th className="py-3 px-4 font-bold">Tags</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242938]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Memuat katalog rekomendasi quest...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuggestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">Tidak ada rekomendasi yang cocok</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Coba sesuaikan kata kunci atau filter pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSuggestions.map((item) => {
                  const category = categories.find((c) => c.id === item.category_id);
                  const isActive = item.is_active !== false;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#1a2030]/60 transition group"
                    >
                      {/* Title & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#f8fafc] text-sm group-hover:text-amber-300 transition">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md font-sans">
                            {item.description}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {item.id}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {category ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                            style={{
                              borderColor: `${category.color}40`,
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }}
                          >
                            {renderCategoryIcon(category.id)}
                            <span>{category.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Difficulty & XP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                              item.difficulty === "EASY"
                                ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-400"
                                : item.difficulty === "MEDIUM"
                                ? "border-sky-500/50 bg-sky-950/40 text-sky-400"
                                : item.difficulty === "HARD"
                                ? "border-purple-500/50 bg-purple-950/40 text-purple-300"
                                : "border-amber-500/50 bg-amber-950/40 text-amber-300"
                            }`}
                          >
                            {item.difficulty}
                          </span>
                          <span className="text-amber-300 font-black text-xs flex items-center gap-0.5">
                            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                            +{item.base_xp}
                          </span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.tags && item.tags.length > 0 ? (
                            item.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-[#0d1017] text-[10px] text-slate-400 border border-slate-700/50 font-mono"
                              >
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            isActive
                              ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50"
                              : "bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-900/50"
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-500/30 hover:bg-blue-900/50 transition"
                            title="Edit Rekomendasi"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/50 transition"
                            title="Hapus Rekomendasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#141824] border border-[#242938] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <div className="flex items-center gap-2 text-[#fae8b6] font-bold">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Tambah Rekomendasi Quest Baru</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ID Rekomendasi (Opsional / Otomatis)
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="sug-kesehatan-1"
                  className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Judul Quest *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Minum 2 Liter Air Putih (Potion of Hydration)"
                  className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Quest</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rincian petualangan atau panduan menyelesaikan misi..."
                  className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => {
                      const diff = e.target.value as QuestDifficulty;
                      setFormData({
                        ...formData,
                        difficulty: diff,
                        base_xp: difficultyXPMap[diff] || 50,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
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
                  <label className="block text-slate-300 font-bold mb-1">Base XP Reward</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={formData.base_xp}
                    onChange={(e) =>
                      setFormData({ ...formData, base_xp: parseInt(e.target.value) || 50 })
                    }
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    placeholder="hidrasi, kesehatan, kebiasaan"
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-[#0d1017] border-[#242938] cursor-pointer"
                />
                <label
                  htmlFor="create_is_active"
                  className="text-slate-300 font-bold cursor-pointer select-none"
                >
                  Aktifkan di Builder (Muncul di saran user)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-slate-800 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold transition flex items-center gap-1.5 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Rekomendasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#141824] border border-[#242938] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <div className="flex items-center gap-2 text-[#fae8b6] font-bold">
                <Edit className="w-5 h-5 text-blue-400" />
                <span>Edit Rekomendasi Quest</span>
              </div>
              <button
                onClick={() => setEditingSuggestion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ID (Tidak bisa diubah)</label>
                <input
                  type="text"
                  disabled
                  value={editingSuggestion.id}
                  className="w-full px-3 py-2 bg-[#0a0d14] border border-[#242938] rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Judul Quest *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Quest</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => {
                      const diff = e.target.value as QuestDifficulty;
                      setFormData({
                        ...formData,
                        difficulty: diff,
                        base_xp: difficultyXPMap[diff] || formData.base_xp,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
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
                  <label className="block text-slate-300 font-bold mb-1">Base XP Reward</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={formData.base_xp}
                    onChange={(e) =>
                      setFormData({ ...formData, base_xp: parseInt(e.target.value) || 50 })
                    }
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1017] border border-[#242938] rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-[#0d1017] border-[#242938] cursor-pointer"
                />
                <label
                  htmlFor="edit_is_active"
                  className="text-slate-300 font-bold cursor-pointer select-none"
                >
                  Aktifkan di Builder (Muncul di saran user)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setEditingSuggestion(null)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-slate-800 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Perbarui Rekomendasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#141824] border border-red-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100">Hapus Rekomendasi?</h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Rekomendasi ini tidak akan muncul lagi di Quest Builder bagi pengguna.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-950/60"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

