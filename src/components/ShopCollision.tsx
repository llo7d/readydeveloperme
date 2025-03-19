import { useFrame } from '@react-three/fiber';
import { MutableRefObject, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ShopCollisionProps {
  shopPosition: THREE.Vector3;
  characterRef: MutableRefObject<THREE.Group | null>;
  shopSize: { width: number; height: number; depth: number };
  doorSize: { width: number; height: number };
  doorPosition: { x: number; z: number };
}

// This component prevents the character from walking through walls of the shop
// but allows them to enter through the door
const ShopCollision = ({ 
  shopPosition, 
  characterRef, 
  shopSize, 
  doorSize,
  doorPosition
}: ShopCollisionProps) => {
  const lastValidPosition = useRef(new THREE.Vector3());
  const collisionInitialized = useRef(false);
  
  // Calculate shop boundaries with a padding for more reliable collision
  const padding = 0.1; // Additional padding to prevent slipping through walls
  const characterRadius = 1.0; // Increased character radius to make collision more reliable
  
  const minX = shopPosition.x - shopSize.width/2 - padding;
  const maxX = shopPosition.x + shopSize.width/2 + padding;
  const minZ = shopPosition.z - shopSize.depth/2 - padding;
  const maxZ = shopPosition.z + shopSize.depth/2 + padding;
  
  // Door boundaries
  const doorMinX = shopPosition.x + doorPosition.x - doorSize.width/2 + padding;
  const doorMaxX = shopPosition.x + doorPosition.x + doorSize.width/2 - padding;
  const doorZ = shopPosition.z + doorPosition.z;
  
  // Debug flag - set to true if you want to see collision messages
  const debug = false;

  // Initialize the last valid position
  useEffect(() => {
    if (characterRef.current && !collisionInitialized.current) {
      lastValidPosition.current.copy(characterRef.current.position);
      collisionInitialized.current = true;
      if (debug) console.log("Collision initialized");
    }
  }, [characterRef]);

  useFrame(() => {
    if (!characterRef.current || !collisionInitialized.current) return;
    
    const character = characterRef.current;
    const position = character.position.clone();
    
    // Check collision
    const isColliding = isCollidingWithShop(position);
    
    if (debug && isColliding) {
      console.log("Collision detected: ", position);
    }
    
    // If position is valid, store it
    if (!isColliding) {
      lastValidPosition.current.copy(position);
      return;
    }
    
    // If position is inside walls, revert to last valid position
    character.position.copy(lastValidPosition.current);
  });
  
  // Check if a position is colliding with the shop walls
  const isCollidingWithShop = (position: THREE.Vector3) => {
    // First check if the position is within collision range of the shop
    const expanded = {
      minX: minX - characterRadius,
      maxX: maxX + characterRadius,
      minZ: minZ - characterRadius,
      maxZ: maxZ + characterRadius
    };
    
    if (position.x < expanded.minX || position.x > expanded.maxX || 
        position.z < expanded.minZ || position.z > expanded.maxZ) {
      return false; // Not close enough to collide
    }
    
    // Check if the position is inside the house
    const isInside = 
      position.x > minX && position.x < maxX &&
      position.z > minZ && position.z < maxZ;
    
    // Check if position is in the doorway
    const isInDoorway = 
      Math.abs(position.z - doorZ) < characterRadius &&
      position.x >= doorMinX && position.x <= doorMaxX;
    
    // Check wall collisions
    const distanceToFrontWall = Math.abs(position.z - maxZ);
    const distanceToBackWall = Math.abs(position.z - minZ);
    const distanceToLeftWall = Math.abs(position.x - minX);
    const distanceToRightWall = Math.abs(position.x - maxX);
    
    const collidesWithFrontWall = distanceToFrontWall < characterRadius && 
      position.x > minX && position.x < maxX && position.z > maxZ;
    
    const collidesWithBackWall = distanceToBackWall < characterRadius && 
      position.x > minX && position.x < maxX && position.z < minZ;
    
    const collidesWithLeftWall = distanceToLeftWall < characterRadius && 
      position.z > minZ && position.z < maxZ && position.x < minX;
    
    const collidesWithRightWall = distanceToRightWall < characterRadius && 
      position.z > minZ && position.z < maxZ && position.x > maxX;
    
    // If we're in the doorway, no collision
    if (isInDoorway) {
      return false;
    }
    
    // If completely inside the house (not near walls), no collision
    if (isInside && 
        distanceToFrontWall > characterRadius && 
        distanceToBackWall > characterRadius && 
        distanceToLeftWall > characterRadius && 
        distanceToRightWall > characterRadius) {
      return false;
    }
    
    // If we collide with any wall, report collision
    if (collidesWithFrontWall || collidesWithBackWall || 
        collidesWithLeftWall || collidesWithRightWall) {
      return true;
    }
    
    // Final check: are we inside the shop walls but not in doorway?
    return isInside && !isInDoorway;
  };

  return null; // Invisible utility component
};

export default ShopCollision; 