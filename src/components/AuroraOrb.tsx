
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const AuroraOrbMesh: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Create a gradient-like material using MeshStandardMaterial
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0099ff'),
      emissive: new THREE.Color('#0066ff'),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      
      // Pulsing effect when active
      const scale = isActive ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 1;
      meshRef.current.scale.setScalar(scale);
      
      // Color animation
      if (materialRef.current) {
        const hue = (state.clock.elapsedTime * 0.1) % 1;
        materialRef.current.color.setHSL(0.6 + hue * 0.2, 0.8, 0.6);
        materialRef.current.emissive.setHSL(0.6 + hue * 0.2, 0.9, 0.3);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <primitive ref={materialRef} object={material} attach="material" />
    </Sphere>
  );
};

interface AuroraOrbProps {
  isActive: boolean;
  onClick: () => void;
}

const AuroraOrb: React.FC<AuroraOrbProps> = ({ isActive, onClick }) => {
  return (
    <div 
      className="w-32 h-32 cursor-pointer"
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, 10]} intensity={0.3} color="#0099ff" />
        <AuroraOrbMesh isActive={isActive} />
      </Canvas>
    </div>
  );
};

export default AuroraOrb;
