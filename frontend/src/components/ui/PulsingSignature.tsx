import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

interface PulsingSignatureProps {
  color?: string;
  speed?: number;
  distort?: number;
  scale?: number;
}

const AnimatedShape: React.FC<PulsingSignatureProps> = ({ 
  color = '#2563eb', // Default evismart-blue
  speed = 1.5,
  distort = 0.3, // Lower distortion so the tooth shape is recognizable
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing pulse and rotation
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(t / 2) * 0.15;
      groupRef.current.rotation.y = Math.cos(t / 2) * 0.2;
      groupRef.current.position.y = Math.sin(t / 1.5) * 0.05;
      
      const pulseScale = scale * (1 + Math.sin(t * speed) * 0.03);
      groupRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  // Shared material for the fused, liquid look
  const materialProps = {
    color,
    distort,
    speed,
    roughness: 0.1,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Crown Body - Central mass */}
        <Sphere args={[0.7, 64, 64]} position={[0, 0.2, 0]} scale={[1.1, 0.9, 0.9]}>
          <MeshDistortMaterial attach="material" {...materialProps} />
        </Sphere>
        
        {/* Left Cusp */}
        <Sphere args={[0.45, 64, 64]} position={[-0.35, 0.65, 0]}>
          <MeshDistortMaterial attach="material" {...materialProps} />
        </Sphere>

        {/* Right Cusp */}
        <Sphere args={[0.45, 64, 64]} position={[0.35, 0.65, 0]}>
          <MeshDistortMaterial attach="material" {...materialProps} />
        </Sphere>

        {/* Left Root */}
        <Sphere args={[0.35, 64, 64]} position={[-0.25, -0.6, 0]} scale={[1, 1.8, 1]}>
          <MeshDistortMaterial attach="material" {...materialProps} />
        </Sphere>

        {/* Right Root */}
        <Sphere args={[0.35, 64, 64]} position={[0.25, -0.6, 0]} scale={[1, 1.8, 1]}>
          <MeshDistortMaterial attach="material" {...materialProps} />
        </Sphere>
      </group>
    </Float>
  );
};

export const PulsingSignature: React.FC<PulsingSignatureProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <spotLight position={[-10, 10, -10]} intensity={1} color={props.color || '#2563eb'} />
      <AnimatedShape {...props} />
    </Canvas>
  );
};

