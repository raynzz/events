'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BackgroundAnimation3D() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      canvas: document.createElement('canvas')
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create floating geometric shapes
    const shapes: THREE.Mesh[] = [];
    const shapeCount = 15;

    for (let i = 0; i < shapeCount; i++) {
      // Random geometry type
      const geometryType = Math.floor(Math.random() * 3);
      let geometry: THREE.BufferGeometry;
      
      switch (geometryType) {
        case 0:
          geometry = new THREE.BoxGeometry(
            Math.random() * 3 + 1,
            Math.random() * 3 + 1,
            Math.random() * 3 + 1
          );
          break;
        case 1:
          geometry = new THREE.SphereGeometry(
            Math.random() * 2 + 0.5,
            8,
            6
          );
          break;
        case 2:
          geometry = new THREE.ConeGeometry(
            Math.random() * 2 + 0.5,
            Math.random() * 4 + 2,
            6
          );
          break;
        default:
          geometry = new THREE.BoxGeometry(2, 2, 2);
      }

      // Material with transparency and glow
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        transparent: true,
        opacity: 0.3,
        shininess: 100
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position
      mesh.position.x = (Math.random() - 0.5) * 80;
      mesh.position.y = (Math.random() - 0.5) * 40;
      mesh.position.z = (Math.random() - 0.5) * 40;
      
      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      // Random scale
      const scale = Math.random() * 0.5 + 0.5;
      mesh.scale.setScalar(scale);
      
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional lights
    const directionalLight1 = new THREE.DirectionalLight(0x4169e1, 0.8);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x9370db, 0.6);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    // Animation function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate each shape
      shapes.forEach((shape, index) => {
        // Floating motion
        shape.position.y += Math.sin(time + index) * 0.01;
        
        // Rotation
        shape.rotation.x += 0.005 + index * 0.001;
        shape.rotation.y += 0.008 + index * 0.001;
        
        // Pulsing opacity
        const material = shape.material as THREE.MeshPhongMaterial;
        material.opacity = 0.2 + Math.sin(time * 2 + index) * 0.1;
      });
      
      // Camera movement
      camera.position.x = Math.sin(time * 0.1) * 10;
      camera.position.y = Math.cos(time * 0.15) * 5;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
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

  return isMounted ? (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  ) : null;
}