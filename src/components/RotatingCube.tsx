import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

const RotatingCube: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  
  // Rotate the cube on each frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

export default RotatingCube; 