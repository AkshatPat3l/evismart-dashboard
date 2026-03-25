import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Center, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface PulsingSignatureProps {
  color?: string;
  speed?: number;
  scale?: number;
  showGlassPlate?: boolean;
}

const PremiumCrystalTooth: React.FC<PulsingSignatureProps> = ({ 
  color = '#2563eb', // Default evismart-blue
  speed = 1.0,
  scale = 1,
  showGlassPlate = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const plateRef = useRef<THREE.Mesh>(null);

  // Procedurally generate a stylized molar tooth profile
  const toothShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at bottom left root point
    shape.moveTo(-0.4, -1);
    
    // Outer left wall curving up to crown
    shape.bezierCurveTo(-0.5, -0.5, -0.8, -0.2, -0.9, 0.4); 
    // Left cusp rounded peak
    shape.bezierCurveTo(-0.9, 0.9, -0.5, 1.0, -0.2, 0.6); 
    // Center valley
    shape.bezierCurveTo(-0.1, 0.3, 0.1, 0.3, 0.2, 0.6);   
    // Right cusp rounded peak
    shape.bezierCurveTo(0.5, 1.0, 0.9, 0.9, 0.9, 0.4);    
    // Outer right wall curving down to root
    shape.bezierCurveTo(0.8, -0.2, 0.5, -0.5, 0.4, -1);   
    // Right inner crotch curve
    shape.bezierCurveTo(0.2, -0.9, 0.15, -0.2, 0, -0.2);  
    // Left inner crotch curve
    shape.bezierCurveTo(-0.15, -0.2, -0.2, -0.9, -0.4, -1);
    
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.3, 
    bevelEnabled: true, 
    bevelThickness: 0.3, 
    bevelSize: 0.3, 
    bevelSegments: 32, // Optimized for performance balance
    curveSegments: 32, // Optimized for performance balance
  }), []);

  // Pre-calculate and center geometry once to save massive resources
  const toothGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(toothShape, extrudeSettings);
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, [toothShape, extrudeSettings]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Elegant, flawless rotation
      meshRef.current.rotation.y = t * 0.4 * speed;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      
      // Subtle pulse
      const pulseScale = scale * (0.8 + Math.sin(t * speed) * 0.02);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    if (plateRef.current) {
      plateRef.current.rotation.z = Math.sin(t / 2) * 0.05;
      plateRef.current.rotation.x = Math.cos(t / 2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <Center>
        {showGlassPlate && (
          <RoundedBox
            ref={plateRef}
            args={[3.5, 3.5, 0.05]} 
            radius={0.2} 
            smoothness={4}
            position={[0, 0, -0.6]} 
          >
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.05} 
              roughness={0.02} 
              ior={1.1} 
              reflectivity={0.5}
              color="#ffffff"
            />
          </RoundedBox>
        )}
        <mesh ref={meshRef} geometry={toothGeometry}>
          <meshPhysicalMaterial
            transmission={0.5} 
            thickness={1.5}
            roughness={0.15} 
            clearcoat={0.4} 
            clearcoatRoughness={0.1}
            metalness={0}
            ior={1.45} 
            reflectivity={0.3} 
            color="#ffffff" 
            attenuationColor={color} 
            attenuationDistance={1.2}
          />
        </mesh>
      </Center>
    </Float>
  );
};

export const PulsingSignature: React.FC<PulsingSignatureProps> = (props) => {
  return (
    <Canvas
      dpr={[1, 1.5]} // Optimized DPI to save GPU fill-rate
      gl={{ 
        powerPreference: "high-performance",
        alpha: true,
        antialias: true,
        stencil: false,
        depth: true
      }}
      camera={{ position: [0, 0, 3.2], fov: 35 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <Environment preset="city" />
      <PremiumCrystalTooth {...props} />
    </Canvas>
  );
};
