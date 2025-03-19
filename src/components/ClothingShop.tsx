import React, { useRef, useState } from 'react';
import { Text, Html, Shadow } from '@react-three/drei';
import * as THREE from 'three';

interface ClothingShopProps {
  position?: [number, number, number];
  onChangeClothing?: () => void;
  canChangeClothing?: boolean;
}

const ClothingShop = ({ position = [0, 0, 0], onChangeClothing, canChangeClothing = true }: ClothingShopProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  
  // Convert position array to THREE.Vector3
  const positionVector = new THREE.Vector3(position[0], position[1], position[2]);

  // Materials
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    roughness: 0.2,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: '#bbbbbb',
    roughness: 0.4,
  });

  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: '#8a5a44', 
    roughness: 0.3,
  });

  const tshirtMaterial = new THREE.MeshStandardMaterial({ 
    color: '#4169e1', 
    roughness: 0.2,
  });
  
  // Button material changes on hover with brighter color
  const buttonMaterial = new THREE.MeshStandardMaterial({ 
    color: canChangeClothing 
      ? (buttonHovered ? '#44ff44' : '#33cc33') // Green when nearby and can change clothing
      : (buttonHovered ? '#ff3333' : '#ee5555'), // Red when too far
    roughness: 0.3,
    emissive: canChangeClothing 
      ? (buttonHovered ? '#44ff44' : '#229922') 
      : (buttonHovered ? '#ff3333' : '#cc0000'),
    emissiveIntensity: buttonHovered ? 0.8 : 0.5,
  });

  // Handle button click
  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (canChangeClothing && onChangeClothing) {
      onChangeClothing();
    }
  };

  // Determine button text based on proximity
  const buttonText = canChangeClothing ? "CLICK ME" : "CHANGE CLOTHING HERE";

  return (
    <group ref={groupRef} position={positionVector}>
      {/* House base */}
      <mesh material={wallMaterial} position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[5, 3, 5]} />
      </mesh>
      
      {/* Roof */}
      <mesh material={roofMaterial} position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4, 2, 4]} />
      </mesh>
      
      {/* Door */}
      <mesh material={doorMaterial} position={[0, 1, 2.51]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
      </mesh>
      
      {/* Windows */}
      <mesh material={doorMaterial} position={[1.5, 1.7, 2.51]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
      </mesh>
      
      <mesh material={doorMaterial} position={[-1.5, 1.7, 2.51]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
      </mesh>
      
      {/* T-Shirt Sign */}
      <group position={[0, 3, 2.6]}>
        {/* T-shirt base */}
        <mesh material={tshirtMaterial} position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 1, 0.1]} />
        </mesh>
        
        {/* T-shirt sleeves */}
        <mesh material={tshirtMaterial} position={[-0.8, 0.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
        </mesh>
        
        <mesh material={tshirtMaterial} position={[0.8, 0.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
        </mesh>
      </group>
      
      {/* 3D Button for changing clothes - moved above the door */}
      <group position={[0, 2.2, 2.6]}>
        <mesh
          material={buttonMaterial}
          position={[0, 0, 0]}
          onClick={handleButtonClick}
          onPointerOver={() => setButtonHovered(true)}
          onPointerOut={() => setButtonHovered(false)}
          castShadow
        >
          <boxGeometry args={[3, 0.5, 0.1]} />
        </mesh>
        
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="black"
          anchorX="center"
          anchorY="middle"
          strokeWidth={0.01}
          strokeColor="#ffffff"
        >
          {buttonText}
        </Text>
      </group>

      {/* 
        Custom shadow under the house
        To adjust shadow intensity manually:
        - Increase opacity (0.0-1.0) for stronger shadow
        - Decrease colorStop (0.0-1.0) for a more concentrated shadow
        - Increase scale values for a larger shadow area
      */}
      <Shadow 
        color="black" 
        colorStop={0.50}
        opacity={0.7}
        position={[0, 0.01, 0]} 
        scale={[10, 10, 10]}
      />

      {/* Additional green shadow when user is close enough to change clothing */}
      {canChangeClothing && (
        <Shadow 
          color="#22aa22" 
          colorStop={0.6}
          opacity={0.4}
          position={[0, 0.02, 0]} 
          scale={[12, 12, 12]}
        />
      )}
    </group>
  );
};

export default ClothingShop; 