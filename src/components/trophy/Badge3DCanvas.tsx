'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Badge3DCanvasProps {
  badgeType?: 'crystal' | 'shield' | 'sword' | 'crown' | 'gem';
  color?: string;
  isUnlocked?: boolean;
  size?: number;
  interactive?: boolean;
}

export const Badge3DCanvas: React.FC<Badge3DCanvasProps> = ({
  badgeType = 'crystal',
  color = '#38bdf8',
  isUnlocked = true,
  size = 180,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for Badge Object
    const badgeGroup = new THREE.Group();
    scene.add(badgeGroup);

    // Color Setup
    const baseColor = isUnlocked ? new THREE.Color(color) : new THREE.Color('#334155');
    const emissiveColor = isUnlocked ? new THREE.Color(color).multiplyScalar(0.3) : new THREE.Color('#0f172a');

    // Materials
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: isUnlocked ? 0.7 : 0.2,
      roughness: isUnlocked ? 0.25 : 0.8,
      emissive: emissiveColor,
      wireframe: !isUnlocked,
    });

    const goldRingMaterial = new THREE.MeshStandardMaterial({
      color: isUnlocked ? new THREE.Color('#fbbf24') : new THREE.Color('#475569'),
      metalness: 0.85,
      roughness: 0.2,
      emissive: isUnlocked ? new THREE.Color('#78350f') : new THREE.Color(0),
    });

    // Outer Torus Ring
    const ringGeometry = new THREE.TorusGeometry(1.3, 0.08, 16, 48);
    const ringMesh = new THREE.Mesh(ringGeometry, goldRingMaterial);
    badgeGroup.add(ringMesh);

    // Badge Centerpiece Mesh depending on type
    let centerpieceGeometry: THREE.BufferGeometry;
    switch (badgeType) {
      case 'gem':
      case 'crystal':
        centerpieceGeometry = new THREE.OctahedronGeometry(0.85, 0);
        break;
      case 'shield':
        centerpieceGeometry = new THREE.CylinderGeometry(0.8, 0.2, 1.2, 6);
        break;
      case 'crown':
        centerpieceGeometry = new THREE.ConeGeometry(0.85, 1.2, 5);
        break;
      case 'sword':
      default:
        centerpieceGeometry = new THREE.DodecahedronGeometry(0.75, 0);
        break;
    }

    const centerpieceMesh = new THREE.Mesh(centerpieceGeometry, mainMaterial);
    badgeGroup.add(centerpieceMesh);

    // Sparkle particles if unlocked
    let particleSystem: THREE.Points | null = null;
    if (isUnlocked) {
      const particleCount = 28;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 1.4 + Math.random() * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: baseColor,
        size: 0.06,
        transparent: true,
        opacity: 0.8,
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
      badgeGroup.add(particleSystem);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(isUnlocked ? 0xffffff : 0x64748b, 2.5, 20);
    pointLight1.position.set(3, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(baseColor, 2.0, 20);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Drag / Interaction handlers
    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !interactive) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      badgeGroup.rotation.y += deltaX * 0.015;
      badgeGroup.rotation.x += deltaY * 0.015;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isDragging.current) {
        badgeGroup.rotation.y += delta * 0.6;
        badgeGroup.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.08;
      }

      if (particleSystem) {
        particleSystem.rotation.y += delta * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      ringGeometry.dispose();
      centerpieceGeometry.dispose();
      mainMaterial.dispose();
      goldRingMaterial.dispose();
    };
  }, [badgeType, color, isUnlocked, size, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none`}
      style={{ width: size, height: size }}
      title={interactive ? 'Drag untuk memutar objek 3D' : ''}
    />
  );
};

