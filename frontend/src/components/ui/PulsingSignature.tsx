import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Center, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei';
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
    bevelSegments: 64, // Doubled for ultra-smoothness
    curveSegments: 64, // Doubled for ultra-smoothness
  }), []);

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
            args={[3.5, 3.5, 0.05]} // Large plate
            radius={0.2} // Rounded corners
            smoothness={4}
            position={[0, 0, -0.8]} // Sit behind the tooth
          >
            <MeshTransmissionMaterial
              transmission={1}
              thickness={0.5}
              roughness={0.1}
              ior={1.2}
              chromaticAberration={0.05}
              anisotropy={0.1}
              color="#ffffff"
            />
          </RoundedBox>
        )}
        <mesh ref={meshRef}>
          <extrudeGeometry args={[toothShape, extrudeSettings]} />
          <meshPhysicalMaterial
            transmission={0.4} // Subtle translucency for enamel
            thickness={1}
            roughness={0.08} // Natural smooth ceramic, not a perfect mirror
            clearcoat={1} // High-gloss outer enamel surface
            clearcoatRoughness={0.05}
            metalness={0}
            ior={1.62} // Average IOR for human enamel
            reflectivity={0.5}
            color="#fbfcfd" // Off-white dental ceramic
            attenuationColor={color} // Brand color tint in the depth
            attenuationDistance={0.5}
          />
        </mesh>
      </Center>
    </Float>
  );
};

export const PulsingSignature: React.FC<PulsingSignatureProps> = (props) => {
  return (
    <Canvas
      dpr={[1, 2]} // High-DPI support to remove pixelation
      camera={{ position: [0, 0, 3.2], fov: 35 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
      <Environment preset="city" />
      <PremiumCrystalTooth {...props} />
    </Canvas>
  );
};
