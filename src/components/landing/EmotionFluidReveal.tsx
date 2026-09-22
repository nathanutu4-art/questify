'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EmotionFluidRevealProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDayMode?: boolean;
}

// ---------------------------------------------------------------------------
// GLSL Shaders based on Emotion Agency's WebGL Fluid Simulation
// ---------------------------------------------------------------------------

const baseVertexShader = `
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main() {
  vUv = uv;
  vL = uv - vec2(texelSize.x, 0.0);
  vR = uv + vec2(texelSize.x, 0.0);
  vT = uv + vec2(0.0, texelSize.y);
  vB = uv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position, 1.0);
}
`;

const splatShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 uColor;
uniform vec2 uPointer;
uniform float uRadius;

void main() {
  vec2 p = vUv - uPointer;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`;

const curlShader = `
precision highp float;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}
`;

const vorticityShader = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlValue;
uniform float dt;

void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L)) * 0.5;
  force /= length(force) + 0.0001;
  force *= uCurlValue * C;
  force.y *= -1.0;

  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}
`;

const divergenceShader = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;

  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;

  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const pressureShader = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float div = texture2D(uDivergence, vUv).x;
  float p = (L + R + B + T - div) * 0.25;
  gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
}
`;

const gradientSubtractShader = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B) * 0.5;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const advectionShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float uDissipation;

void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = uDissipation * texture2D(uSource, coord);
}
`;

const clearShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uClearValue;

void main() {
  gl_FragColor = uClearValue * texture2D(uTexture, vUv);
}
`;

// Composite Display Shader: Samples BG1.jpeg / BG3.jpeg and BG2.mp4 / BG4.mp4, applying fluid distortion, chromatic aberration & soft liquid reveal
const displayShader = `
precision highp float;
varying vec2 vUv;

uniform sampler2D tBaseNight;
uniform sampler2D tBaseDay;
uniform sampler2D tRevealNight;
uniform sampler2D tRevealDay;
uniform sampler2D tFluid;
uniform float uDayFactor;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uMobileOffset;
uniform float uDistort;
uniform float uChromaticAberration;

// Aspect ratio cover mapping with 20% mobile offset
vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes, float xOffset) {
  float screenRatio = screenRes.x / screenRes.y;
  float imgRatio = imgRes.x / imgRes.y;
  vec2 scale = vec2(1.0);
  vec2 offset = vec2(0.0);
  if (screenRatio > imgRatio) {
    scale.y = imgRatio / screenRatio;
    offset.y = (1.0 - scale.y) * 0.5;
  } else {
    scale.x = screenRatio / imgRatio;
    // 20% shift on mobile (xOffset = 0.2), center on desktop (xOffset = 0.0)
    offset.x = (1.0 - scale.x) * (0.5 + xOffset * 0.2);
  }
  return uv * scale + offset;
}

vec4 sampleChromatic(sampler2D tex, vec2 uv, vec2 dir, float amount) {
  float r = texture2D(tex, uv + dir * amount).r;
  vec4 center = texture2D(tex, uv);
  float b = texture2D(tex, uv - dir * amount).b;
  return vec4(r, center.g, b, center.a);
}

