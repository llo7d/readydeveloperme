import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, MutableRefObject } from 'react';
import * as THREE from 'three';
// Add import for useMultiplayer hook
import { useMultiplayer } from '../contexts/MultiplayerContext';
// Remove the import as we're not using it directly here
// import MobileControls from './MobileControls';

// Window interface is now defined globally in src/types/window.d.ts
// declare global {
//   interface Window {
    // ... removed declarations ...
//   }
// }

// Export the MovementState interface
export interface MovementState {
  forward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  running: boolean;
}

interface CharacterControlsProps {
  characterRef: MutableRefObject<THREE.Group | null>;
}

const CharacterControls = ({ characterRef }: CharacterControlsProps) => {
  // Get socket from multiplayer context
  const { socket, isConnected } = useMultiplayer();
  
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
  const lastSentPosition = useRef(new THREE.Vector3());
  const lastSentRotation = useRef(0);
  
  // Throttling
  const lastUpdateTime = useRef(0);
  const UPDATE_INTERVAL = 1000 / 15; // 15 updates per second max
  
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

  // Function to send position updates to server
  const sendPositionUpdate = (force = false) => {
    if (!isConnected || !socket || !characterRef.current) return;
    
    const now = Date.now();
    const position = characterRef.current.position;
    const rotation = characterRotation.current;
    
    // Check if we need to send an update (throttling)
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    const positionChanged = lastSentPosition.current.distanceToSquared(position) > 0.01;
    const rotationChanged = Math.abs(lastSentRotation.current - rotation) > 0.05;
    
    // Only send updates if there's a significant change or if forced
    if (force || ((positionChanged || rotationChanged) && timeSinceLastUpdate > UPDATE_INTERVAL)) {
      // Send position and rotation to server
      socket.emit('updatePosition', {
        position: {
          x: position.x,
          y: position.y,
          z: position.z
        },
        rotation: rotation,
        moving: isMoving.current
      });
      
      // Update last sent values
      lastSentPosition.current.copy(position);
      lastSentRotation.current = rotation;
      lastUpdateTime.current = now;
      
      // Log (for testing Phase 2)
      console.log('Multiplayer: Sent position update', { 
        x: parseFloat(position.x.toFixed(2)), 
        z: parseFloat(position.z.toFixed(2)), 
        r: parseFloat(rotation.toFixed(2))
      });
    }
  };

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
    
    // Check if we need to send position update
    // Always send when movement state changes (started/stopped moving)
    if (wasMoving !== isMoving.current) {
      sendPositionUpdate(true);
    } else {
      sendPositionUpdate();
    }
  });
  
  // Return null here as this component just adds behavior, not visuals
  return null;
};

export default CharacterControls; 