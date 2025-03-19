import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, MutableRefObject } from 'react';
import * as THREE from 'three';

interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  running: boolean;
}

interface CharacterControlsProps {
  characterRef: MutableRefObject<THREE.Group | null>;
}

const CharacterControls = ({ characterRef }: CharacterControlsProps) => {
  // Movement state
  const [movement, setMovement] = useState<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    running: false
  });
  
  // Character physics
  const characterRotation = useRef(0);
  const currentVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isMoving = useRef(false);
  const lastPosition = useRef(new THREE.Vector3());
  const lastMovementDirection = useRef(new THREE.Vector2(0, -1)); // Initial direction facing forward (z-)
  
  // Movement configuration
  const walkSpeed = 0.035;
  const runSpeed = 0.07;
  const acceleration = 0.015; // Improved responsiveness
  const rotationSpeed = 0.12; // How quickly character rotates to face movement direction
  const friction = 0.82; // More friction to prevent sliding
  const startupAcceleration = 0.4; // Initial acceleration boost
  const stoppingDeceleration = 0.6; // Quick stop
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          // Invert W to move backward instead of forward
          setMovement(prev => ({ ...prev, backward: true }));
          break;
        case 's':
          // Invert S to move forward instead of backward
          setMovement(prev => ({ ...prev, forward: true }));
          break;
        case 'a':
          // Invert A to move right instead of left
          setMovement(prev => ({ ...prev, right: true }));
          break;
        case 'd':
          // Invert D to move left instead of right
          setMovement(prev => ({ ...prev, left: true }));
          break;
        case 'shift':
          setMovement(prev => ({ ...prev, running: true }));
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          // Invert W to move backward instead of forward
          setMovement(prev => ({ ...prev, backward: false }));
          break;
        case 's':
          // Invert S to move forward instead of backward
          setMovement(prev => ({ ...prev, forward: false }));
          break;
        case 'a':
          // Invert A to move right instead of left
          setMovement(prev => ({ ...prev, right: false }));
          break;
        case 'd':
          // Invert D to move left instead of right
          setMovement(prev => ({ ...prev, left: false }));
          break;
        case 'shift':
          setMovement(prev => ({ ...prev, running: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    // Check if characterRef exists and is valid
    if (!characterRef?.current) return;
    
    // Initialize last position if needed
    if (!lastPosition.current.x && !lastPosition.current.y && !lastPosition.current.z) {
      lastPosition.current.copy(characterRef.current.position);
    }
    
    // Get movement direction based on keys pressed
    const moveZ = Number(movement.forward) - Number(movement.backward);
    const moveX = Number(movement.right) - Number(movement.left);
    
    // Track if we were moving previously
    const wasMoving = isMoving.current;
    
    // Determine if we're currently moving
    isMoving.current = moveX !== 0 || moveZ !== 0;
    
    // Check if movement direction changed
    if (isMoving.current) {
      const newDirection = new THREE.Vector2(moveX, -moveZ).normalize();
      
      // If direction changed significantly, store it
      if (newDirection.distanceTo(lastMovementDirection.current) > 0.1) {
        lastMovementDirection.current.copy(newDirection);
      }
    }
    
    // No movement - apply higher friction to come to a stop
    if (!isMoving.current) {
      // Apply extra deceleration when user releases keys (for more responsive stopping)
      const stopFriction = wasMoving ? friction * stoppingDeceleration : friction;
      currentVelocity.current.multiplyScalar(stopFriction);
      
      // Apply a small velocity threshold to fully stop
      if (currentVelocity.current.length() < 0.001) {
        currentVelocity.current.set(0, 0, 0);
      }
      
      // Update character position
      characterRef.current.position.x += currentVelocity.current.x;
      characterRef.current.position.z += currentVelocity.current.z;
      return;
    }
    
    // Calculate movement direction angle
    const moveAngle = Math.atan2(moveX, -moveZ);
    
    // Smoothly rotate character to face movement direction
    if (isMoving.current) {
      const targetRotation = moveAngle;
      const rotationDiff = targetRotation - characterRotation.current;
      
      // Handle angle wrapping
      let rotDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      
      // Apply smooth rotation
      characterRotation.current += rotDiff * rotationSpeed;
      
      // Apply rotation to character mesh
      characterRef.current.rotation.y = characterRotation.current;
    }
    
    // Calculate speed based on movement state
    const currentSpeed = movement.running ? runSpeed : walkSpeed;
    
    // Calculate target velocity
    const length = Math.min(1, Math.sqrt(moveX * moveX + moveZ * moveZ)); // Normalize for diagonal movement
    targetVelocity.current.set(
      Math.sin(characterRotation.current) * length * currentSpeed,
      0,
      Math.cos(characterRotation.current) * length * currentSpeed
    );
    
    // Add an acceleration boost when starting movement
    const accelMultiplier = !wasMoving && isMoving.current ? startupAcceleration : 1.0;
    
    // Smoothly accelerate toward target velocity
    currentVelocity.current.x += (targetVelocity.current.x - currentVelocity.current.x) * acceleration * accelMultiplier;
    currentVelocity.current.z += (targetVelocity.current.z - currentVelocity.current.z) * acceleration * accelMultiplier;
    
    // Update character position
    characterRef.current.position.x += currentVelocity.current.x;
    characterRef.current.position.z += currentVelocity.current.z;
    
    // Store the current position for next frame
    lastPosition.current.copy(characterRef.current.position);
  });

  return null;
};

export default CharacterControls; 