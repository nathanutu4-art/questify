"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_QUESTS, INITIAL_CATEGORIES, INITIAL_BADGES } from "@/lib/data/initialData";
import { 
  Scroll, 
  Users, 
  FolderTree, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Plus, 
  Sparkles 
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalQuests: INITIAL_QUESTS.length,
    completedQuests: INITIAL_QUESTS.filter(q => q.is_completed).length,
    totalUsers: 1,
    adminUsers: 1,
    totalCategories: INITIAL_CATEGORIES.length,
    totalBadges: INITIAL_BADGES.length,
  });
  const [recentQuests, setRecentQuests] = useState<any[]>(INITIAL_QUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Quests count
        const { data: questsData, count: questsCount } = await supabase
          .from("quests")
          .select("*", { count: "exact" });

        // 2. Fetch Profiles count
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, role");

        // 3. Fetch Categories count
        const { count: categoriesCount } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });

        // 4. Fetch Badges count
        const { count: badgesCount } = await supabase
          .from("badges")
          .select("*", { count: "exact", head: true });

        const quests = questsData || [];
        const profiles = profilesData || [];
        const completed = quests.filter(q => q.is_completed).length;
        const admins = profiles.filter(p => p.role === "admin").length;

        setStats({
          totalQuests: questsCount || quests.length || INITIAL_QUESTS.length,
          completedQuests: completed,
          totalUsers: profiles.length || 1,
          adminUsers: admins || 1,
          totalCategories: categoriesCount || INITIAL_CATEGORIES.length,
          totalBadges: badgesCount || INITIAL_BADGES.length,
        });

        if (quests.length > 0) {
          setRecentQuests(quests.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  const cards = [
    {
      title: "Total Quests",
      value: stats.totalQuests,
      sub: `${stats.completedQuests} Selesai • ${stats.totalQuests - stats.completedQuests} Aktif`,
      icon: Scroll,
      color: "from-blue-600/20 to-blue-900/10",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
      href: "/admin/quests",
    },
    {
      title: "Total Petualang (Users)",
      value: stats.totalUsers,
      sub: `${stats.adminUsers} Administrator • ${stats.totalUsers - stats.adminUsers} Pengguna`,
      icon: Users,
      color: "from-amber-600/20 to-amber-900/10",
      border: "border-amber-500/30",
      iconColor: "text-amber-400",
      href: "/admin/users",
    },
    {
      title: "Kategori Misi",
      value: stats.totalCategories,
      sub: "Pekerjaan, Kesehatan, Edukasi, dll",
      icon: FolderTree,
      color: "from-emerald-600/20 to-emerald-900/10",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      href: "/admin/categories",
    },
    {
      title: "Lencana & Trofi 3D",
      value: stats.totalBadges,
      sub: "Pencapaian XP & Milestone",
      icon: Award,
      color: "from-purple-600/20 to-purple-900/10",
      border: "border-purple-500/30",
      iconColor: "text-purple-400",
      href: "/admin/badges",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242938]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-[#fae8b6]">
            Citadel Administrator Misiku
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-sans">
            Pusat kendali database Refine untuk mengelola seluruh data ekosistem Misiku.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/quests"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs tracking-wider transition shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Quest Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} bg-[#141824] border ${card.border} hover:border-amber-400/50 transition group shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-[#1b2130] border border-white/5 ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-[#f8fafc] group-hover:text-[#fae8b6] transition">
                  {card.value}
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-1 font-sans flex items-center justify-between">
                  <span>{card.sub}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition text-amber-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Quests Activity (2 cols) */}
        <div className="lg:col-span-2 bg-[#12151f] border border-[#242938] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-[#fae8b6] tracking-wider">
                Aktivitas Quest Terbaru
              </h2>
            </div>
            <Link
              href="/admin/quests"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#242938] text-slate-400 font-cinzel">
                  <th className="pb-3 font-bold">Judul Quest</th>
                  <th className="pb-3 font-bold">Kesulitan</th>
                  <th className="pb-3 font-bold">XP</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2333]">
                {recentQuests.map((q) => (
                  <tr key={q.id} className="hover:bg-[#181d2c] transition">
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {q.title}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === 'EPIC' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        q.difficulty === 'HARD' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        q.difficulty === 'MEDIUM' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-400">
                      +{q.base_xp} XP
                    </td>
                    <td className="py-3">
                      {q.is_completed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Action Hub & RBAC Policy Guide (1 col) */}
        <div className="space-y-6">
          <div className="bg-[#12151f] border border-[#242938] rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[#fae8b6] tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Akses Cepat Pengelolaan</span>
            </h2>

            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl bg-[#181d2a] hover:bg-[#202738] border border-[#2b3346] text-xs font-semibold text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Ubah Peran / Tambah Admin</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center justify-between p-3 rounded-xl bg-[#181d2a] hover:bg-[#202738] border border-[#2b3346] text-xs font-semibold text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-emerald-400" />
                  <span>Kelola Kategori Misi</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/badges"
                className="flex items-center justify-between p-3 rounded-xl bg-[#181d2a] hover:bg-[#202738] border border-[#2b3346] text-xs font-semibold text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Konfigurasi Trofi 3D</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* RBAC Info Card */}
          <div className="bg-[#12151f] border border-amber-900/40 rounded-2xl p-5 shadow-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>Role-Based Access (RBAC)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Hanya akun dengan <code className="text-amber-300 font-mono">role: &apos;admin&apos;</code> di tabel <code className="text-slate-300 font-mono">profiles</code> yang dapat mengakses dan memodifikasi data ini. Kebijakan Row Level Security (RLS) di Supabase melindungi seluruh endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

