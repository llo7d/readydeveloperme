import { useFrame } from '@react-three/fiber';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ProximityDetectorProps {
  target: THREE.Vector3;
  characterRef: MutableRefObject<THREE.Group | null>;
  threshold: number;
  onNear: (isNear: boolean) => void;
}

const ProximityDetector = ({ target, characterRef, threshold, onNear }: ProximityDetectorProps) => {
  // Track last known state and position
  const lastNearState = useRef(false);
  const lastPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  
  useFrame(() => {
    if (!characterRef.current) return;
    
    // Get current position
    const position = characterRef.current.position;
    
    // Check if the character is moving
    if (lastPosition.current.x !== 0 || lastPosition.current.y !== 0 || lastPosition.current.z !== 0) {
      const moveDistance = lastPosition.current.distanceTo(position);
      isMoving.current = moveDistance > 0.001;
    }
    
    // Calculate distance to target (shop)
    const distance = position.distanceTo(target);
    const isNear = distance < threshold;
    
    // Force update when:
    // 1. Near/far state has changed, OR
    // 2. Character is moving AND is near the shop (to ensure responsive UI updates while moving)
    if (isNear !== lastNearState.current || (isMoving.current && isNear)) {
      lastNearState.current = isNear;
      onNear(isNear);
    }
    
    // Store current position for next frame
    lastPosition.current.copy(position);
  });

  return null; // This is an invisible utility component
};

export default ProximityDetector; 