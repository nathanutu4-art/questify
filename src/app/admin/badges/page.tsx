"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_BADGES, INITIAL_CATEGORIES } from "@/lib/data/initialData";
import { Badge } from "@/types/quest";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Shield, 
  Sparkles, 
  Crown, 
  Sword, 
  Gem 
} from "lucide-react";

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  // Form
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    required_xp: 200,
    badge_type: "shield" as Badge["badge_type"],
    category_id: "" as string | null,
    color: "#38bdf8",
  });

  const loadBadges = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setBadges(INITIAL_BADGES);
      setCategories(INITIAL_CATEGORIES);
      setLoading(false);
      return;
    }

    try {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      const { data, error } = await supabase.from("badges").select("*");
      if (!error && data) {
        setBadges(data);
      }
    } catch (err) {
      console.error("Failed to load badges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const renderBadgeIcon = (type: Badge["badge_type"]) => {
    switch (type) {
      case "crown": return <Crown className="w-5 h-5 text-amber-400" />;
      case "sword": return <Sword className="w-5 h-5 text-blue-400" />;
      case "gem": return <Gem className="w-5 h-5 text-emerald-400" />;
      case "crystal": return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <Shield className="w-5 h-5 text-sky-400" />;
    }
  };

  // Handle Create Badge
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = formData.id.trim().toLowerCase().replace(/\s+/g, "_") || `badge_${Date.now()}`;

    const newBadge: Badge = {
      id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      required_xp: Number(formData.required_xp),
      badge_type: formData.badge_type,
      category_id: formData.category_id || null,
      color: formData.color,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("badges").insert([newBadge]).select().single();
        if (!error && data) {
          setBadges([...badges, data]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setBadges([...badges, newBadge]);
    }

    setIsCreateOpen(false);
    setFormData({
      id: "",
      name: "",
      description: "",
      required_xp: 200,
      badge_type: "shield",
      category_id: "",
      color: "#38bdf8",
    });
  };

  // Handle Edit Badge
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("badges")
          .update({
            name: editingBadge.name,
            description: editingBadge.description,
            required_xp: editingBadge.required_xp,
            badge_type: editingBadge.badge_type,
            category_id: editingBadge.category_id || null,
            color: editingBadge.color,
          })
          .eq("id", editingBadge.id);

        if (!error) {
          setBadges(badges.map((b) => (b.id === editingBadge.id ? editingBadge : b)));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setBadges(badges.map((b) => (b.id === editingBadge.id ? editingBadge : b)));
    }

    setEditingBadge(null);
  };

  // Handle Delete Badge
  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus lencana trofi "${id}"?`)) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("badges").delete().eq("id", id);
        if (!error) {
          setBadges(badges.filter((b) => b.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setBadges(badges.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-[#fae8b6] flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Lencana & Trofi 3D</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Konfigurasi penghargaan petualang, syarat akumulasi XP, dan model 3D Badge (Three.js).
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs tracking-wider transition shadow-lg active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lencana Baru</span>
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => {
          const cat = categories.find((c) => c.id === b.category_id);
          return (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-[#12151f] border border-[#242938] hover:border-amber-500/30 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md"
                    style={{
                      backgroundColor: `${b.color}15`,
                      borderColor: `${b.color}40`,
                    }}
                  >
                    {renderBadgeIcon(b.badge_type)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingBadge({ ...b })}
                      className="p-1.5 rounded-lg bg-[#1a1f2c] hover:bg-[#252c3f] text-slate-300 hover:text-amber-400 transition"
                      title="Edit Lencana"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg bg-[#1a1f2c] hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition"
                      title="Hapus Lencana"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">{b.name}</h2>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {b.badge_type}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e2333] flex items-center justify-between text-[11px] font-sans">
                <span className="font-bold text-amber-400 font-mono">
                  Syarat: {b.required_xp} XP
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {cat?.name ? `Kat: ${cat.name}` : "Global (Semua Misi)"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Tambah Lencana */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-md w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Buat Lencana Baru</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ID Lencana (slug unik) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: master_warrior"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Lencana *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Grand Architect"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Syarat</label>
                <textarea
                  rows={2}
                  placeholder="Kumpulkan 500 XP di Kategori Pekerjaan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Model 3D Badge</label>
                  <select
                    value={formData.badge_type}
                    onChange={(e) => setFormData({ ...formData, badge_type: e.target.value as Badge["badge_type"] })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="shield">Perisai (Shield)</option>
                    <option value="crystal">Kristal (Crystal)</option>
                    <option value="sword">Pedang (Sword)</option>
                    <option value="crown">Mahkota (Crown)</option>
                    <option value="gem">Permata (Gem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Syarat XP</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.required_xp}
                    onChange={(e) => setFormData({ ...formData, required_xp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori Tertentu</label>
                  <select
                    value={formData.category_id || ""}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="">Semua (Global XP)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Warna Aksen</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2c] text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold font-cinzel tracking-wider shadow"
                >
                  Simpan Lencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Lencana */}
      {editingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-md w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-400" />
                <span>Edit Lencana</span>
              </h2>
              <button onClick={() => setEditingBadge(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Lencana</label>
                <input
                  type="text"
                  required
                  value={editingBadge.name}
                  onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editingBadge.description}
                  onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Model 3D</label>
                  <select
                    value={editingBadge.badge_type}
                    onChange={(e) => setEditingBadge({ ...editingBadge, badge_type: e.target.value as Badge["badge_type"] })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="shield">Perisai (Shield)</option>
                    <option value="crystal">Kristal (Crystal)</option>
                    <option value="sword">Pedang (Sword)</option>
                    <option value="crown">Mahkota (Crown)</option>
                    <option value="gem">Permata (Gem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Syarat XP</label>
                  <input
                    type="number"
                    min="10"
                    value={editingBadge.required_xp}
                    onChange={(e) => setEditingBadge({ ...editingBadge, required_xp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setEditingBadge(null)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2c] text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold font-cinzel tracking-wider shadow"
                >
                  Perbarui Lencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

