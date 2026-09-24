'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { X, Database, ShieldCheck, Mail, Lock, User, KeyRound, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setMessage({
        type: 'error',
        text: 'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan KEY di file .env.local terlebih dahulu!',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Berhasil login! Sinkronisasi data dimulai.' });
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat autentikasi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#24170f] border-4 border-[#855e24] rounded-3xl shadow-2xl overflow-hidden font-cinzel text-[#f5ebd0]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#5a3a22] bg-[#1a110a]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#332014] text-[#facc15] rounded-xl border border-[#ca8a04]">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-[#fef08a] tracking-wide">
                {isSupabaseConfigured ? (isSignUp ? 'Daftar Akun Baru' : 'Login Petualang') : 'Konfigurasi Supabase'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="glass-btn-icon p-1.5 text-[#cca981] hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-gradient-to-b from-[#24170f] to-[#1a110a]">
            {!isSupabaseConfigured ? (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-[#3a2618] border border-[#a16207] rounded-xl text-[#facc15] inline-flex">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#fef08a]">Mode Demo Sedang Aktif</h3>
                <p className="text-xs text-[#d4b996] leading-relaxed text-left bg-[#150d08] p-4 rounded-xl border border-[#543b23] font-serif">
                  Misiku saat ini berjalan menggunakan <strong className="text-[#facc15]">Local RPG Engine</strong> (semua quest, progress XP, level, dan badge tersimpan otomatis di browser Anda).
                  <br /><br />
                  Untuk mengaktifkan <strong className="text-[#34d399]">Supabase Cloud Sync</strong>:
                  <br />
                  1. Buat project di Supabase.com
                  <br />
                  2. Jalankan skrip di file <code className="text-[#facc15]">supabase/schema.sql</code> di SQL Editor
                  <br />
                  3. Salin URL dan Anon Key ke file <code className="text-[#facc15]">.env.local</code>
                </p>
                <button
                  onClick={onClose}
                  className="glass-btn-gold w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  Lanjutkan Mode Demo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div
                    className={`p-3 rounded-xl text-xs border ${
                      message.type === 'error'
                        ? 'bg-red-950/60 border-red-500/40 text-red-300'
                        : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-[#fde047] uppercase tracking-wider mb-1">
                      Nama Petualang / Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8a5d3b] absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: ShadowHunter"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#fde047] uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8a5d3b] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="adventurer@realm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#fde047] uppercase tracking-wider mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8a5d3b] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fef08a] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-50 mt-2"
                >
                  {loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk Petualangan'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-[#ca8a04] hover:text-[#fef08a] transition underline"
                  >
                    {isSignUp ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar petualang baru'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

