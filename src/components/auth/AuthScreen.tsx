'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Shield, Sparkles, Mail, Lock, User, ArrowRight, Flame, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KineticGrid from '@/components/ui/kinetic-grid';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signin',
  onBack,
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setMessage({
        type: 'error',
        text: 'Koneksi Supabase belum terkonfigurasi pada .env.local',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const cleanUsername = username.trim() || email.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: cleanUsername,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage({
            type: 'success',
            text: 'Akun berhasil dibuat! Mengalihkan ke gerbang petualangan...',
          });
        } else {
          setMessage({
            type: 'success',
            text: 'Pendaftaran berhasil! Coba masuk sekarang.',
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Selamat datang kembali! Menyiapkan papan petualang...',
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat otentikasi. Pastikan email & password benar.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KineticGrid className="text-[#f4ebd0] font-cinzel">
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 relative">
        {/* Background Flickering Torchlights */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#d97706]/10 rounded-full blur-3xl pointer-events-none torch-glow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#b45309]/10 rounded-full blur-3xl pointer-events-none torch-glow" />

        {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-b from-[#ca8a04] via-[#78350f] to-[#291205] p-0.5 shadow-2xl shadow-amber-600/30 mb-3">
            <div className="w-full h-full bg-[#120c08] rounded-[14px] flex items-center justify-center">
              <Shield className="w-9 h-9 text-[#facc15]" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#ffffff] drop-shadow-md">
              QUESTIFY
            </h1>
          </div>
          <p className="text-xs text-[#cca981] mt-1.5 max-w-xs mx-auto leading-relaxed font-serif">
            Masuki gerbang petualangan tabletop RPG harianmu.
          </p>
        </div>

        {/* Auth Card with Heavy Carved Frame */}
        <div className="bg-[#24170f] border-4 border-[#855e24] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Toggle Switch */}
          <div className="flex items-center p-1 bg-[#120b07] rounded-full border-2 border-[#543b23] mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                !isSignUp
                  ? 'bg-[#b85d56] text-[#fff7f5] border border-[#e8a59e] shadow-sm'
                  : 'text-[#a8825c] hover:text-[#fae8b6]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                isSignUp
                  ? 'bg-[#b85d56] text-[#fff7f5] border border-[#e8a59e] shadow-sm'
                  : 'text-[#a8825c] hover:text-[#fae8b6]'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Alert Message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 mb-4 border ${
                  message.type === 'error'
                    ? 'bg-red-950/60 border-red-500/40 text-red-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {message.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-xs font-bold text-[#fae8b6] uppercase tracking-wider mb-1.5">
                  Nama Petualang (Username) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#785b39] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ShadowKnight"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fae8b6] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04] transition"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#fae8b6] uppercase tracking-wider mb-1.5">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#785b39] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="petualang@realm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fae8b6] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#fae8b6] uppercase tracking-wider mb-1.5">
                Kata Sandi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#785b39] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#120b07] border-2 border-[#543b23] rounded-xl text-[#fae8b6] placeholder-[#785b39] text-sm focus:outline-none focus:border-[#ca8a04] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#b85d56] hover:bg-[#a64e48] border-2 border-[#e8a59e] text-[#fff7f5] rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-3 shadow-sm"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{isSignUp ? 'Mulai Petualangan' : 'Masuk Petualangan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Perks */}
          <div className="mt-6 pt-5 border-t border-[#452b17] grid grid-cols-3 gap-2 text-center text-[10px] text-[#cca981]">
            <div className="flex flex-col items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Streak Harian</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>3D Badges</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#fde047]" />
              <span>Level & XP</span>
            </div>
          </div>
        </div>

        {/* Back to Home Button at the Bottom */}
        {onBack && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-full bg-[#1b140e] hover:bg-[#2a1e16] border border-[#6b5235] hover:border-[#b89563] text-xs font-bold text-[#edd59e] hover:text-[#fae8b6] font-cinzel tracking-wider flex items-center gap-2 transition duration-300 shadow-sm active:scale-95"
            >
              <span>&larr;</span>
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        )}
      </motion.div>
      </div>
    </KineticGrid>
  );
};
