'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DataVisualization3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
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

    // Create custom shader material
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `;

    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        // Create dynamic wave pattern
        float wave1 = sin(vPosition.x * 3.0 + time) * 0.1;
        float wave2 = sin(vPosition.y * 2.0 + time * 1.5) * 0.1;
        float wave3 = sin(vPosition.z * 4.0 + time * 0.8) * 0.1;
        
        float displacement = wave1 + wave2 + wave3;
        
        // Create color based on position and time
        vec3 color1 = vec3(0.2, 0.4, 0.8); // Blue
        vec3 color2 = vec3(0.8, 0.2, 0.6); // Pink
        vec3 color3 = vec3(0.2, 0.8, 0.4); // Green
        
        float mixer = sin(time * 0.5 + vPosition.x + vPosition.y) * 0.5 + 0.5;
        vec3 finalColor = mix(color1, color2, mixer);
        finalColor = mix(finalColor, color3, sin(time * 0.3) * 0.5 + 0.5);
        
        // Add glow effect
        float glow = 1.0 + displacement * 2.0;
        finalColor *= glow;
        
        gl_FragColor = vec4(finalColor, 0.9);
      }
    `;

    // Create geometry with more detail
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    
    // Apply displacement to vertices
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      vertex.normalize();
      vertex.multiplyScalar(2 + Math.random() * 0.5);
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Add wireframe overlay
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.3 
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    mesh.add(wireframe);

    // Add particles around the mesh
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x4169e1,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Update shader uniforms
      if (meshRef.current?.material instanceof THREE.ShaderMaterial) {
        meshRef.current.material.uniforms.time.value = time;
      }
      
      // Rotate mesh
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.01;
        
        // Pulsing scale
        const scale = 1 + Math.sin(time * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
      
      // Rotate particles
      particles.rotation.y += 0.002;
      
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
      style={{ background: 'radial-gradient(circle, rgba(0,8,20,0.8) 0%, rgba(0,0,0,0.9) 100%)' }}
    />
  );
}