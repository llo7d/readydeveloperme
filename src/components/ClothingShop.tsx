import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, Shadow, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useStore } from '../store/store'; // Import useStore
import SubToolbar from './SubToolbar'; // Import SubToolbar
import { Tool } from '../helpers/data'; // Import Tool type if not already

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
  isCustomizing?: boolean;
  // Add props needed for customization UI
  tool?: Tool; 
  selected?: Record<string, string>;
  subToolColors?: any[]; // Use a more specific type if available
  onClickItem?: (item: any) => void; // Use a more specific type if available
  onChangeColor?: (color: any) => void; // Use a more specific type if available
  onExitCustomization?: () => void;
  isMobile?: boolean; // Pass isMobile detection
}

const ClothingShop = ({ 
  position = [0, 0, 0], 
  onChangeClothing, 
  canChangeClothing = true,
  isCustomizing = false, // Add default value
  tool,
  selected,
  subToolColors,
  onClickItem,
  onChangeColor,
  onExitCustomization,
  isMobile = false // Add default value
}: ClothingShopProps) => {
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
  const normalColor = '#3a4673'; // Dark greyish blue when not near (was #ff4444 red)
  const nearOpacity = 0.5;      // Opacity when near
  const normalOpacity = 0.7;    // Opacity when not near

  // Get badge text based on customization state
  const getBadgeText = () => {
    if (isCustomizing) {
      return "Exit Clothing"; // Show "Exit Clothing" when customizing
    } else if (canChangeClothing) {
      return "Change Clothing";
    } else {
      return "Change Clothing Here"; // Or maybe just hide the badge entirely if not usable?
    }
  };

  // Handle badge click - toggles customization mode
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If customizing, clicking the badge should exit customization
    if (isCustomizing && onExitCustomization) {
      onExitCustomization();
    } 
    // If not customizing, but can change, clicking enters customization
    else if (onChangeClothing) {
      // Always call onChangeClothing even if canChangeClothing is false
      // This will position the character at the optimal position first
      onChangeClothing();
      
      // If we're not already customizing and the button says "Change Clothing",
      // ensure we enter customization mode after positioning
      if (!isCustomizing && !canChangeClothing) {
        // Use a small timeout to ensure character is positioned first
        setTimeout(() => {
          if (onChangeClothing) onChangeClothing();
        }, 100);
      }
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
          // Only allow entering customization mode, not exiting
          if (!isCustomizing && onChangeClothing) {
            // Always call onChangeClothing
            onChangeClothing();
            
            // If not near shop, trigger customization again after positioning
            if (!canChangeClothing) {
              setTimeout(() => {
                if (onChangeClothing) onChangeClothing();
              }, 100);
            }
          }
        }}
        onPointerOver={() => {
          // Show pointer cursor when ready to enter customization (not during customization)
          document.body.style.cursor = !isCustomizing ? 'pointer' : 'default';
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
        position={isMobile && isCustomizing ? [-0.9, 5.5, 1.1] : [-0.9, 3.7, 1.1]}
        center
        distanceFactor={10}
        occlude={[]}
        style={{
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
          zIndex: 100, // Ensure badge is on top
          ...(isMobile && isCustomizing ? {
            position: 'fixed',
            top: '30px',
            left: '50%',
            transform: 'translateX(5%)',
          } : {
            transform: `scale(${(isCustomizing ? 1 : badgeScale) * 1.5})`
          })
        }}
      >
        <button
          onClick={handleBadgeClick}
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
          style={{
            background: isCustomizing ? '#e74c3c' : (canChangeClothing ? nearColor : normalColor),
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
            cursor: isCustomizing ? 'pointer' : (canChangeClothing ? 'pointer' : 'default'),
            opacity: badgeHovered ? 1 : 0.9,
            pointerEvents: 'auto'
          }}
        >
          {getBadgeText()}
        </button>
      </Html>
      
      {/* Custom shadow under the house */}
      <Shadow 
        color={isCustomizing ? '#e74c3c' : (canChangeClothing ? nearColor : normalColor)}
        colorStop={0.5}
        opacity={canChangeClothing ? nearOpacity : normalOpacity}
        position={[0, 0.01, 0]} 
        scale={[10, 7, 7]}
      />

      {/* Customization UI - Show only when customizing */}
      {isCustomizing && (
        <Html
          center 
          distanceFactor={10} 
          // Remove position prop, use style only for positioning
          style={isMobile ? {
            // Mobile: Position icon row at bottom center
            position: 'fixed',
            bottom: '-5vh', // Smaller margin from bottom
            left: '50%',
            transform: 'translateX(-50%)', // Center horizontally
            width: 'auto', // Let content define width
            zIndex: 1002, 
            pointerEvents: 'none',
          } : {
            // Desktop: Keep existing side panel style
            position: 'fixed',
            top: '50%', 
            right: '5vw', 
            transform: 'translateY(-50%)', 
            width: '220px',
            background: 'rgba(42, 43, 50, 0.8)', 
            backdropFilter: 'blur(5px)',
            borderRadius: '10px',
            padding: '15px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            zIndex: 1002,
            maxHeight: '80vh',
            overflowY: 'auto',
            pointerEvents: 'auto' 
          }}
        >
          <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              pointerEvents: 'auto' // Ensure content inside is clickable 
            }}>
            {/* Render SubToolbar - It now handles its own layout */}
            {tool && selected && subToolColors && onClickItem && onChangeColor && (
              <SubToolbar
                subToolId={selected[tool.id]}
                tool={tool}
                colors={subToolColors}
                onClickItem={onClickItem}
                onChangeColor={onChangeColor}
                isMobile={isMobile} 
              />
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Preload the model to avoid flickering
useGLTF.preload('/house.glb');

export default ClothingShop; 