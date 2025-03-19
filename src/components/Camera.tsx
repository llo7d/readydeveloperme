import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { useRef, useEffect, useState, MutableRefObject } from 'react'
import * as THREE from "three";

// Configuration for the third-person camera
const cameraConfig = {
  distance: 7.5, // Distance behind character
  height: 3, // Height above character
  rotationSpeed: 0.003, // How fast camera rotates with mouse
  minZoom: 3, 
  maxZoom: 20,
  returnSpeed: 0.05, // Speed at which camera returns to behind character
  followSpeed: 3 // How quickly camera follows character rotation when moving
};

interface ThirdPersonCameraProps {
  characterRef: MutableRefObject<THREE.Group | null>;
}

const ThirdPersonCamera = ({ characterRef }: ThirdPersonCameraProps) => {
  // Basic refs
  const orbitControlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // Camera state
  const cameraDistance = useRef(cameraConfig.distance);
  const cameraAngle = useRef(0); // 0 = directly behind character
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Track key presses (we need to know when S is pressed to flip camera)
  const [keyState, setKeyState] = useState({
    sPressed: false
  });
  
  // Set up keyboard controls for tracking S key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 's') {
        setKeyState(prev => ({ ...prev, sPressed: true }));
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 's') {
        setKeyState(prev => ({ ...prev, sPressed: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Set up mouse and wheel controls
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleMouseMove = (e) => {
      if (isDragging) {
        // Simple angle calculation for orbit
        const deltaX = e.clientX - dragStartPos.x;
        cameraAngle.current -= deltaX * cameraConfig.rotationSpeed;
        
        // Update drag start position
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleWheel = (e) => {
      // Simple zoom calculation
      const zoomAmount = e.deltaY * 0.01;
      const newDistance = Math.max(
        cameraConfig.minZoom,
        Math.min(cameraConfig.maxZoom, cameraDistance.current + zoomAmount)
      );
      cameraDistance.current = newDistance;
      e.preventDefault();
    };
    
    // Add event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, dragStartPos]);

  useFrame((state, delta) => {
    if (!characterRef?.current || !orbitControlsRef.current) return;
    
    const character = characterRef.current;
    const characterPos = character.position.clone();
    const characterRot = character.rotation.y;
    
    // Always maintain a fixed target at character's position
    const targetPos = new THREE.Vector3(
      characterPos.x,
      characterPos.y + cameraConfig.height * 0.5, // Target slightly above character center
      characterPos.z
    );
    
    // When not dragging, smoothly return to appropriate view based on movement
    if (!isDragging) {
      // If S key is pressed (moving forward), position camera in front
      // otherwise position behind character
      let targetAngle;
      
      if (keyState.sPressed) {
        // Position camera in front of character (PI radians = 180 degrees from back)
        targetAngle = characterRot + Math.PI;
      } else {
        // Position camera behind character (default)
        targetAngle = characterRot;
      }
      
      // Smoothly transition to target angle
      const angleDiff = targetAngle - cameraAngle.current;
      
      // Handle angle wrapping
      let rotationDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
      
      // Apply smooth rotation to appropriate position
      cameraAngle.current += rotationDiff * cameraConfig.returnSpeed;
    }
    
    // Calculate camera position in orbit around character
    const distance = cameraDistance.current;
    const offsetX = Math.sin(cameraAngle.current) * distance;
    const offsetZ = Math.cos(cameraAngle.current) * distance;
    
    const cameraPos = new THREE.Vector3(
      characterPos.x - offsetX,
      characterPos.y + cameraConfig.height,
      characterPos.z - offsetZ
    );
    
    // Update camera and controls
    if (isDragging) {
      // Direct positioning during drag for stability
      camera.position.copy(cameraPos);
    } else {
      // Smooth positioning when not dragging
      camera.position.lerp(cameraPos, cameraConfig.followSpeed * delta);
    }
    
    // Always update orbit controls target to character position
    orbitControlsRef.current.target.copy(targetPos);
    orbitControlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        fov={30} 
        position={[0, cameraConfig.height, cameraConfig.distance]} 
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={false}
        enableZoom={false} 
        enableRotate={false}
        dampingFactor={0.2}
      />
    </>
  );
};

export default ThirdPersonCamera;