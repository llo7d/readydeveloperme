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

interface BarberShopProps {
  position?: [number, number, number];
  onChangeHair?: () => void;
  canChangeHair?: boolean;
  isCustomizing?: boolean;
}

const BarberShop = ({ 
  position = [0, 0, 0], 
  onChangeHair, 
  canChangeHair = true,
  isCustomizing = false
}: BarberShopProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [badgeHovered, setBadgeHovered] = useState(false);
  
  // Load the barber model
  const { nodes, materials } = useGLTF('/barber.glb') as GLTFResult;
  
  // Barber shop-specific configuration
  const shopScale = [5, 5, 5] as [number, number, number];
  const shopRotation = [0, -Math.PI / 5.5, 0] as [number, number, number];
  const shopOffset = [0, 2.5, 0] as [number, number, number];

  // Colors for the badge
  const nearColor = '#22aa22';  // Bright green when near
  const normalColor = '#8B4513'; // Light brown when not near (was #3a4673 blue)
  const nearOpacity = 0.5;      // Opacity when near
  const normalOpacity = 0.7;    // Opacity when not near

  // Handle badge click
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canChangeHair && onChangeHair) {
      onChangeHair();
    }
  };

  // Pulse animation for the badge
  const [badgeScale, setBadgeScale] = useState(1);
  useEffect(() => {
    if (!canChangeHair) return;
    
    let animationFrameId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.03;
      // Pulse between 1 and 1.1 when player is nearby
      if (canChangeHair) {
        setBadgeScale(1 + Math.sin(time) * 0.05);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [canChangeHair]);

  // Get badge text based on customization state
  const getBadgeText = () => {
    if (canChangeHair) {
      return "Change Hair";
    } else {
      return "Change Hair Here";
    }
  };

  return (
    <group ref={groupRef} position={new THREE.Vector3(10, position[1], 10)}>
      {/* The barber shop model with its own positioning, rotation and scale */}
      <group 
        position={new THREE.Vector3(shopOffset[0], shopOffset[1], shopOffset[2])}
        rotation={shopRotation}
        scale={shopScale}
        onClick={(e) => {
          e.stopPropagation();
          if (canChangeHair && onChangeHair) {
            onChangeHair();
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = canChangeHair ? 'pointer' : 'default';
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
      
      {/* 2D Badge above the barber shop */}
      <Html
        position={[-0.9, 3.7, 1.1]}
        center
        distanceFactor={10}
        occlude={[]}
        style={{
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
          transform: `scale(${badgeScale * 1.5})`,
          zIndex: 100,
        }}
      >
        <button
          onClick={handleBadgeClick}
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
          style={{
            background: isCustomizing ? '#e74c3c' : (canChangeHair ? nearColor : normalColor),
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
            cursor: canChangeHair ? 'pointer' : 'default',
            opacity: badgeHovered ? 1 : 0.9,
            pointerEvents: 'auto'
          }}
        >
          {getBadgeText()}
        </button>
      </Html>
      
      {/* Custom shadow under the barber shop */}
      <Shadow 
        color={isCustomizing ? '#e74c3c' : (canChangeHair ? nearColor : normalColor)}
        colorStop={0.5}
        opacity={canChangeHair ? nearOpacity : normalOpacity}
        position={[0, 0.01, 0]} 
        scale={[10, 7, 7]}
      />
    </group>
  );
};

// Preload the model to avoid flickering
useGLTF.preload('/barber.glb');

export default BarberShop; 