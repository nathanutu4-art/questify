"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_CATEGORIES } from "@/lib/data/initialData";
import { Category } from "@/types/quest";
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Briefcase, 
  HeartPulse, 
  GraduationCap, 
  User, 
  Coins, 
  Tag,
  Palette
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    icon: "Tag",
    color: "#38bdf8",
    description: "",
  });

  const loadCategories = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setCategories(INITIAL_CATEGORIES);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Icon preview helper
  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName.toLowerCase()) {
      case "briefcase": return <Briefcase className={className} />;
      case "heartpulse": return <HeartPulse className={className} />;
      case "graduationcap": return <GraduationCap className={className} />;
      case "user": return <User className={className} />;
      case "coins": return <Coins className={className} />;
      default: return <Tag className={className} />;
    }
  };

  // Handle Create Category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = formData.id.trim().toLowerCase().replace(/\s+/g, "_") || `cat_${Date.now()}`;

    const newCat: Category = {
      id,
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      description: formData.description.trim(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("categories").insert([newCat]).select().single();
        if (!error && data) {
          setCategories([...categories, data]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCategories([...categories, newCat]);
    }

    setIsCreateOpen(false);
    setFormData({ id: "", name: "", icon: "Tag", color: "#38bdf8", description: "" });
  };

  // Handle Edit Category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("categories")
          .update({
            name: editingCat.name,
            icon: editingCat.icon,
            color: editingCat.color,
            description: editingCat.description,
          })
          .eq("id", editingCat.id);

        if (!error) {
          setCategories(categories.map((c) => (c.id === editingCat.id ? editingCat : c)));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCategories(categories.map((c) => (c.id === editingCat.id ? editingCat : c)));
    }

    setEditingCat(null);
  };

  // Handle Delete Category
  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus kategori "${id}"? Quest yang terkait akan di-set tanpa kategori.`)) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (!error) {
          setCategories(categories.filter((c) => c.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-[#fae8b6] flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-amber-400" />
            <span>Kategori Misi</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Konfigurasi cabang kategori petualangan, ikon, warna tema, dan deskripsi skill tree.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="glass-btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-[#12151f] border border-[#242938] hover:border-amber-500/30 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${cat.color}18`,
                    borderColor: `${cat.color}45`,
                    color: cat.color,
                  }}
                >
                  {renderIcon(cat.icon)}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCat({ ...cat })}
                    className="glass-btn-icon p-2 rounded-lg text-slate-300 hover:text-amber-400"
                    title="Edit Kategori"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="glass-btn-icon p-2 rounded-lg text-slate-400 hover:text-red-400"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-100">{cat.name}</h2>
              <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed line-clamp-2">
                {cat.description || "Tidak ada deskripsi"}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1e2333] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>ID: {cat.id}</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="uppercase">{cat.color}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Tambah Kategori */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-md w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Buat Kategori Baru</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="glass-btn-icon p-1.5 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ID Kategori (slug unik) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: creativity"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Tampilan Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kreativitas & Seni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ikon Lucide</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="Briefcase">Briefcase</option>
                    <option value="HeartPulse">HeartPulse</option>
                    <option value="GraduationCap">GraduationCap</option>
                    <option value="User">User</option>
                    <option value="Coins">Coins</option>
                    <option value="Tag">Tag (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Warna Hex</label>
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

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kategori..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="glass-btn-gold px-5 py-2 rounded-xl font-bold font-cinzel tracking-wider"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Kategori */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-md w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-400" />
                <span>Edit Kategori</span>
              </h2>
              <button onClick={() => setEditingCat(null)} className="glass-btn-icon p-1.5 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Tampilan Kategori</label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ikon</label>
                  <select
                    value={editingCat.icon}
                    onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="Briefcase">Briefcase</option>
                    <option value="HeartPulse">HeartPulse</option>
                    <option value="GraduationCap">GraduationCap</option>
                    <option value="User">User</option>
                    <option value="Coins">Coins</option>
                    <option value="Tag">Tag (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Warna</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingCat.color}
                      onChange={(e) => setEditingCat({ ...editingCat, color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editingCat.color}
                      onChange={(e) => setEditingCat({ ...editingCat, color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editingCat.description || ""}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="glass-btn-gold px-5 py-2 rounded-xl font-bold font-cinzel tracking-wider"
                >
                  Perbarui Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

