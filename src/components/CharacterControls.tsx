import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, MutableRefObject } from 'react';
import * as THREE from 'three';
// Remove the import as we're not using it directly here
// import MobileControls from './MobileControls';

// Add TypeScript declaration for the global window property
declare global {
  interface Window {
    chatboxOpen: boolean;
    isCustomizingClothing?: boolean;
    chatboxFocused: boolean;
    setCharacterMovement?: React.Dispatch<React.SetStateAction<MovementState>>;
  }
}

interface MovementState {
  forward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  running: boolean;
}

interface CharacterControlsProps {
  characterRef: MutableRefObject<THREE.Group | null>;
}

const CharacterControls = ({ characterRef }: CharacterControlsProps) => {
  // Movement state
  const [movement, setMovement] = useState<MovementState>({
    forward: false,
    turnLeft: false,
    turnRight: false,
    running: false
  });
  
  // Character physics
  const characterRotation = useRef(Math.PI);
  const currentVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isMoving = useRef(false);
  const lastPosition = useRef(new THREE.Vector3());
  
  // Movement configuration
  const walkSpeed = 0.04;
  const runSpeed = 0.08;
  const turnSpeed = 0.04; // How quickly character rotates when A/D are pressed
  const acceleration = 0.15; // Acceleration for forward movement
  const friction = 0.85; // Friction when slowing down
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle movement if chatbox is open or focused
      if (window.chatboxOpen || window.chatboxFocused || window.isCustomizingClothing) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
          setMovement(prev => ({ ...prev, forward: true }));
          break;
        case 'a':
          setMovement(prev => ({ ...prev, turnLeft: true }));
          break;
        case 'd':
          setMovement(prev => ({ ...prev, turnRight: true }));
          break;
        case 'shift':
          setMovement(prev => ({ ...prev, running: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't handle movement if chatbox is open or focused
      if (window.chatboxOpen || window.chatboxFocused || window.isCustomizingClothing) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
          setMovement(prev => ({ ...prev, forward: false }));
          break;
        case 'a':
          setMovement(prev => ({ ...prev, turnLeft: false }));
          break;
        case 'd':
          setMovement(prev => ({ ...prev, turnRight: false }));
          break;
        case 'shift':
          setMovement(prev => ({ ...prev, running: false }));
          break;
      }
    };
    
    // Add event listeners to global window object for keydown/keyup events
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Expose movement setter for external control (mobile)
    if (typeof window !== 'undefined') {
      window.setCharacterMovement = setMovement;
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (typeof window !== 'undefined' && 'setCharacterMovement' in window) {
        // @ts-ignore: Safely remove the property
        window.setCharacterMovement = null;
      }
    };
  }, []);

  useFrame((state, delta) => {
    // Check if characterRef exists and is valid
    if (!characterRef?.current) return;
    
    // If chatbox is open or customizing clothing, stop all movement
    if (window.chatboxOpen || window.isCustomizingClothing) {
      // Reset movement state to prevent character movement
      if (isMoving.current) {
        currentVelocity.current.set(0, 0, 0);
        isMoving.current = false;
      }
      return;
    }
    
    // Initialize last position if needed
    if (!lastPosition.current.x && !lastPosition.current.y && !lastPosition.current.z) {
      lastPosition.current.copy(characterRef.current.position);
    }
    
    // Track if we were moving previously
    const wasMoving = isMoving.current;
    
    // First handle rotation (A/D keys)
    if (movement.turnLeft) {
      characterRotation.current += turnSpeed;
      characterRef.current.rotation.y = characterRotation.current;
    }
    if (movement.turnRight) {
      characterRotation.current -= turnSpeed;
      characterRef.current.rotation.y = characterRotation.current;
    }
    
    // Then handle forward movement (W key)
    const isForwardMoving = movement.forward;
    isMoving.current = isForwardMoving;
    
    if (!isMoving.current) {
      // Apply friction when not moving
      currentVelocity.current.multiplyScalar(friction);
      
      // Apply a small velocity threshold to fully stop
      if (currentVelocity.current.length() < 0.001) {
        currentVelocity.current.set(0, 0, 0);
      }
    } else {
      // Calculate speed based on movement state
      const currentSpeed = movement.running ? runSpeed : walkSpeed;
      
      // Calculate movement direction based on character's rotation
      const moveDirection = new THREE.Vector3(
        Math.sin(characterRotation.current),
        0,
        Math.cos(characterRotation.current)
      );
      
      // Set target velocity based on direction and speed
      const targetVelocity = moveDirection.multiplyScalar(currentSpeed);
      
      // Smoothly accelerate toward target velocity
      currentVelocity.current.x += (targetVelocity.x - currentVelocity.current.x) * acceleration;
      currentVelocity.current.z += (targetVelocity.z - currentVelocity.current.z) * acceleration;
    }
    
    // Update character position
    characterRef.current.position.x += currentVelocity.current.x;
    characterRef.current.position.z += currentVelocity.current.z;
    
    // Store the current position for next frame
    lastPosition.current.copy(characterRef.current.position);
  });
  
  // Return null here as this component just adds behavior, not visuals
  return null;
};

export default CharacterControls; 