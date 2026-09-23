"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminProvider";
import { 
  Shield, 
  Scroll, 
  Users, 
  FolderTree, 
  Award, 
  LayoutDashboard, 
  ArrowLeft, 
  LogOut, 
  Lock, 
  AlertTriangle, 
  Menu, 
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, role, isLoading, currentUser, toggleDemoAdmin } = useAdminAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
    { name: "Kelola Quests", href: "/admin/quests", icon: Scroll },
    { name: "Petualang (Users)", href: "/admin/users", icon: Users },
    { name: "Kategori Misi", href: "/admin/categories", icon: FolderTree },
    { name: "Lencana & Trofi", href: "/admin/badges", icon: Award },
  ];

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090b10] text-[#f4ebd0] flex flex-col items-center justify-center font-cinzel">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ca8a04] via-[#78350f] to-[#451a03] p-0.5 shadow-2xl shadow-amber-500/20 animate-pulse mb-4">
          <div className="w-full h-full bg-[#120c08] rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#facc15]" />
          </div>
        </div>
        <p className="text-sm font-bold text-[#fae8b6] tracking-wider animate-pulse">
          Memeriksa Izin Dewan Administrator...
        </p>
      </div>
    );
  }

  // 2. Access Denied State (Not Admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-[#f4ebd0] flex flex-col items-center justify-center p-4 sm:p-6 font-cinzel relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#18110b] border-2 border-red-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/40 mx-auto flex items-center justify-center mb-5 text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-red-200 tracking-wider mb-2">
            AKSES DITOLAK
          </h1>
          <p className="text-xs text-[#cca981] font-serif leading-relaxed mb-6">
            Halaman ini berada di bawah perlindungan segel dewan tertinggi. Hanya petualang dengan peran <span className="text-amber-400 font-bold font-mono">role: &apos;admin&apos;</span> yang memiliki wewenang untuk memasuki panel ini.
          </p>

          <div className="bg-[#100b07] border border-[#3d2719] rounded-xl p-4 text-left text-xs mb-6 space-y-2">
            <div className="flex items-center justify-between text-[#a3805b]">
              <span>Akun Anda:</span>
              <span className="font-mono text-[#fae8b6]">{currentUser?.email || "Tamu / Pengguna"}</span>
            </div>
            <div className="flex items-center justify-between text-[#a3805b]">
              <span>Peran Saat Ini:</span>
              <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 font-bold border border-red-900/50">
                {role || "user"}
              </span>
            </div>
          </div>

          {/* Quick instructions or Demo Toggle */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-xs text-left text-amber-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Mode Demo Lokal Aktif</span>
              </div>
              <p className="text-[11px] text-amber-300/80 mb-3">
                Anda dapat menguji akses Admin secara instan dengan menekan tombol simulasi di bawah:
              </p>
              <button
                onClick={toggleDemoAdmin}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg font-bold text-xs transition active:scale-95 shadow"
              >
                Aktifkan Role Admin (Demo Simulation)
              </button>
            </div>
          )}

          {isSupabaseConfigured && (
            <div className="mb-6 p-3 rounded-xl bg-[#130d09] border border-[#4a3424] text-[11px] text-left text-[#bda082] font-mono leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">Cara Promosi ke Admin di Supabase:</span>
              UPDATE public.profiles SET role = &apos;admin&apos; WHERE id = &apos;{currentUser?.id || "USER_ID"}&apos;;
            </div>
          )}

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#2a1d14] hover:bg-[#3d2a1d] border border-[#785b3b] text-xs font-bold text-[#fae8b6] tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Misiku</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Dashboard View
  return (
    <div className="min-h-screen bg-[#090b10] text-[#f4ebd0] flex flex-col lg:flex-row font-cinzel">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#12151d] border-r border-[#242938] shrink-0 min-h-screen sticky top-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#242938] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ca8a04] via-[#78350f] to-[#3a1a06] border border-[#d6ba8d]/40 flex items-center justify-center shadow-lg relative shrink-0">
            <Shield className="w-6 h-6 text-[#facc15]" />
            <span className="absolute text-[10px] font-black text-[#ffffff]">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-wider text-[#fae8b6]">MISIKU</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#717c96] tracking-wide font-sans">
              Refine Control Citadel
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition duration-150 ${
                  isActive
                    ? "bg-amber-500/15 text-[#facc15] border border-amber-500/40 shadow-sm"
                    : "text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1f2c]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#facc15]" : "text-[#64748b]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar info & Link to Game */}
        <div className="p-4 border-t border-[#242938] space-y-3">
          {!isSupabaseConfigured && (
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-300">
              <span className="font-bold block text-amber-200">Demo Admin Active</span>
              <button
                onClick={toggleDemoAdmin}
                className="text-[9px] underline text-amber-400 mt-1 hover:text-amber-200"
              >
                Ganti peran ke User (uji proteksi)
              </button>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#171b26] hover:bg-[#1f2433] text-[11px] font-bold text-[#cbd5e1] border border-[#2b3346] transition"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Dunia Misiku</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-[#12151d]/90 border-b border-[#242938] backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          {/* Mobile Brand & Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#1a1f2c] border border-[#2d3748] text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-black text-xs tracking-wider text-[#fae8b6]">MISIKU ADMIN</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#64748b]">
            <Link href="/admin" className="hover:text-slate-300 transition">Admin Panel</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#facc15] font-semibold">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </span>
          </div>

          {/* Right Header Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#181d2a] border border-[#2d3748]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 flex items-center justify-center text-[10px] font-black text-black">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-bold text-[#e2e8f0] leading-none">
                  {currentUser?.email?.split('@')[0] || "Admin"}
                </span>
                <span className="text-[9px] text-[#ca8a04] font-semibold">
                  Administrator
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="p-2 rounded-full bg-[#181d2a] hover:bg-[#232a3d] border border-[#2d3748] text-slate-400 hover:text-red-300 transition"
              title="Keluar ke Dunia Utama"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#12151d] border-b border-[#242938] px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold ${
                    isActive
                      ? "bg-amber-500/15 text-[#facc15] border border-amber-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-amber-400 border-t border-[#242938] mt-2 pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dunia Misiku</span>
            </Link>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

