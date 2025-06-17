
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader material for aurora effect
const AuroraMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color('#0066ff'),
    color2: new THREE.Color('#00ccff'),
    color3: new THREE.Color('#0099ff'),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vec2 uv = vUv;
      
      // Create flowing aurora patterns
      float wave1 = sin(uv.x * 8.0 + time * 2.0) * 0.5 + 0.5;
      float wave2 = sin(uv.y * 6.0 + time * 1.5) * 0.5 + 0.5;
      float wave3 = sin((uv.x + uv.y) * 4.0 + time * 3.0) * 0.5 + 0.5;
      
      // Mix colors based on waves
      vec3 color = mix(color1, color2, wave1);
      color = mix(color, color3, wave2 * wave3);
      
      // Add some transparency and glow
      float alpha = 0.8 + 0.2 * wave3;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AuroraMaterial });

const AuroraOrbMesh: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const materialRef = useRef<any>();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      
      // Pulsing effect when active
      const scale = isActive ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <auroraMaterial ref={materialRef} transparent />
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
        <AuroraOrbMesh isActive={isActive} />
      </Canvas>
    </div>
  );
};

export default AuroraOrb;
