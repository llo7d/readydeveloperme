import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { useRef, useEffect, useState, MutableRefObject } from 'react'
import * as THREE from "three";

// Window interface is now defined globally in src/types/window.d.ts
// declare global {
//   interface Window {
    // ... removed declarations ...
//   }
// }

// Configuration for the third-person camera
const cameraConfig = {
  distance: 10.0, // Distance behind character - increased from 8.5 to 10.0 for more zoom out
  height: 3, // Height above character
  rotationSpeed: {
    horizontal: 0.003, // How fast camera rotates horizontally with mouse
    vertical: 0.002 // How fast camera rotates vertically with mouse
  },
  minZoom: 3, 
  maxZoom: 20,
  returnSpeed: 0.15, // Speed at which camera returns to behind character - increased from 0.1 to 0.15
  followSpeed: 3, // How quickly camera follows character rotation when moving
  customizationDistance: 7.5, // Increased distance from 6.5 to prevent mobile collision issues
  customizationHeight: 1.0, // Very low height to look straight at the character
  customizationPitch: -0.05, // Very slight downward pitch for direct view
  customizationPosition: {
    x: 0, // No horizontal offset
    y: 0, // No vertical offset
    z: 0  // No forward/back offset
  },
  verticalLimits: {
    min: -Math.PI / 6, // Minimum vertical angle (looking down but not below ground)
    max: Math.PI / 3    // Maximum vertical angle (looking up)
  },
  helperFocus: {
    distance: 3.5, // Distance from helper character
    height: 2.5,    // Height to focus on face rather than above head
    transitionSpeed: 6, // How quickly to transition to/from helper
    // Adjustable offsets for fine-tuning
    offset: {
      x: 0,      // Left/right offset for target
      y: -0.75,  // Up/down offset for target (changed from -0.65 to -0.75)
      z: 0,      // Forward/back offset for target
      pitch: -0.27,  // Adjust pitch angle (vertical rotation) (changed from -0.2 to -0.27)
      angle: 0.4    // Adjust horizontal angle around helper to 0.4
    }
  },
  customizationFocus: {
    distance: 7.5,       // Distance from character during customization
    heightOffset: 1.6,   // Height offset for camera/target
    transitionSpeed: 6,  // Speed of transition into/out of customization view
    // We don't need angle/pitch offsets like helper as it's a direct view
  },
};

// Make the config available globally for manual adjustments with a message
window.cameraConfig = cameraConfig;

interface ThirdPersonCameraProps {
  characterRef: MutableRefObject<THREE.Group | null>;
  customizingClothing?: boolean; // Re-add prop
  shopPosition?: [number, number, number]; // Add shop position for clipping check
  helperCharacterRef?: MutableRefObject<THREE.Group | null> | null; // Reference to helper character
}

