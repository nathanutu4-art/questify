"use client";

import React, { useEffect, useRef } from "react";

interface StoneBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  shade: number; // 0 to 1 shade variance
  grainOffset: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  born: number;
}

export default function InteractiveStoneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const mouseSpeedRef = useRef<number>(0);
  const stonesRef = useRef<StoneBlock[]>([]);
  const embersRef = useRef<Ember[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // ── Generate Stone Wall Pattern ──────────────────────────────────────────
    const generateStones = () => {
      const stones: StoneBlock[] = [];
      const rowHeight = 46;
      const gap = 4.5;
      const rows = Math.ceil(height / (rowHeight + gap)) + 2;

      for (let r = 0; r < rows; r++) {
        const y = r * (rowHeight + gap);
        // Alternate staggered row offset
        const isOffset = r % 2 === 1;
        let x = isOffset ? -50 : -10;

        while (x < width + 60) {
          // Semi-randomized stone block widths
          const blockWidth = 75 + Math.floor((Math.sin(r * 13 + x * 0.05) * 0.5 + 0.5) * 65);
          stones.push({
            x,
            y,
            w: blockWidth,
            h: rowHeight,
            shade: (Math.sin(r * 29 + x * 7) * 0.5 + 0.5),
            grainOffset: Math.floor(Math.random() * 100),
          });
          x += blockWidth + gap;
        }
      }
      stonesRef.current = stones;
    };

    generateStones();

    // ── Event Handlers ───────────────────────────────────────────────────────
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateStones();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;
      const dx = mx - prevMouseRef.current.x;
      const dy = my - prevMouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouseSpeedRef.current = Math.min(dist, 50);

      mouseRef.current.x = mx;
      mouseRef.current.y = my;
      mouseRef.current.active = true;

      prevMouseRef.current = { x: mx, y: my };

      // Spawn fiery floating embers on fast mouse move
      if (mouseSpeedRef.current > 6 && embersRef.current.length < 50 && Math.random() < 0.45) {
        embersRef.current.push({
          x: mx + (Math.random() - 0.5) * 40,
          y: my + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.2 - Math.random() * 2.0,
          size: 1.5 + Math.random() * 2.2,
          life: 1.0,
          maxLife: 35 + Math.random() * 40,
          hue: 25 + Math.random() * 25, // golden amber to flame red
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 280,
        strength: 1.0,
        born: performance.now(),
      });

      // Burst of embers on click
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 1.0 + Math.random() * 3.5;
        embersRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1.5,
          size: 1.5 + Math.random() * 2.5,
          life: 1.0,
          maxLife: 45 + Math.random() * 40,
          hue: 20 + Math.random() * 30,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // ── Animation Loop ────────────────────────────────────────────────────────
    let time = 0;
    const render = () => {
      time += 0.025;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active;
      const heatRadius = 240;

      // 1. Dark Mortar Substrate Base
      ctx.fillStyle = "#07080b";
      ctx.fillRect(0, 0, width, height);

      // 2. Compute Click Ripples
      const now = performance.now();
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        const age = (now - rip.born) / 1000;
        rip.radius += 5.5;
        rip.strength = Math.max(0, 1 - rip.radius / rip.maxRadius);
        if (rip.strength <= 0 || rip.radius >= rip.maxRadius) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // 3. Draw Ambient Fire Glow in Background Gaps near cursor & ripples
      if (isMouseActive || ripplesRef.current.length > 0) {
        // Dynamic pulsating flame flicker
        const flicker = 0.88 + Math.sin(time * 3.5) * 0.08 + Math.sin(time * 7.1) * 0.04;

        if (isMouseActive) {
          const flameGradient = ctx.createRadialGradient(
            mx,
            my,
            8,
            mx,
            my,
            heatRadius * flicker
          );
          flameGradient.addColorStop(0, "rgba(255, 235, 150, 0.95)"); // White-hot core
          flameGradient.addColorStop(0.2, "rgba(251, 146, 60, 0.85)"); // Vibrant blazing orange
          flameGradient.addColorStop(0.5, "rgba(220, 38, 38, 0.55)");  // Deep magma red
          flameGradient.addColorStop(0.8, "rgba(146, 26, 12, 0.2)");   // Cooling ember edge
          flameGradient.addColorStop(1, "rgba(20, 5, 2, 0)");

          ctx.fillStyle = flameGradient;
          ctx.beginPath();
          ctx.arc(mx, my, heatRadius * flicker, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ripple fire waves
        for (const rip of ripplesRef.current) {
          const ripGrad = ctx.createRadialGradient(
            rip.x,
            rip.y,
            Math.max(0, rip.radius - 25),
            rip.x,
            rip.y,
            rip.radius + 30
          );
          ripGrad.addColorStop(0, "rgba(255, 180, 50, 0)");
          ripGrad.addColorStop(0.5, `rgba(255, 140, 30, ${(rip.strength * 0.65).toFixed(3)})`);
          ripGrad.addColorStop(0.8, `rgba(220, 38, 38, ${(rip.strength * 0.4).toFixed(3)})`);
          ripGrad.addColorStop(1, "rgba(220, 38, 38, 0)");

          ctx.fillStyle = ripGrad;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius + 30, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Draw Stone Blocks (with 3D bevels, chiseled texture, and fire edge highlights)
      const stones = stonesRef.current;
      const stonesLen = stones.length;

      for (let i = 0; i < stonesLen; i++) {
        const s = stones[i];

        // Quick bounding check against viewport
        if (s.x + s.w < -20 || s.x > width + 20 || s.y + s.h < -20 || s.y > height + 20) {
          continue;
        }

        // Calculate proximity of this stone to the cursor
        const cx = s.x + s.w * 0.5;
        const cy = s.y + s.h * 0.5;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = isMouseActive ? Math.max(0, 1 - dist / heatRadius) : 0;

        // Base stone color variation (dark slate granite)
        // Shade 0..1: slightly shift between #13161c and #1c212a
        const baseLuminance = 15 + Math.round(s.shade * 7); // ~15% to 22%
        const rVal = Math.round(baseLuminance * 1.05);
        const gVal = Math.round(baseLuminance * 1.08);
        const bVal = Math.round(baseLuminance * 1.25);

        // Stone Body Fill
        ctx.fillStyle = `rgb(${rVal},${gVal},${bVal})`;
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Stone Texture: Subtle natural chiseled stone grain
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        ctx.fillRect(s.x + 3, s.y + 3, s.w - 6, Math.max(1, s.h * 0.3));

        // 3D Bevel Edges:
        // Top & Left: light rim
        // Bottom & Right: dark shadow rim
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(s.x, s.y, s.w, 1.5); // Top bevel
        ctx.fillRect(s.x, s.y, 1.5, s.h); // Left bevel

        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(s.x, s.y + s.h - 1.5, s.w, 1.5); // Bottom inner shadow
        ctx.fillRect(s.x + s.w - 1.5, s.y, 1.5, s.h); // Right inner shadow

        // 5. Fire Rim Backlight:
        // When cursor is near the stone, the edges facing the mortar glow with fiery molten light!
        if (proximity > 0.02) {
          const heatStrength = proximity * proximity; // smoothstep
          const rimAlpha = (heatStrength * 0.9).toFixed(3);

          // Fiery rim stroke on stone perimeter
          ctx.strokeStyle = `rgba(251, 146, 60, ${rimAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);

          // Deep red inner heat gradient bleeding into stone edge
          if (proximity > 0.4) {
            const innerGlowAlpha = ((proximity - 0.4) * 0.35).toFixed(3);
            ctx.fillStyle = `rgba(239, 68, 68, ${innerGlowAlpha})`;
            ctx.fillRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
          }
        }
      }

      // 6. Draw Intense Crack Lines in Mortar near cursor (magma veins)
      if (isMouseActive) {
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";

        const flicker = 0.9 + Math.sin(time * 5.2) * 0.1;
        const lineGradient = ctx.createRadialGradient(mx, my, 4, mx, my, heatRadius * 0.75);
        lineGradient.addColorStop(0, "rgba(255, 255, 220, 0.98)");
        lineGradient.addColorStop(0.3, "rgba(253, 186, 116, 0.85)");
        lineGradient.addColorStop(0.7, "rgba(239, 68, 68, 0.5)");
        lineGradient.addColorStop(1, "rgba(185, 28, 28, 0)");

        ctx.strokeStyle = lineGradient;

        // Trace stone border cracks within heat circle
        for (let i = 0; i < stonesLen; i++) {
          const s = stones[i];
          const cx = s.x + s.w * 0.5;
          const cy = s.y + s.h * 0.5;
          const dist = Math.hypot(cx - mx, cy - my);

          if (dist < heatRadius * 0.75) {
            // Draw horizontal crack segment
            ctx.beginPath();
            ctx.moveTo(s.x, s.y + s.h + 2);
            ctx.lineTo(s.x + s.w, s.y + s.h + 2);
            ctx.stroke();

            // Draw vertical crack segment
            ctx.beginPath();
            ctx.moveTo(s.x + s.w + 2, s.y);
            ctx.lineTo(s.x + s.w + 2, s.y + s.h);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 7. Update & Draw Rising Embers
      const embers = embersRef.current;
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + (Math.sin(time * 4 + e.y * 0.05) * 0.4);
        e.y += e.vy;
        e.life -= 1 / e.maxLife;

        if (e.life <= 0 || e.y < -10) {
          embers.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, e.life);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 95%, 60%, ${alpha.toFixed(3)})`;
        ctx.shadowColor = `hsla(${e.hue}, 100%, 50%, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none"
      style={{ display: "block" }}
    />
  );
}

