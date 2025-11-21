'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FluidSimulation3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create fluid simulation particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      
      // Colors (blue to purple gradient)
      colors[i3] = Math.random() * 0.5 + 0.5;     // R
      colors[i3 + 1] = Math.random() * 0.3;       // G
      colors[i3 + 2] = Math.random() * 0.5 + 0.5; // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add point lights
    const pointLight1 = new THREE.PointLight(0x4169e1, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x9370db, 1, 100);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Animation function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = new Float32Array(positions.length);
        
        // Update particle positions with fluid-like behavior
        for (let i = 0; i < positions.length; i += 3) {
          // Apply wave motion
          positions[i] += Math.sin(Date.now() * 0.001 + positions[i + 1] * 0.01) * 0.1;
          positions[i + 1] += Math.cos(Date.now() * 0.001 + positions[i] * 0.01) * 0.1;
          positions[i + 2] += Math.sin(Date.now() * 0.001 + positions[i + 1] * 0.01) * 0.05;
          
          // Boundary check
          if (Math.abs(positions[i]) > 25) positions[i] *= -0.8;
          if (Math.abs(positions[i + 1]) > 25) positions[i + 1] *= -0.8;
          if (Math.abs(positions[i + 2]) > 25) positions[i + 2] *= -0.8;
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ background: 'radial-gradient(circle, rgba(65,105,225,0.1) 0%, rgba(0,0,0,0.3) 100%)' }}
    />
  );
}