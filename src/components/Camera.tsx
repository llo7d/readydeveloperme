import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { useRef, useEffect, useState, MutableRefObject } from 'react'
import * as THREE from "three";

// Configuration for the third-person camera
const cameraConfig = {
  distance: 7.5, // Distance behind character
  height: 3, // Height above character
  rotationSpeed: {
    horizontal: 0.003, // How fast camera rotates horizontally with mouse
    vertical: 0.002 // How fast camera rotates vertically with mouse
  },
  minZoom: 3, 
  maxZoom: 20,
  returnSpeed: 0.05, // Speed at which camera returns to behind character
  followSpeed: 3, // How quickly camera follows character rotation when moving
  customizationDistance: 6, // Distance when customizing clothes - in front but not too close
  verticalLimits: {
    min: -Math.PI / 6, // Minimum vertical angle (looking down but not below ground)
    max: Math.PI / 3    // Maximum vertical angle (looking up)
  }
};

interface ThirdPersonCameraProps {
  characterRef: MutableRefObject<THREE.Group | null>;
  customizingClothing?: boolean;
  shopPosition?: [number, number, number]; // Add shop position for clipping check
}

const ThirdPersonCamera = ({ 
  characterRef, 
  customizingClothing = false,
  shopPosition = [0, 0, -20]
}: ThirdPersonCameraProps) => {
  // Basic refs
  const orbitControlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // Camera state
  const cameraDistance = useRef(cameraConfig.distance);
  const cameraAngle = useRef(0); // Horizontal angle (around Y axis)
  const cameraPitch = useRef(0); // Vertical angle (looking up/down)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Shop dimensions (matching the ClothingShop component)
  const shopSize = { width: 5, height: 3, depth: 5 };
  const shopVec = new THREE.Vector3(shopPosition[0], shopPosition[1], shopPosition[2]);
  
  // Set up mouse and wheel controls
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Prevent camera rotation when clicking on color picker or other UI elements
      if (e.target.closest('.leva-c-iWIXMl') || // Color picker component
          e.target.closest('.leva-c-PJLV') ||    // General Leva UI components
          e.target.closest('.leva-panel') ||     // Entire Leva panel
          e.target.closest('.toolbar') ||        // Our toolbar
          e.target.closest('.subtoolbar') ||     // Our subtoolbar
          e.target.closest('.color-picker') ||   // Additional class for color picker
          e.target.closest('button') ||          // Any button element
          e.target.closest('input')) {           // Any input element including hex color input
        return;
      }
      
      // Remove the blanket restriction that prevented all camera rotation during customization
      // This allows rotation during customization as long as we're not interacting with UI elements
      
      if (e.button === 0) { // Left mouse button
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleMouseMove = (e) => {
      // Additional check to prevent rotation when hovering over UI elements
      if (e.target.closest('.leva-c-iWIXMl') || 
          e.target.closest('.leva-c-PJLV') ||
          e.target.closest('.leva-panel') ||
          e.target.closest('.toolbar') ||
          e.target.closest('.subtoolbar') ||
          e.target.closest('.color-picker') ||
          e.target.closest('button') ||
          e.target.closest('input') ||
          document.activeElement?.tagName === 'INPUT') {
        setIsDragging(false);
        return;
      }
      
      if (isDragging) {
        // Horizontal rotation (around Y axis)
        const deltaX = e.clientX - dragStartPos.x;
        cameraAngle.current -= deltaX * cameraConfig.rotationSpeed.horizontal;
        
        // Vertical rotation (pitch - looking up/down)
        const deltaY = e.clientY - dragStartPos.y;
        
        // Apply vertical rotation with limits to prevent looking below ground
        const newPitch = cameraPitch.current + deltaY * cameraConfig.rotationSpeed.vertical;
        cameraPitch.current = Math.max(
          cameraConfig.verticalLimits.min,
          Math.min(cameraConfig.verticalLimits.max, newPitch)
        );
        
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

  // Check if a line intersects with the shop
  const intersectsWithShop = (start: THREE.Vector3, end: THREE.Vector3): boolean => {
    // Create a simple check based on:
    // 1. Is the camera on the same side of the shop as the character?
    // 2. Is the camera close enough to the shop to potentially look through it?
    
    // Vector from character to shop center
    const charToShop = new THREE.Vector3().subVectors(shopVec, start);
    
    // Vector from character to camera
    const charToCamera = new THREE.Vector3().subVectors(end, start);
    
    // Dot product tells us if camera is on same side as shop relative to character
    const dotProduct = charToShop.dot(charToCamera);
    
    // Approximate shop's radius (half the diagonal)
    const shopRadius = Math.sqrt(
      shopSize.width * shopSize.width + 
      shopSize.height * shopSize.height + 
      shopSize.depth * shopSize.depth
    ) / 2;
    
    // Distance from camera to shop center
    const camToShopDistance = end.distanceTo(shopVec);
    
    // Check if:
    // - Camera is on the same side of the character as the shop (dot product > 0)
    // - AND Camera is close enough to potentially see through the shop
    return (dotProduct > 0 && camToShopDistance < shopRadius * 2);
  };

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
    
    // When not dragging, determine the appropriate camera position
    if (!isDragging) {
      let targetAngle;
      let targetDistance = cameraDistance.current;
      
      if (customizingClothing) {
        // When customizing clothing, we still use the current camera angle
        // rather than forcing a specific view, allowing free rotation
        targetAngle = cameraAngle.current;
        targetDistance = cameraConfig.customizationDistance;
      } else {
        // Position camera behind character (default)
        targetAngle = characterRot;
      }
      
      // Smoothly transition to target angle
      const angleDiff = targetAngle - cameraAngle.current;
      
      // Handle angle wrapping
      let rotationDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
      
      // Apply smooth rotation to appropriate position but only if not in customization mode
      if (!customizingClothing) {
        cameraAngle.current += rotationDiff * cameraConfig.returnSpeed;
        
        // Also reset vertical angle when not in customization mode
        cameraPitch.current *= 0.95; // Gradually return to horizontal
      }
      
      // Smoothly adjust distance
      cameraDistance.current += (targetDistance - cameraDistance.current) * 0.1;
    }
    
    // Calculate camera position in orbit around character with vertical angle
    const distance = cameraDistance.current;
    
    // Calculate horizontal position (around character)
    const horizontalDistance = distance * Math.cos(cameraPitch.current);
    const offsetX = Math.sin(cameraAngle.current) * horizontalDistance;
    const offsetZ = Math.cos(cameraAngle.current) * horizontalDistance;
    
    // Calculate vertical offset (height based on pitch)
    const heightOffset = distance * Math.sin(cameraPitch.current);
    
    const desiredCameraPos = new THREE.Vector3(
      characterPos.x - offsetX,
      characterPos.y + cameraConfig.height + heightOffset,
      characterPos.z - offsetZ
    );
    
    // Check if camera line of sight passes through the shop building
    const viewLineIntersectsShop = intersectsWithShop(targetPos, desiredCameraPos);
    
    // If view line intersects shop, adjust camera position
    let finalCameraPos: THREE.Vector3 = desiredCameraPos;
    if (viewLineIntersectsShop && !customizingClothing) {
      // Find a better angle that doesn't intersect the shop
      let testAngle = cameraAngle.current;
      let validPosition: THREE.Vector3 | null = null;
      
      // Test multiple angles to find a valid position
      for (let i = 0; i < 12; i++) {
        testAngle += Math.PI / 6; // 30 degree increments
        const testHorizontalDistance = distance * Math.cos(cameraPitch.current);
        const testOffsetX = Math.sin(testAngle) * testHorizontalDistance;
        const testOffsetZ = Math.cos(testAngle) * testHorizontalDistance;
        
        const testPos = new THREE.Vector3(
          characterPos.x - testOffsetX,
          characterPos.y + cameraConfig.height + heightOffset,
          characterPos.z - testOffsetZ
        );
        
        if (!intersectsWithShop(targetPos, testPos)) {
          validPosition = testPos;
          // Gradually transition camera angle toward this valid angle
          cameraAngle.current += (testAngle - cameraAngle.current) * 0.1;
          break;
        }
      }
      
      // Use the valid position or fall back to the original
      if (validPosition) {
        finalCameraPos = validPosition;
      }
    }
    
    // Update camera and controls
    if (isDragging) {
      // Direct positioning during drag for stability
      camera.position.copy(finalCameraPos);
    } else {
      // Smooth positioning when not dragging
      camera.position.lerp(finalCameraPos, cameraConfig.followSpeed * delta);
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