void main() {
  vec2 uv = vUv;
  vec3 fluid = texture2D(tFluid, uv).rgb;
  float fluidLen = length(fluid);

  // Viscous fluid displacement like Emotion Agency
  vec2 distortedUv = uv - fluid.xy * uDistort * 0.015;

  vec2 baseUv = getCoverUv(uv, uResolution, uImageResolution, uMobileOffset);
  vec2 revealUv = getCoverUv(distortedUv, uResolution, uImageResolution, uMobileOffset);

  // Mix base textures (BG1 night vs BG3 day)
  vec4 baseNight = texture2D(tBaseNight, baseUv);
  vec4 baseDay = texture2D(tBaseDay, baseUv);
  vec4 baseColor = mix(baseNight, baseDay, uDayFactor);

  // Chromatic aberration along fluid velocity direction
  vec2 caDir = normalize(fluid.xy + vec2(0.0001));
  float caAmount = fluidLen * uChromaticAberration * 0.008;

  // Mix reveal video textures (BG2 night vs BG4 day)
  vec4 revealNight;
  vec4 revealDay;
  if (caAmount > 0.00015) {
    revealNight = sampleChromatic(tRevealNight, revealUv, caDir, caAmount);
    revealDay = sampleChromatic(tRevealDay, revealUv, caDir, caAmount);
  } else {
    revealNight = texture2D(tRevealNight, revealUv);
    revealDay = texture2D(tRevealDay, revealUv);
  }
  vec4 revealColor = mix(revealNight, revealDay, uDayFactor);

  // Smooth, organic reveal mask driven by fluid density
  float revealFactor = smoothstep(0.01, 0.42, fluidLen);

  // Water caustic edge shimmer (cyan for night, sunlit gold for day)
  vec3 causticNight = vec3(0.35, 0.7, 1.0);
  vec3 causticDay = vec3(1.0, 0.85, 0.45);
  vec3 causticColor = mix(causticNight, causticDay, uDayFactor) * smoothstep(0.01, 0.12, fluidLen) * (1.0 - smoothstep(0.12, 0.45, fluidLen)) * 0.35;

  vec4 finalColor = mix(baseColor, revealColor, revealFactor);
  finalColor.rgb += causticColor;

  gl_FragColor = finalColor;
}
`;

class DoubleRenderTarget {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;

  constructor(width: number, height: number, options: THREE.RenderTargetOptions) {
    this.read = new THREE.WebGLRenderTarget(width, height, options);
    this.write = new THREE.WebGLRenderTarget(width, height, options);
  }

  swap() {
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

export const EmotionFluidReveal: React.FC<EmotionFluidRevealProps> = ({ containerRef, isDayMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dayModeRef = useRef(isDayMode);

  useEffect(() => {
    dayModeRef.current = isDayMode;
  }, [isDayMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    // Simulation resolutions (Emotion Agency defaults)
    const simRes = 128;
    const dyeRes = 256;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const camera = new THREE.Camera();
    const scene = new THREE.Scene();
    const quadGeom = new THREE.PlaneGeometry(2, 2);

    const rtOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    const simWidth = simRes;
    const simHeight = Math.round(simRes * (height / width));
    const dyeWidth = dyeRes;
    const dyeHeight = Math.round(dyeRes * (height / width));

    const velocity = new DoubleRenderTarget(simWidth, simHeight, rtOptions);
    const density = new DoubleRenderTarget(dyeWidth, dyeHeight, rtOptions);
    const pressure = new DoubleRenderTarget(simWidth, simHeight, rtOptions);
    const divergence = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
    const curl = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);

    const simTexelSize = new THREE.Vector2(1 / simWidth, 1 / simHeight);
    const dyeTexelSize = new THREE.Vector2(1 / dyeWidth, 1 / dyeHeight);

    // -------------------------------------------------------------------------
    // Fluid Simulation Materials
    // -------------------------------------------------------------------------
    const splatMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: splatShader,
      uniforms: {
        uTarget: { value: null },
        aspectRatio: { value: width / height },
        uColor: { value: new THREE.Color() },
        uPointer: { value: new THREE.Vector2() },
        uRadius: { value: 0.0035 },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const curlMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: curlShader,
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const vorticityMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: vorticityShader,
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        uCurlValue: { value: 2.2 }, // Emotion Agency curl
        dt: { value: 0.016 },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const divergenceMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: divergenceShader,
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const clearMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: clearShader,
      uniforms: {
        uTexture: { value: null },
        uClearValue: { value: 0.8 },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const pressureMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: pressureShader,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const gradSubtractMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: gradientSubtractShader,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        texelSize: { value: simTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const advectionMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: advectionShader,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        texelSize: { value: simTexelSize },
        dt: { value: 0.016 },
        uDissipation: { value: 0.98 },
      },
      depthTest: false,
      depthWrite: false,
    });

    // -------------------------------------------------------------------------
    // Background and Video Textures (Dual Night / Day Preloaded)
    // -------------------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();

    // Night Base (BG1.jpeg) and Day Base (BG3.jpeg)
    const baseTextureNight = textureLoader.load('/BG1.jpeg');
    baseTextureNight.minFilter = THREE.LinearFilter;
    baseTextureNight.magFilter = THREE.LinearFilter;

    const baseTextureDay = textureLoader.load('/BG3.jpeg');
    baseTextureDay.minFilter = THREE.LinearFilter;
    baseTextureDay.magFilter = THREE.LinearFilter;

    // Night Video (BG2.mp4)
    const videoNight = document.createElement('video');
    videoNight.src = '/BG2.mp4';
    videoNight.crossOrigin = 'anonymous';
    videoNight.loop = true;
    videoNight.muted = true;
    videoNight.playsInline = true;
    videoNight.autoplay = true;
    videoNight.play().catch(() => {});

    const videoTextureNight = new THREE.VideoTexture(videoNight);
    videoTextureNight.minFilter = THREE.LinearFilter;
    videoTextureNight.magFilter = THREE.LinearFilter;

    // Day Video (BG4.mp4)
    const videoDay = document.createElement('video');
    videoDay.src = '/BG4.mp4';
    videoDay.crossOrigin = 'anonymous';
    videoDay.loop = true;
    videoDay.muted = true;
    videoDay.playsInline = true;
    videoDay.autoplay = true;
    videoDay.play().catch(() => {});

    const videoTextureDay = new THREE.VideoTexture(videoDay);
    videoTextureDay.minFilter = THREE.LinearFilter;
    videoTextureDay.magFilter = THREE.LinearFilter;

    const displayMat = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: displayShader,
      uniforms: {
        tBaseNight: { value: baseTextureNight },
        tBaseDay: { value: baseTextureDay },
        tRevealNight: { value: videoTextureNight },
        tRevealDay: { value: videoTextureDay },
        tFluid: { value: null },
        uDayFactor: { value: isDayMode ? 1.0 : 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uImageResolution: { value: new THREE.Vector2(1920, 1080) },
        uMobileOffset: { value: width < 768 ? 1.0 : 0.0 },
        uDistort: { value: 0.65 }, // Emotion Agency viscous distortion
        uChromaticAberration: { value: 0.04 }, // Emotion Agency chromatic aberration
        texelSize: { value: dyeTexelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(quadGeom, displayMat);
    scene.add(quad);

    const renderPass = (material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => {
      quad.material = material;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    };

    // -------------------------------------------------------------------------
    // Pointer / Splat Event Handling
    // -------------------------------------------------------------------------
    interface SplatItem {
      x: number;
      y: number;
      dx: number;
      dy: number;
    }
    const splatQueue: SplatItem[] = [];
    const prevPointer = { x: -1, y: -1 };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = (containerRef.current || canvas).getBoundingClientRect();
      const currentX = (clientX - rect.left) / rect.width;
      const currentY = 1.0 - (clientY - rect.top) / rect.height; // WebGL Y is inverted

      if (prevPointer.x < 0) {
        prevPointer.x = currentX;
        prevPointer.y = currentY;
        return;
      }

      const dx = (currentX - prevPointer.x) * 12.0;
      const dy = (currentY - prevPointer.y) * 12.0;
      prevPointer.x = currentX;
      prevPointer.y = currentY;

      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        splatQueue.push({ x: currentX, y: currentY, dx, dy });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const container = containerRef.current || window;
    container.addEventListener('mousemove', onMouseMove as EventListener, { passive: true });
    container.addEventListener('touchmove', onTouchMove as EventListener, { passive: true });

    // -------------------------------------------------------------------------
    // Main Animation & Simulation Loop
    // -------------------------------------------------------------------------
    let animId: number;
    let isDestroyed = false;
    let currentDayFactor = isDayMode ? 1.0 : 0.0;

    const tick = () => {
      if (isDestroyed) return;

      // Smooth transition between night and day
      const targetDay = dayModeRef.current ? 1.0 : 0.0;
      currentDayFactor += (targetDay - currentDayFactor) * 0.08;
      displayMat.uniforms.uDayFactor.value = currentDayFactor;

      // 1. Advect Velocity
      advectionMat.uniforms.uVelocity.value = velocity.read.texture;
      advectionMat.uniforms.uSource.value = velocity.read.texture;
      advectionMat.uniforms.texelSize.value = simTexelSize;
      advectionMat.uniforms.uDissipation.value = 0.985;
      renderPass(advectionMat, velocity.write);
      velocity.swap();

      // 2. Process Splats
      while (splatQueue.length > 0) {
        const splat = splatQueue.shift()!;

        // Splat into Velocity
        splatMat.uniforms.uTarget.value = velocity.read.texture;
        splatMat.uniforms.aspectRatio.value = width / height;
        splatMat.uniforms.uPointer.value.set(splat.x, splat.y);
        splatMat.uniforms.uColor.value.setRGB(splat.dx, splat.dy, 0);
        splatMat.uniforms.uRadius.value = 0.0035;
        renderPass(splatMat, velocity.write);
        velocity.swap();

        // Splat into Density
        splatMat.uniforms.uTarget.value = density.read.texture;
        // Warm gold dye in day mode, magical violet in night mode
        if (dayModeRef.current) {
          splatMat.uniforms.uColor.value.setRGB(0.95, 0.75, 0.35);
        } else {
          splatMat.uniforms.uColor.value.setRGB(0.55, 0.4, 0.95);
        }
        splatMat.uniforms.uRadius.value = 0.0045;
        renderPass(splatMat, density.write);
        density.swap();
      }

      // 3. Compute Curl
      curlMat.uniforms.uVelocity.value = velocity.read.texture;
      curlMat.uniforms.texelSize.value = simTexelSize;
      renderPass(curlMat, curl);

      // 4. Vorticity Confinement (creates the iconic fluid eddies & swirls)
      vorticityMat.uniforms.uVelocity.value = velocity.read.texture;
      vorticityMat.uniforms.uCurl.value = curl.texture;
      vorticityMat.uniforms.texelSize.value = simTexelSize;
      renderPass(vorticityMat, velocity.write);
      velocity.swap();

      // 5. Divergence
      divergenceMat.uniforms.uVelocity.value = velocity.read.texture;
      divergenceMat.uniforms.texelSize.value = simTexelSize;
      renderPass(divergenceMat, divergence);

      // 6. Clear Pressure
      clearMat.uniforms.uTexture.value = pressure.read.texture;
      clearMat.uniforms.uClearValue.value = 0.8;
      renderPass(clearMat, pressure.write);
      pressure.swap();

      // 7. Pressure Jacobi Iterations (Incompressibility)
      pressureMat.uniforms.uDivergence.value = divergence.texture;
      pressureMat.uniforms.texelSize.value = simTexelSize;
      for (let i = 0; i < 16; i++) {
        pressureMat.uniforms.uPressure.value = pressure.read.texture;
        renderPass(pressureMat, pressure.write);
        pressure.swap();
      }

      // 8. Gradient Subtract
      gradSubtractMat.uniforms.uPressure.value = pressure.read.texture;
      gradSubtractMat.uniforms.uVelocity.value = velocity.read.texture;
      gradSubtractMat.uniforms.texelSize.value = simTexelSize;
      renderPass(gradSubtractMat, velocity.write);
      velocity.swap();

      // 9. Advect Density / Dye
      advectionMat.uniforms.uVelocity.value = velocity.read.texture;
      advectionMat.uniforms.uSource.value = density.read.texture;
      advectionMat.uniforms.texelSize.value = dyeTexelSize;
      advectionMat.uniforms.uDissipation.value = 0.96; // Smooth fluid dissipation
      renderPass(advectionMat, density.write);
      density.swap();

      // 10. Composite Display to Canvas
      displayMat.uniforms.tFluid.value = density.read.texture;
      renderPass(displayMat, null);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // -------------------------------------------------------------------------
    // Resize Handling
    // -------------------------------------------------------------------------
    const onResize = () => {
      if (!canvas || isDestroyed) return;
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      displayMat.uniforms.uResolution.value.set(width, height);
      displayMat.uniforms.uMobileOffset.value = width < 768 ? 1.0 : 0.0;
      splatMat.uniforms.aspectRatio.value = width / height;
    };
    window.addEventListener('resize', onResize);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove as EventListener);
      container.removeEventListener('touchmove', onTouchMove as EventListener);
      window.removeEventListener('resize', onResize);

      videoNight.pause();
      videoNight.src = '';
      videoTextureNight.dispose();
      baseTextureNight.dispose();

      videoDay.pause();
      videoDay.src = '';
      videoTextureDay.dispose();
      baseTextureDay.dispose();

      velocity.dispose();
      density.dispose();
      pressure.dispose();
      divergence.dispose();
      curl.dispose();

      renderer.dispose();
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
};

