import React from 'react';
import { useGLTF } from '@react-three/drei';

const House = () => {
  const { scene } = useGLTF('/house.glb');

  return (
    <primitive 
      object={scene} 
      position={[10, 0, 10]} 
      scale={1}
    />
  );
};

export default House; 