'use client';

import React, { useMemo, useState, useRef } from 'react';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

import { EmotionFluidReveal } from './EmotionFluidReveal';

interface HeroSectionProps {
  onStartAdventure: () => void;
  onBeginQuest: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAdventure,
  onBeginQuest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDayMode, setIsDayMode] = useState(false);

  // Generate subtle static stars for the mysterious night sky
  const stars = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 85,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans"
    >
      {/* ========================================================================= */}
      {/* LAYER 0: BASE BACKGROUND (BG1.jpeg / BG3.jpeg + stardust & night sky)     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Base Image BG1.jpeg (Night) or BG3.jpeg (Day) - 20% right mobile, center desktop */}
        <img
          src={isDayMode ? '/BG3.jpeg' : '/BG1.jpeg'}
          alt="Hero Base Background"
          className="w-full h-full object-cover hero-bg-mobile-offset transition-opacity duration-700"
        />

        {/* Base Gradient Overlay for high-contrast typography */}
        <div className={`absolute inset-0 transition-colors duration-700 ${isDayMode ? 'bg-black/30' : 'bg-black/45'}`} />

        {/* Subtle Stardust Points (Visible in night mode) */}
        {!isDayMode &&
          stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white transition-opacity duration-1000"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
              }}
            />
          ))}

        {/* Shooting Star Line (Night mode only) */}
        {!isDayMode && (
          <div className="absolute top-[22%] left-[45%] w-24 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[-22deg] opacity-60" />
        )}

        {/* Minimal Delicate Crescent Moon (Night mode only) */}
        {!isDayMode && (
          <div className="absolute top-[18%] right-[32%] sm:right-[36%] w-7 h-7 rounded-full shadow-[inset_3px_2px_0_0_#ffffff] rotate-[-20deg] opacity-85" />
        )}

        {/* Soft Mysterious Ambient Glow */}
        <div className={`absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-700 ${isDayMode ? 'bg-amber-500/15' : 'bg-indigo-950/25'}`} />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 1: EMOTION AGENCY STYLE WEBGL FLUID REVEAL LAYER                   */}
      {/* ========================================================================= */}
      <EmotionFluidReveal containerRef={containerRef} isDayMode={isDayMode} />

      {/* ========================================================================= */}
      {/* LAYER 2: TOP NAVIGATION (Above reveal layer, interactive z-20)            */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 flex items-center justify-between">
        {/* Left: Fantasy RPG Brand Logo + Medieval Nav Links */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#4b5563] via-[#1f2937] to-[#111827] border-2 border-[#ca8a04] flex items-center justify-center shadow-lg relative">
              <span className="text-sm font-black text-[#facc15] font-serif">ψ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-[#fef08a] font-cinzel">QUESTIFY</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#cca981] font-cinzel tracking-wider">
            <button onClick={onStartAdventure} className="hover:text-[#fef08a] transition">
              Offerings
            </button>
            <button onClick={onStartAdventure} className="hover:text-[#fef08a] transition">
              Why Questify
            </button>
            <button onClick={onStartAdventure} className="hover:text-[#fef08a] transition">
              Skill Tree
            </button>
            <button onClick={onStartAdventure} className="hover:text-[#fef08a] transition">
              Achievements
            </button>
            <button onClick={onStartAdventure} className="hover:text-[#fef08a] transition">
              Help
            </button>
          </nav>
        </div>

        {/* Right: Day/Night Mode Fantasy Toggle Button + Pastel Bronze Login Button */}
        <div className="flex items-center gap-3.5">
          {/* Day / Night Mode Fantasy Toggle Button */}
          <button
            onClick={() => setIsDayMode(!isDayMode)}
            title={isDayMode ? 'Beralih ke Mode Malam' : 'Beralih ke Mode Siang'}
            className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b140e]/90 hover:bg-[#2b1f14] border border-[#d6ba8d] hover:border-[#fae8b6] transition-all duration-300 shadow-sm text-xs font-cinzel tracking-wider active:scale-95"
            aria-label="Toggle Day / Night Mode"
          >
            <div className={`w-4 h-4 flex items-center justify-center transition-transform duration-500 ${isDayMode ? 'rotate-90 scale-110' : 'rotate-0'}`}>
              {isDayMode ? (
                <Sun className="w-3.5 h-3.5 text-[#facc15] drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#c7d2fe] drop-shadow-[0_0_6px_rgba(199,210,254,0.7)]" />
              )}
            </div>
            <span className="hidden sm:inline text-[11px] font-bold text-[#ebd5ad] group-hover:text-[#fae8b6] transition">
              {isDayMode ? 'SIANG' : 'MALAM'}
            </span>
          </button>

          {/* Login Button */}
          <button
            onClick={onBeginQuest}
            className="px-6 py-2 rounded-full bg-[#261f18] hover:bg-[#362b21] border border-[#d6ba8d] hover:border-[#fae8b6] text-xs font-bold text-[#fae8b6] font-cinzel tracking-wider shadow-sm transition duration-300 active:scale-95"
          >
            Login
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* LAYER 2: HERO CONTENT AREA (Above reveal layer, interactive z-20)         */}
      {/* ========================================================================= */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 flex-1 flex flex-col justify-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl mx-auto md:ml-auto md:mr-0 flex flex-col items-center md:items-end text-center md:text-right font-cinzel"
        >
          {/* Headline: QUESTIFY in Soft Pastel Gold (Centered on mobile, right on desktop) */}
          <div className="overflow-hidden">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider leading-none mb-4 text-[#fae8b6]">
              QUESTIFY
            </h1>
          </div>

          {/* Supporting Headline: YOUR LEVELING UP ADVENTURE START HERE */}
          <div className="space-y-2 mb-8 flex flex-col items-center md:items-end">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#fef3c7] tracking-wide leading-snug">
              YOUR LEVELING UP ADVENTURE START HERE
            </h2>

            {/* Description: CREATE QUEST AND GET IT DONE TO LEVEL UP YOUR SELF */}
            <p className="text-xs sm:text-sm font-medium text-[#d9c8af] tracking-widest uppercase max-w-lg leading-relaxed font-serif">
              CREATE QUEST AND GET IT DONE TO LEVEL UP YOUR SELF
            </p>
          </div>

          {/* CTA Buttons Placement - Centered on Mobile, Right on Desktop */}
          <div className="flex flex-col sm:flex-row items-center md:items-end justify-center md:justify-end gap-3.5 pt-2 w-full sm:w-auto">
            {/* Primary CTA: START THE ADVENTURE → (Soft Pastel Terracotta/Rose) */}
            <button
              onClick={onStartAdventure}
              className="group w-full sm:w-auto px-7 py-3 rounded-full bg-[#b85d56] hover:bg-[#a64e48] border-2 border-[#e8a59e] text-[#fff7f5] text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 shadow-sm"
            >
              <span>START THE ADVENTURE</span>
              <ArrowRight className="w-4 h-4 text-[#fff7f5] group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* Secondary CTA: BEGIN YOUR QUEST → (Soft Pastel Slate/Wood with Pastel Gold Border) */}
            <button
              onClick={onBeginQuest}
              className="group w-full sm:w-auto px-7 py-3 rounded-full bg-[#261f18]/90 hover:bg-[#362b21] border-2 border-[#d6ba8d] hover:border-[#fae8b6] text-[#fae8b6] text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 backdrop-blur-md shadow-sm"
            >
              <span>BEGIN YOUR QUEST</span>
              <ArrowRight className="w-4 h-4 text-[#d6ba8d] group-hover:text-[#fae8b6] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* ========================================================================= */}
      {/* LAYER 2: FOOTER (Above reveal layer, interactive z-20)                    */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#a37f59] font-cinzel tracking-wider">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} QUESTIFY</span>
          <span>&bull;</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-6 font-semibold">
          <span className="hover:text-[#fef08a] transition cursor-pointer">PRIVACY</span>
          <span className="hover:text-[#fef08a] transition cursor-pointer">TERMS</span>
          <span className="hover:text-[#fef08a] transition cursor-pointer">SYSTEMS</span>
        </div>
      </footer>
    </div>
  );
};
