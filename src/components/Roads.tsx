import React from 'react';
import * as THREE from 'three';

const Roads = () => {
  // Simple road parameters
  const roadColor = '#777777'; // Grey color for roads
  const roadHeight = 0.05; // Very thin roads

  return (
    <group>
      {/* Road to Shops */}
      <mesh 
        position={[3, 0.01, 26]} 
        rotation={[0, Math.PI * 0.18, 0]}
        receiveShadow
      >
        <boxGeometry args={[3, roadHeight, 15]} /> {/* Width, height, length */}
        <meshStandardMaterial color={roadColor} />
      </mesh>

      {/* Road to Helper */}
      <mesh 
        position={[-5, 0.01, 30]} 
        rotation={[0, -Math.PI * 0.15, 0]}
        receiveShadow
      >
        <boxGeometry args={[3, roadHeight, 10]} />
        <meshStandardMaterial color={roadColor} />
      </mesh>

      {/* Road near spawn point */}
      <mesh 
        position={[0, 0.01, 35]} 
        receiveShadow
      >
        <boxGeometry args={[6, roadHeight, 4]} />
        <meshStandardMaterial color={roadColor} />
      </mesh>

      {/* Additional road to clothing shop */}
      <mesh 
        position={[8, 0.01, 18]} 
        rotation={[0, Math.PI * 0.25, 0]}
        receiveShadow
      >
        <boxGeometry args={[3, roadHeight, 8]} />
        <meshStandardMaterial color={roadColor} />
      </mesh>

      {/* Additional road to barber shop */}
      <mesh 
        position={[2, 0.01, 12]} 
        rotation={[0, Math.PI * -0.1, 0]}
        receiveShadow
      >
        <boxGeometry args={[3, roadHeight, 8]} />
        <meshStandardMaterial color={roadColor} />
      </mesh>
    </group>
  );
};

export default Roads; 