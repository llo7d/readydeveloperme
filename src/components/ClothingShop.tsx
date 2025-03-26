import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, Shadow, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Define the type for the GLTF result
type GLTFResult = GLTF & {
  nodes: {
    geometry_0: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material
  }
}

interface ClothingShopProps {
  position?: [number, number, number];
  onChangeClothing?: () => void;
  canChangeClothing?: boolean;
}

const ClothingShop = ({ position = [0, 0, 0], onChangeClothing, canChangeClothing = true }: ClothingShopProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [badgeHovered, setBadgeHovered] = useState(false);
  
  // Load the house model
  const { nodes, materials } = useGLTF('/house.glb') as GLTFResult;
  
  // House-specific configuration - modify these values to adjust the house only
  const houseScale = [5, 5, 5] as [number, number, number]; // Scale the house
  const houseRotation = [0, -Math.PI / 9, 0] as [number, number, number]; // Rotate house 20 degrees to the left
  const houseOffset = [0, 2.5, 0] as [number, number, number]; // Additional offset for the house within the group

  // Original ClothingShop colors
  const nearColor = '#22aa22';  // Bright green when near
  const normalColor = '#ff4444'; // Red when not near
  const nearOpacity = 0.5;      // Opacity when near
  const normalOpacity = 0.7;    // Opacity when not near

  // Handle badge click
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canChangeClothing && onChangeClothing) {
      onChangeClothing();
    }
  };

  // Pulse animation for the badge
  const [badgeScale, setBadgeScale] = useState(1);
  useEffect(() => {
    if (!canChangeClothing) return;
    
    let animationFrameId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.03;
      // Pulse between 1 and 1.1 when player is nearby
      if (canChangeClothing) {
        setBadgeScale(1 + Math.sin(time) * 0.05);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [canChangeClothing]);

  return (
    <group ref={groupRef} position={new THREE.Vector3(position[0], position[1], position[2])}>
      {/* The house model with its own positioning, rotation and scale */}
      <group 
        position={new THREE.Vector3(houseOffset[0], houseOffset[1], houseOffset[2])}
        rotation={houseRotation}
        scale={houseScale}
        onClick={(e) => {
          e.stopPropagation();
          if (canChangeClothing && onChangeClothing) {
            onChangeClothing();
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = canChangeClothing ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.geometry_0.geometry}
          material={nodes.geometry_0.material}
        />
      </group>
      
      {/* 2D Badge above the house */}
      <Html
        position={[-0.9, 3.7, 1.1]}
        center
        distanceFactor={10}
        occlude={[]}
        style={{
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
          transform: `scale(${badgeScale * 1.5})`,
          zIndex: 100, // Ensure badge is on top
        }}
      >
        <button
          onClick={handleBadgeClick}
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
          style={{
            background: canChangeClothing ? nearColor : normalColor,
            padding: '10px 16px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            border: '2px solid white',
            transition: 'all 0.3s ease',
            cursor: canChangeClothing ? 'pointer' : 'default',
            opacity: badgeHovered ? 1 : 0.9,
            pointerEvents: 'auto'
          }}
        >
          {canChangeClothing ? "Change Clothing" : "Change Clothing Here"}
        </button>
      </Html>
      
      {/* Custom shadow under the house */}
      <Shadow 
        color={canChangeClothing ? nearColor : normalColor}
        colorStop={0.5}
        opacity={canChangeClothing ? nearOpacity : normalOpacity}
        position={[0, 0.01, 0]} 
        scale={[10, 7, 7]}
      />
    </group>
  );
};

// Preload the model to avoid flickering
useGLTF.preload('/house.glb');

export default ClothingShop; 