const ThirdPersonCamera = ({ 
  characterRef, 
  customizingClothing = false, // Add default value
  shopPosition = [0, 0, -20],
  helperCharacterRef = null
}: ThirdPersonCameraProps) => {
  // Basic refs
  const orbitControlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // Camera state
  const cameraDistance = useRef(cameraConfig.distance);
  const cameraAngle = useRef(0); // Horizontal angle (around Y axis)
  const cameraPitch = useRef(0); // Vertical angle (looking up/down)
  const cameraHeight = useRef(cameraConfig.height); // Track camera height separately
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Helper character focus state
  const [focusingHelper, setFocusingHelper] = useState(false);
  const lastCharacterPos = useRef(new THREE.Vector3());
  const helperCharacterPos = useRef(new THREE.Vector3());
  
  // --- Add state for mobile detection ---
  const [isMobile, setIsMobile] = useState(false);
  // -------------------------------------
  
  // Shop dimensions (matching the ClothingShop component)
  const shopSize = { width: 5, height: 3, depth: 5 };
  const shopVec = new THREE.Vector3(shopPosition[0], shopPosition[1], shopPosition[2]);
  
  // Chat transition state - read from global window property
  const inChatTransition = window.inChatTransition || false;
  
  // --- Add effect for mobile detection ---
  useEffect(() => {
    const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const mobile = /Mobi|Android|iPhone/i.test(userAgent);
    setIsMobile(mobile);
    console.log(`Device is mobile: ${mobile}`);
  }, []);
  // -------------------------------------
  
  // Check for chatbox open status
  useEffect(() => {
    const checkChatboxStatus = () => {
      // Update focusing state based on chatbox
      setFocusingHelper(window.chatboxOpen || false);
    }
    
    // Check immediately and set up interval
    checkChatboxStatus();
    const interval = setInterval(checkChatboxStatus, 100);
    
    return () => {
      clearInterval(interval);
    }
  }, []);
  
  // Set up mouse and wheel controls
  useEffect(() => {
    // Track if we're interacting with a color picker
    let isColorPickerActive = false;
    
    // Add a global tracking flag for color picker state
    window.isColorPickerDragging = false;

    // Function to check if an element is part of a color picker
    const isColorPickerElement = (element) => {
      return element.closest('.leva-c-iWIXMl') || // Leva color picker component
             element.closest('.react-colorful') || // React Colorful component
             element.closest('.react-colorful__saturation') || // Saturation area
             element.closest('.react-colorful__hue') || // Hue slider
             element.closest('.react-colorful__interactive') || // Interactive areas
             element.closest('.react-colorful__pointer') || // Draggable handles
             element.closest('HexColorPicker') || // Direct component
             element.closest('HexColorInput') || // Hex input
             element.closest('[class*="colorful"]'); // Any element with 'colorful' in class name
    };

    // Add extra global listeners for color picker
    const onColorPickerDragStart = () => {
      window.isColorPickerDragging = true;
      isColorPickerActive = true;
    };
    
    const onColorPickerDragEnd = () => {
      window.isColorPickerDragging = false;
      setTimeout(() => {
        isColorPickerActive = false;
      }, 50); // Short delay to prevent immediate camera rotation
    };

    // Event handler functions (stored as references for proper cleanup)
    const globalMouseDown = (e) => {
      // This check is now less relevant here, but keep for potential future use?
      // Maybe tie it to another state if needed
      // if (/* some condition indicating UI interaction */ && isColorPickerElement(e.target)) { 
      //   onColorPickerDragStart(); 
      // }
    };
    
    const globalMouseUp = () => {
      if (window.isColorPickerDragging) {
        onColorPickerDragEnd();
      }
    };

    // Add event listeners to catch react-colorful drag
    document.addEventListener('mousedown', globalMouseDown, { capture: true });
    document.addEventListener('mouseup', globalMouseUp, { capture: true });

    const handleMouseDown = (e) => {
      // If color picker is in dragging mode, never start camera rotation
      if (window.isColorPickerDragging) {
        return;
      }

      // Comprehensive check for color picker or other UI elements
      if (e.target.closest('.leva-c-iWIXMl') || // Color picker component
          e.target.closest('.leva-c-PJLV') ||    // General Leva UI components
          e.target.closest('.leva-panel') ||     // Entire Leva panel
          e.target.closest('.toolbar') ||        // Our toolbar
          e.target.closest('.subtoolbar') ||     // Our subtoolbar
          e.target.closest('.color-picker') ||   // Additional class for color picker
          e.target.closest('button') ||          // Any button element
          e.target.closest('input') ||           // Any input element including hex color input
          isColorPickerElement(e.target)) {      // Check if it's a color picker element
        
        // Set color picker active state if it's a color picker
        if (isColorPickerElement(e.target)) {
          isColorPickerActive = true;
        }
        return;
      }
      
      /* CAMERA ROTATION WITH LEFT CLICK TEMPORARILY DISABLED
      if (e.button === 0) { // Left mouse button
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
      */
    };
    
    const handleMouseUp = () => {
      // Reset color picker state
      isColorPickerActive = false;
      setIsDragging(false);
    };
    
    const handleMouseMove = (e) => {
      // If color picker is active or global flag is set, never allow rotation
      if (isColorPickerActive || window.isColorPickerDragging) {
        setIsDragging(false);
        return;
      }

      // Additional check to prevent rotation when hovering over UI elements
      if (e.target.closest('.leva-c-iWIXMl') || 
          e.target.closest('.leva-c-PJLV') ||
          e.target.closest('.leva-panel') ||
          e.target.closest('.toolbar') ||
          e.target.closest('.subtoolbar') ||
          e.target.closest('.color-picker') ||
          e.target.closest('button') ||
          e.target.closest('input') ||
          isColorPickerElement(e.target) ||
          document.activeElement?.tagName === 'INPUT') {
        setIsDragging(false);
        return;
      }
      
      /* CAMERA ROTATION WITH LEFT CLICK TEMPORARILY DISABLED
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
      */
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
    
    // Event handler cleanup
    return () => {
      // Clean up window event listeners
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      
      // Clean up color picker global listeners
      document.removeEventListener('mousedown', globalMouseDown, { capture: true });
      document.removeEventListener('mouseup', globalMouseUp, { capture: true });
      
      // Reset color picker state
      window.isColorPickerDragging = false;
    };
  }, [
    characterRef.current?.position, 
    cameraDistance.current, 
    cameraAngle.current, 
    cameraPitch.current, 
    isDragging, 
    dragStartPos,
    focusingHelper,
    inChatTransition
  ]);

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
    // Reduced the collision radius by using 1.2 instead of 1.5 to make it even less aggressive
    return (dotProduct > 0 && camToShopDistance < shopRadius * 1.2);
  };

  useFrame((state, delta) => {
    if (!orbitControlsRef.current || !characterRef?.current) return; 

    const character = characterRef.current;
    const characterPos = character.position.clone();
    const characterRot = character.rotation.y;
    
    lastCharacterPos.current.copy(characterPos);
    
    if (helperCharacterRef?.current && focusingHelper) {
      helperCharacterPos.current.copy(helperCharacterRef.current.position);
    }
    
    let desiredCameraPos: THREE.Vector3;
    let finalTargetPos: THREE.Vector3;
    let transitionSpeed = cameraConfig.followSpeed; // Default speed

    // --- Check for Customization Mode FIRST --- 
    if (customizingClothing) {
        orbitControlsRef.current.enableRotate = false; // Keep rotation disabled here

        // Use the UPDATED HARDCODED character position for stability during transition
        const targetCharPos = new THREE.Vector3(0, 0, 21.5); // Updated Z to 21.5
        
        // Calculate desired camera position (behind character)
        const cameraOffset = new THREE.Vector3(
            0, 
            cameraConfig.customizationFocus.heightOffset,
            cameraConfig.customizationFocus.distance
        );
        desiredCameraPos = targetCharPos.clone().add(cameraOffset);

        // Calculate desired look-at target
        finalTargetPos = new THREE.Vector3(
            targetCharPos.x,
            targetCharPos.y + cameraConfig.customizationFocus.heightOffset,
            targetCharPos.z
        );
        
        transitionSpeed = cameraConfig.customizationFocus.transitionSpeed;

        // Apply using lerp
        camera.position.lerp(desiredCameraPos, transitionSpeed * delta);
        orbitControlsRef.current.target.lerp(finalTargetPos, transitionSpeed * delta);
        orbitControlsRef.current.update();

        return; 
    }

    // --- If NOT customizing, proceed with Helper Focus or Default Logic --- 
    
    // Ensure rotation is enabled for default/helper mode
    if (!orbitControlsRef.current.enableRotate) {
        orbitControlsRef.current.enableRotate = true; // <<<=== RE-ENABLE ROTATION
    }

    // Calculate base target position (where the camera should look)
    let baseTargetPos;
    if (helperCharacterRef?.current && focusingHelper) {
      // Focus on helper
      baseTargetPos = new THREE.Vector3(
        helperCharacterPos.current.x + cameraConfig.helperFocus.offset.x,
        helperCharacterPos.current.y + cameraConfig.helperFocus.height + cameraConfig.helperFocus.offset.y,
        helperCharacterPos.current.z + cameraConfig.helperFocus.offset.z
      );
      transitionSpeed = cameraConfig.helperFocus.transitionSpeed; // Use helper speed
    } else {
      // Focus on main character (default)
      baseTargetPos = new THREE.Vector3(characterPos.x, characterPos.y + cameraHeight.current * 0.5, characterPos.z);
      transitionSpeed = cameraConfig.followSpeed; // Use default follow speed
    }
    finalTargetPos = baseTargetPos.clone(); // Target for OrbitControls
    
    // Calculate Desired Camera Position (Default Logic, including dragging)
    if (isDragging) {
       // We still need to calculate the orbital position based on current angle/pitch/distance
       // so collision check can work, but we'll overwrite finalCameraPos later if dragging.
        const distance = cameraDistance.current;
        const horizontalDistance = distance * Math.cos(cameraPitch.current);
        const offsetX = Math.sin(cameraAngle.current) * horizontalDistance;
        const offsetZ = Math.cos(cameraAngle.current) * horizontalDistance;
        const heightOffset = distance * Math.sin(cameraPitch.current);
        const focusPos = focusingHelper ? helperCharacterPos.current : characterPos;
        const verticalBaseOffset = focusingHelper 
          ? cameraConfig.helperFocus.height 
          : cameraHeight.current;
        
        desiredCameraPos = new THREE.Vector3(
          focusPos.x - offsetX,
          focusPos.y + verticalBaseOffset + heightOffset,
          focusPos.z - offsetZ
        ); // Start with calculated position

    } else {
      // If not dragging, calculate target angle, pitch, distance, height
      let targetAngle;
      let targetDistance = cameraDistance.current;
      let targetPitch;
      let targetHeight = cameraConfig.height;
      
      // Determine target pitch 
      if (helperCharacterRef?.current && focusingHelper) {
        targetPitch = cameraConfig.helperFocus.offset.pitch;
      } else if (isMobile) { 
        targetPitch = -0.13; // Mobile pitch (restored from previous edit mistake)
      } else {
        targetPitch = -0.15; // Desktop pitch
      }
      
      // Determine target angle and distance
      if (helperCharacterRef?.current && focusingHelper) {
        const direction = new THREE.Vector2(
          helperCharacterPos.current.x - lastCharacterPos.current.x,
          helperCharacterPos.current.z - lastCharacterPos.current.z
        ).normalize();
        targetAngle = Math.atan2(direction.x, direction.y) + cameraConfig.helperFocus.offset.angle;
        targetDistance = cameraConfig.helperFocus.distance;
      } else {
        // Default: Position behind character
        targetAngle = characterRot;
        if (cameraDistance.current < cameraConfig.distance * 0.9) {
          targetDistance = cameraConfig.distance * 1.15; 
        } else {
          targetDistance = cameraConfig.distance;
        }
      }
      
      // Smoothly transition internal state refs toward targets
      const angleDiff = targetAngle - cameraAngle.current;
      let rotationDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
      const rotationSpeed = focusingHelper 
        ? cameraConfig.helperFocus.transitionSpeed * delta 
        : cameraConfig.returnSpeed;
      cameraAngle.current += rotationDiff * rotationSpeed;
      
      if (!focusingHelper) {
          const pitchDiff = targetPitch - cameraPitch.current;
          cameraPitch.current += pitchDiff * cameraConfig.returnSpeed * 1.5;
      } else {
          cameraPitch.current += (targetPitch - cameraPitch.current) * cameraConfig.helperFocus.transitionSpeed * delta;
      }

      const heightDiff = targetHeight - cameraHeight.current;
      cameraHeight.current += heightDiff * cameraConfig.returnSpeed;
      
      const distanceSpeed = focusingHelper ? 0.2 : 0.1;
      cameraDistance.current += (targetDistance - cameraDistance.current) * distanceSpeed;

      // Calculate final camera position based on the *updated* internal state refs
      const distance = cameraDistance.current;
      const horizontalDistance = distance * Math.cos(cameraPitch.current);
      const offsetX = Math.sin(cameraAngle.current) * horizontalDistance;
      const offsetZ = Math.cos(cameraAngle.current) * horizontalDistance;
      const heightOffset = distance * Math.sin(cameraPitch.current);
      const focusPos = focusingHelper ? helperCharacterPos.current : characterPos;
      const verticalBaseOffset = focusingHelper 
        ? cameraConfig.helperFocus.height 
        : cameraHeight.current;
        
      desiredCameraPos = new THREE.Vector3(
        focusPos.x - offsetX,
        focusPos.y + verticalBaseOffset + heightOffset,
        focusPos.z - offsetZ
      );
    }
    
    // --- Collision Check (always applies in default/helper mode) --- 
    const collisionStrength = focusingHelper ? 0.2 : inChatTransition ? 0.4 : 0.8;
    const viewLineIntersectsShop = intersectsWithShop(baseTargetPos, desiredCameraPos); 
    if (viewLineIntersectsShop) {
        let testAngle = cameraAngle.current;
        let validPosition: THREE.Vector3 | null = null;
        for (let i = 0; i < 8; i++) {
            testAngle += Math.PI / 4;
            const distance = cameraDistance.current; // Use current distance for test
            const testHorizontalDistance = distance * Math.cos(cameraPitch.current);
            const testOffsetX = Math.sin(testAngle) * testHorizontalDistance;
            const testOffsetZ = Math.cos(testAngle) * testHorizontalDistance;
            const focusPos = focusingHelper ? helperCharacterPos.current : characterPos; // Use appropriate focus point
            const verticalBaseOffset = focusingHelper ? cameraConfig.helperFocus.height : cameraHeight.current;
            const heightOffset = distance * Math.sin(cameraPitch.current);
            const testPos = new THREE.Vector3(
                focusPos.x - testOffsetX,
                focusPos.y + verticalBaseOffset + heightOffset,
                focusPos.z - testOffsetZ
            );
            if (!intersectsWithShop(baseTargetPos, testPos)) {
                validPosition = testPos;
                cameraAngle.current += (testAngle - cameraAngle.current) * 0.05; // Gently nudge angle towards valid
                break;
            }
        }
        if (validPosition) {
            desiredCameraPos.lerp(validPosition, collisionStrength); // Lerp towards the valid position
        }
    }
    
    // Apply final position and target using lerp with the determined speed
    camera.position.lerp(desiredCameraPos, transitionSpeed * delta);
    orbitControlsRef.current.target.lerp(finalTargetPos, transitionSpeed * delta);
    orbitControlsRef.current.update();
    
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        fov={30} 
        position={[0, cameraHeight.current, cameraConfig.distance]} 
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={false}
        enableZoom={false} // Keep zoom disabled if desired for normal gameplay too?
        enableRotate={false} // Keep rotate disabled if desired?
        dampingFactor={0.2}
      />
    </>
  );
};

export default ThirdPersonCamera;