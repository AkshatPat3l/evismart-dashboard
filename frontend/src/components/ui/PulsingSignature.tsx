import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface PulsingSignatureProps {
  color?: string;
  speed?: number;
  distort?: number;
  scale?: number;
}

const PremiumCrystalTooth: React.FC<PulsingSignatureProps> = ({ 
  color = '#2563eb', // Default evismart-blue
  speed = 1.0,
  distort = 0.1,
  scale = 1
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

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
    bevelSegments: 32,
    curveSegments: 32,
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Elegant, flawless rotation
      meshRef.current.rotation.y = t * 0.4 * speed;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      
      // Subtle pulse
      const pulseScale = scale * (0.8 + Math.sin(t * speed) * 0.02);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <Center>
        <mesh ref={meshRef}>
          <extrudeGeometry args={[toothShape, extrudeSettings]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            thickness={2 + distort * 5}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={1}
            ior={1.6}
            chromaticAberration={0.03 + distort * 0.1}
            anisotropy={0.5}
            color={color}
            attenuationColor={color}
            attenuationDistance={1}
          />
        </mesh>
      </Center>
    </Float>
  );
};

export const PulsingSignature: React.FC<PulsingSignatureProps> = (props) => {
  return (
    <Canvas
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
