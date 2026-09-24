"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile } from "@/types/quest";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  User, 
  Flame, 
  Award, 
  Edit3, 
  X, 
  Check, 
  Sparkles,
  ShieldAlert
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: "u1",
      username: "ShadowKnight",
      avatar_url: undefined,
      total_xp: 750,
      level: 4,
      current_streak: 5,
      role: "admin",
    },
    {
      id: "u2",
      username: "ArcaneMage",
      avatar_url: undefined,
      total_xp: 320,
      level: 3,
      current_streak: 2,
      role: "user",
    },
    {
      id: "u3",
      username: "SwiftRanger",
      avatar_url: undefined,
      total_xp: 120,
      level: 2,
      current_streak: 1,
      role: "user",
    },
  ]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Load profiles from Supabase
  const loadUsers = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || (u.role || "user") === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Toggle Role between user and admin
  const handleToggleRole = async (userToToggle: UserProfile) => {
    const newRole: "admin" | "user" = userToToggle.role === "admin" ? "user" : "admin";
    const confirmText =
      newRole === "admin"
        ? `Angkat petualang "${userToToggle.username}" menjadi Administrator dewan?`
        : `Turunkan petualang "${userToToggle.username}" menjadi peran User biasa?`;

    if (!confirm(confirmText)) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userToToggle.id);

        if (!error) {
          setUsers(users.map((u) => (u.id === userToToggle.id ? { ...u, role: newRole } : u)));
        } else {
          alert(`Gagal mengubah peran: ${error.message}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsers(users.map((u) => (u.id === userToToggle.id ? { ...u, role: newRole } : u)));
    }
  };

  // Handle Save Adjusted Stats
  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            total_xp: Number(editingUser.total_xp),
            level: Number(editingUser.level),
            current_streak: Number(editingUser.current_streak),
            role: editingUser.role || "user",
          })
          .eq("id", editingUser.id);

        if (!error) {
          setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    }

    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-[#fae8b6] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Manajemen Petualang (Users)</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Kelola profil pengguna, atur hak akses peran (Admin / User), dan sesuaikan status XP/Level.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#12151f] border border-[#242938] flex flex-col sm:flex-row items-center gap-3 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama petualang atau user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 font-sans"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400/60 font-sans w-full sm:w-auto"
        >
          <option value="ALL">Semua Peran (Role)</option>
          <option value="admin">Administrator</option>
          <option value="user">User Biasa</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#12151f] border border-[#242938] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#242938] bg-[#161a26] text-slate-400 font-cinzel">
                <th className="py-3.5 px-4 font-bold">Nama Petualang</th>
                <th className="py-3.5 px-4 font-bold">Level</th>
                <th className="py-3.5 px-4 font-bold">Total XP</th>
                <th className="py-3.5 px-4 font-bold">Streak Harian</th>
                <th className="py-3.5 px-4 font-bold">Peran (Role)</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi & Wewenang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2333]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-cinzel">
                    Tidak ada petualang yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <tr key={u.id} className="hover:bg-[#181d2c] transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shrink-0">
                            <div className="w-full h-full rounded-full bg-[#120c08] flex items-center justify-center font-bold text-amber-300 text-xs">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{u.username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {u.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        Level {u.level}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {u.total_xp.toLocaleString()} XP
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{u.current_streak} Hari</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-600/30 text-slate-400 font-bold text-[10px]">
                            <User className="w-3 h-3" />
                            <span>USER</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Toggle Role Button */}
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
                            isAdmin
                              ? "glass-btn-primary"
                              : "glass-btn-gold"
                          }`}
                          title={isAdmin ? "Turunkan ke User biasa" : "Jadikan Admin"}
                        >
                          {isAdmin ? "Cabut Admin" : "Jadikan Admin"}
                        </button>

                        {/* Adjust Stats Button */}
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="glass-btn-icon p-2 rounded-lg text-slate-300 hover:text-amber-400 inline-flex items-center"
                          title="Sesuaikan Level/XP"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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

      {/* MODAL: Sesuaikan Stats Petualang */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-cinzel">
          <div className="max-w-md w-full bg-[#12151f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <h2 className="text-base font-bold text-[#fae8b6] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sesuaikan Status Petualang</span>
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="glass-btn-icon p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStats} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Username</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full px-3.5 py-2 bg-[#171b26]/50 border border-[#2b3346] rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Level</label>
                  <input
                    type="number"
                    min="1"
                    value={editingUser.level}
                    onChange={(e) => setEditingUser({ ...editingUser, level: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total XP</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUser.total_xp}
                    onChange={(e) => setEditingUser({ ...editingUser, total_xp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Streak Harian</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUser.current_streak}
                    onChange={(e) => setEditingUser({ ...editingUser, current_streak: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Peran (Role)</label>
                  <select
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as "admin" | "user" })}
                    className="w-full px-3 py-2 bg-[#171b26] border border-[#2b3346] rounded-xl text-slate-100"
                  >
                    <option value="user">User Biasa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="glass-btn-gold px-5 py-2 rounded-xl font-bold font-cinzel tracking-wider"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

