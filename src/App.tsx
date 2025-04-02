import React, { ChangeEvent, Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from 'three'
import { Link } from "react-router-dom";

import ThemeToggle from "./components/ThemeToggle";
import { useStore } from "./store/store";
import classNames from "classnames";
import Logo from "./assets/icons/Logo";
import Toolbar from "./components/Toolbar";
import { getToolbarData } from "./helpers/data";
import SubToolbar from "./components/SubToolbar";
import IconMenu from "./assets/icons/IconMenu";
import ManualPopup from "./components/ManualPopup";
import ThirdPersonCamera from "./components/Camera";
import Character from "./components/Character";
import CharacterControls from "./components/CharacterControls";
import ClothingShop from "./components/ClothingShop";
import ProximityDetector from "./components/ProximityDetector";
import ShopCollision from "./components/ShopCollision";
import Loader from "./components/Loader";
import Ground from "./components/Ground";
import { useControls } from "leva";
import Lights from "./components/Lights";
import { Analytics } from "@vercel/analytics/react";
import { Leva } from 'leva'
import HelperCharacter from "./components/HelperCharacter";
import Portal from "./components/Portal";
import MobileControlsProvider from "./components/MobileControlsProvider";
import BarberShop from "./components/BarberShop";
import Chatbox from "./components/Chatbox";
import CharacterMessage from "./components/CharacterMessage";
import { MultiplayerProvider, useMultiplayer, DEFAULT_COLORS } from './contexts/MultiplayerContext';
import MultiplayerManager from './components/MultiplayerManager';
import RemoteCharactersManager from "./components/RemoteCharactersManager";

// --- Constants for initial state ---
const INITIAL_POSITION = { x: 0, y: 0, z: 30 };
const INITIAL_ROTATION = Math.PI; // Face towards the shop
// ----------------------------------

// This component handles all scene-specific behaviors that need to use hooks like useFrame
const SceneManager = ({ 
  characterRef, 
  shopPosition, 
  portalPosition,
  username,
  onNearShop, 
  onCharacterMovementChange 
}) => {
  // Convert shop position array to Vector3
  const shopVec = new THREE.Vector3(shopPosition[0], shopPosition[1], shopPosition[2]);
  // Convert portal position array to Vector3
  const portalVec = new THREE.Vector3(portalPosition[0], portalPosition[1], portalPosition[2]);
  const PORTAL_ACTIVATION_THRESHOLD = 2.0;
  
  // Shop dimensions matching the ClothingShop component
  const shopSize = { width: 5, height: 3, depth: 5 };
  const doorSize = { width: 1, height: 2 };
  const doorPosition = { x: 0, z: shopSize.depth/2 }; // Door is centered on front wall
  
  // Store last position to detect movement
  const lastPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const movementCheckInterval = useRef(0);
  
  // Get socket for position updates
  const { socket, isConnected } = useMultiplayer();
  
  // Throttle position updates
  const lastPositionUpdateTime = useRef(0);
  const POSITION_UPDATE_INTERVAL = 100; // 100ms = 10 updates per second
  
  // Initialize character rotation to face the shop
  useEffect(() => {
    if (characterRef.current) {
      // Position character further away from the shop initially
      characterRef.current.position.set(INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z);
      characterRef.current.rotation.y = INITIAL_ROTATION;
      lastPosition.current.copy(characterRef.current.position);
    }
  }, [characterRef]);
  
  // Check if character is moving
  useFrame(() => {
    if (!characterRef.current) return;
    
    // Only check movement every few frames for performance
    movementCheckInterval.current += 1;
    if (movementCheckInterval.current < 5) return;
    movementCheckInterval.current = 0;
    
    const position = characterRef.current.position;
    const distance = lastPosition.current.distanceTo(position);
    
    // If position changed significantly, character is moving
    const wasMoving = isMoving.current;
    isMoving.current = distance > 0.005;
    
    // --- Portal Interaction Logic --- 
    if (isMoving.current) {
      // Calculate distance only on the XZ plane for portal check
      const distanceToPortal = Math.sqrt(
        Math.pow(position.x - portalVec.x, 2) +
        Math.pow(position.z - portalVec.z, 2)
      );
      
      if (distanceToPortal < PORTAL_ACTIVATION_THRESHOLD) {
        console.log("Character entered portal area! Redirecting...");
        // Prevent multiple redirects if frame runs quickly
        if (!(window as any).portalRedirecting) {
            (window as any).portalRedirecting = true;
            const portalURL = `http://portal.pieter.com/?ref=readydeveloper.me&username=${encodeURIComponent(username)}`;
            console.log(`Redirecting to: ${portalURL}`);
            window.location.href = portalURL; 
        }
      }
    }
    // --- End Portal Interaction Logic ---
    
    // Update last position
    lastPosition.current.copy(position);
    
    // Notify parent component of movement state change
    if (wasMoving !== isMoving.current) {
      onCharacterMovementChange(isMoving.current);
    }
    
    // Send position update to server
    if (isConnected && socket) {
      const now = performance.now();
      if (now - lastPositionUpdateTime.current > POSITION_UPDATE_INTERVAL) {
        lastPositionUpdateTime.current = now;
        
        // Send position, rotation, and moving state
        socket.emit('updatePosition', {
          position: {
            x: position.x,
            y: position.y,
            z: position.z
          },
          rotation: characterRef.current.rotation.y,
          moving: isMoving.current
        });
      }
    }
  });
  
  return (
    <>
      <ProximityDetector 
        target={shopVec}
        characterRef={characterRef}
        threshold={8}
        onNear={onNearShop}
      />
      <ShopCollision
        shopPosition={shopVec}
        characterRef={characterRef}
        shopSize={shopSize}
        doorSize={doorSize}
        doorPosition={doorPosition}
      />
    </>
  );
};

// Add the link to the React Three Fiber rotating cube demo
const RotatingCubeLink = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <Link 
        to="/react-three"
        style={{
          display: 'block',
          backgroundColor: '#4a4a4a',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        View Rotating Cube
      </Link>
    </div>
  );
};

// Create a wrapper component that uses the multiplayer hooks
const AppContent = ({ initialUsername }: { initialUsername: string }) => {
  // Character reference for controlling movement
  const characterRef = useRef<THREE.Group>(null);
  // Helper character reference for camera focus
  const helperCharacterRef = useRef<THREE.Group>(null);
  
  // Add state to track if we're in the clothing shop mode
  const [inClothingShop, setInClothingShop] = useState(false);
  
  // Add state to track if clothing customization is active
  const [customizingClothing, setCustomizingClothing] = useState(false);

  // Add state to track proximity to the clothing shop
  const [nearShop, setNearShop] = useState(false);
  
  // Add state to track if character is moving
  const [isCharacterMoving, setIsCharacterMoving] = useState(false);
  
  // Update the clothing shop position to be further away
  const clothingShopPosition: [number, number, number] = [0, 0, 5.25]; // Moved 45% closer to spawn

  // Add state to track if we're in the barber shop mode
  const [inBarberShop, setInBarberShop] = useState(false);
  
  // Add state to track if hair customization is active
  const [customizingHair, setCustomizingHair] = useState(false);

  // Add state to track proximity to the barber shop
  const [nearBarberShop, setNearBarberShop] = useState(false);
  
  // Update the barber shop position to be next to the clothing shop
  const barberShopPosition: [number, number, number] = [8, 0, 5.25]; // Positioned to the right of the clothing shop

  // Change to "false" if you want hide/reveal version of the toolbar.
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const theme = useStore((state) => state.theme);
  const isDesktop = useMediaQuery({ query: "(min-width: 960px)" });
  const refLogoInput = useRef<HTMLInputElement>(null);

  const [debuggerVisible, setDebuggerVisible] = useState(false);
  const [visible, setVisible] = useState(true);
  const tools = getToolbarData();
  const [tool, setTool] = useState(tools[0]);
  
  // Ground shadow controls
  const { opacity, blur, scale, far } =
    useControls('Ground Shadows', {
      opacity: { value: 0.7, step: 0.05 },
      scale: { value: 2, step: 0.05 },
      blur: { value: 3.5, step: 0.05 },
      far: { value: 1.2, step: 0.05 },
    });
  
  // Get socket and joinGame function from multiplayer context
  const { socket, isConnected, sendAppearanceUpdate, sendPositionUpdate, joinGame } = useMultiplayer();
  
  // Track if we've already joined the game to prevent multiple join emissions
  const hasJoinedGame = useRef(false);

  // Track last sent appearance
  const lastSentAppearance = useRef<{colors: any[] | null, selected: any | null}>({ colors: null, selected: null });

  // --- Move Reset Function Definition Here ---
  const handleReset = useCallback(() => {
    console.log("Resetting character position and state...");
    
    // 1. Reset Character Position and Rotation
    if (characterRef.current) {
      characterRef.current.position.set(INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z);
      characterRef.current.rotation.y = INITIAL_ROTATION;
      // Ensure the camera updates immediately after reset
      characterRef.current.updateMatrixWorld(true); 
    }
    
    // 2. Exit Customization Modes
    if (customizingClothing) {
      setCustomizingClothing(false);
    }
    if (customizingHair) {
      setCustomizingHair(false);
    }
    
    // 3. Reset Global Flags/State
    window.isCustomizingClothing = false;
    
    // 4. Restore Chat Interaction (if needed)
    if (typeof window !== 'undefined' && window.endCharacterInteraction) {
      // Use a small delay to ensure state updates propagate before enabling chat
      setTimeout(() => {
        window.endCharacterInteraction?.();
        console.log("Chat interaction restored after reset.");
      }, 100);
    }
    
    // 5. Send Update via Multiplayer
    if (isConnected && sendPositionUpdate) {
      console.log('Multiplayer: Sending reset position update');
      sendPositionUpdate({ 
        x: INITIAL_POSITION.x, 
        z: INITIAL_POSITION.z, 
        r: INITIAL_ROTATION 
      });
    }
    
    // 6. Optionally: Send appearance update if it might have been mid-change
    if (isConnected && sendAppearanceUpdate) {
      sendAppearanceUpdate(subToolColors, selected);
    }

    // 7. Reset Toolbar (optional, depending on desired behavior)
    // setTool(tools[0]); // Uncomment to reset to the first tool

  }, [characterRef, customizingClothing, customizingHair, isConnected, sendPositionUpdate, sendAppearanceUpdate]);
  // ------------------------------------------------------------

  // Load saved appearance from localStorage if it exists
  const loadSavedAppearance = () => {
    try {
      const savedAppearance = localStorage.getItem('playerAppearance');
      if (savedAppearance) {
        const { colors, selected } = JSON.parse(savedAppearance);
        if (colors && selected) {
          console.log('Loaded saved appearance from localStorage');
          return { colors, selected };
        }
      }
    } catch (error) {
      console.error('Error loading saved appearance:', error);
    }
    return null;
  };

  // Try to load saved appearance, then fall back to defaults
  const savedAppearance = loadSavedAppearance();

  // It has this format (you can see data.ts):
  // tool.id: tool.items.id
  const [selected, setSelected] = useState<Record<string, string>>(savedAppearance?.selected || {})

  // Tool 2 subtool colors. Set default color state here.
  const [subToolColors, setSubToolColors] = useState(
    savedAppearance?.colors || tools[1].items.map((item) => {
      // Keep defaults for items 1-5
      if (item.id === "tool_2_item_1") { // Hair
        return { subToolId: item.id, color: "#131313" };
      }
      if (item.id === "tool_2_item_2") { // Beard
        return { subToolId: item.id, color: "#131313" };
      }
      if (item.id === "tool_2_item_3") { // Shirt Main
        return { subToolId: item.id, color: "#d8d8d8" };
      }
      if (item.id === "tool_2_item_4") { // Shirt Cuffs
        return { subToolId: item.id, color: "#ffffff" };
      }
      if (item.id === "tool_2_item_5") { // Pants Main
        return { subToolId: item.id, color: "#aabef9" };
      }
      
      // Removed defaults for items 6-12

      // Fallback for any unexpected items (should not happen now)
      return {
        subToolId: item.id,
        color: "#141414",
      };
    }).filter(Boolean) // Filter out any potential null/undefined values from removed items
  );

  // Filter the tools array to only show Colors when in clothing customization mode
  const filteredTools = useMemo(() => {
    if (customizingClothing) {
      // Only show Colors tool when customizing clothing
      return tools.filter(tool => tool.id === "tool_2");
    } else if (inClothingShop) {
      // Don't show any tools when in clothing shop but not customizing
      return [];
    }
    // Otherwise show all tools (normal mode, though we won't actually use this)
    return tools;
  }, [tools, inClothingShop, customizingClothing]);

  const toolItems = useMemo(() => {
    return filteredTools.map((tool) => {
      if (tool.id === "tool_2") {
        return tool;
      }

      const subToolId = selected[tool.id];

      const icon =
        tool.items.find((item) => item.id === subToolId)?.icon || tool.icon;

      return { ...tool, icon };
    });
  }, [selected, filteredTools]);

  const trayWidth = 3.5 * toolItems.length + 1 * (toolItems.length - 1);

  //Logo Section
  const defaultLogo = new THREE.TextureLoader().load("images/logo.png")
  const [logo, setLogo] = useState(defaultLogo)

  const handlePickedLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    } else if (file.type !== "image/png") {
      alert("Only .png files are allowed");
      return;
    }

    // // if all is good, setLogo to the new logo
    setLogo(new THREE.TextureLoader().load(URL.createObjectURL(file)))

    if (refLogoInput.current) {
      refLogoInput.current.value = ''
    }

    setSelected({
      ...selected,
      logo: 'logo_1'
    })
  }

  // Initialize selected tool. Select what you want to be selected by default.
  useEffect(() => {
    const newSelected: Record<string, string> = {}

    for (const tool of tools) {
      if (tool.id === "hair") {
        newSelected[tool.id] = "hair_1"
        continue
      }

      if (tool.id === "glasses") {
        newSelected[tool.id] = "glasses_1"
        continue
      }

      if (tool.id === "beard") {
        newSelected[tool.id] = "beard_1"
        continue
      }

      if (tool.id === "logo") {
        newSelected[tool.id] = "logo_1"
        continue
      }

      if (tool.id === "lights") {
        newSelected[tool.id] = "lights_1"
        continue
      }

      if (tool.id === "pose") {
        newSelected[tool.id] = "pose_crossed_arm" // Use CrossedArm pose instead of standing1
        continue
      }

      newSelected[tool.id] = tool.items[0].id
    }

    setSelected(newSelected)
    
    // Set both shop modes to true by default
    setInClothingShop(true);
    setInBarberShop(true);
  }, [])
  
  // Handle being near clothing shop
  const handleNearShop = (isNear: boolean) => {
    setNearShop(isNear);
    // If we're no longer near the shop and were customizing, exit customization
    if (!isNear && customizingClothing) {
      setCustomizingClothing(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Rotate character 180 degrees to face the shop again AND
      // Move them a few units back from the house to prevent clipping
      if (characterRef.current) {
        characterRef.current.rotation.y = Math.PI; // Face back toward the shop
        // Move character further away from the house (increase z distance)
        characterRef.current.position.z = 15; // Increased from 14.5 to match toggleClothingCustomization
        
        // Update position in multiplayer if connected
        if (isConnected && sendPositionUpdate) {
          const x = characterRef.current.position.x;
          const z = characterRef.current.position.z;
          console.log('Multiplayer: Positioning character further from shop', {x, z, r: Math.PI});
          sendPositionUpdate({x, z, r: Math.PI});
        }
      }
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        sendAppearanceUpdate(subToolColors, selected);
      }
      
      // Restore chat when exiting shop - with a delay to ensure state updates
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.endCharacterInteraction) {
          window.endCharacterInteraction();
          console.log("Released chat after leaving clothing shop area");
        }
      }, 200);
    }
  };

  // Handle being near barber shop
  const handleNearBarberShop = (isNear: boolean) => {
    setNearBarberShop(isNear);
    // If we're no longer near the shop and were customizing, exit customization
    if (!isNear && customizingHair) {
      setCustomizingHair(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Rotate character 180 degrees to face the shop again AND
      // Move them a few units back from the house to prevent clipping
      if (characterRef.current) {
        characterRef.current.rotation.y = Math.PI; // Face back toward the shop
        // Move character further away from the house (increase z distance)
        characterRef.current.position.z = 15; // Increased from 14.5 to match other functions
        
        // Update position in multiplayer if connected
        if (isConnected && sendPositionUpdate) {
          const x = characterRef.current.position.x;
          const z = characterRef.current.position.z;
          console.log('Multiplayer: Positioning character further from barber shop', {x, z, r: Math.PI});
          sendPositionUpdate({x, z, r: Math.PI});
        }
      }
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        sendAppearanceUpdate(subToolColors, selected);
      }
      
      // Restore chat when exiting shop - with a delay to ensure state updates
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.endCharacterInteraction) {
          window.endCharacterInteraction();
        }
      }, 200);
    }
  };

  // Toggle clothing customization
  const toggleClothingCustomization = () => {
    // Only allow toggling if the character is not moving
    if (isCharacterMoving) return;
    
    const willBeCustomizing = !customizingClothing;
    
    if (willBeCustomizing) {
      // Always set customization mode first to ensure it's activated on the first click
      setCustomizingClothing(true);
      
      // Set global flag to disable movement
      window.isCustomizingClothing = true;
      
      // Position character at the optimal viewing position
      if (characterRef.current) {
        // Get current position to determine approach angle
        const currentPosition = characterRef.current.position.clone();
        
        // Calculate if they're approaching from the front or back side
        const isApproachingFromBack = currentPosition.z < clothingShopPosition[2];
        
        console.log('Approaching clothing shop from:', isApproachingFromBack ? 'back side' : 'front side');
        
        // Set to ideal position in front of the shop
        characterRef.current.position.x = 0;
        characterRef.current.position.z = 11.5; // Increased from 11.36 to prevent camera clipping
        
        // Face character AWAY from the shop (180 degrees from before)
        characterRef.current.rotation.y = 0; // 0 is opposite of Math.PI (3.14)

        // Send position update to multiplayer if connected
        if (isConnected && sendPositionUpdate) {
          console.log('Multiplayer: Setting character to ideal shop position', {x: 0, z: 11.5, r: 0});
          sendPositionUpdate({x: 0, z: 11.5, r: 0});
        }
      }
      
      // Force select the color tool
      setTool(tools.find(t => t.id === "tool_2") || tools[0]);
      
      // Hide chat when customizing
      if (typeof window !== 'undefined' && window.startClothingShopInteraction) {
        window.startClothingShopInteraction();
      }
    } else {
      // Exiting customization mode
      setCustomizingClothing(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        sendAppearanceUpdate(subToolColors, selected);
      }
      
      // Rotate character and move it further from the house to prevent clipping
      if (characterRef.current) {
        // Face back toward the shop
        characterRef.current.rotation.y = Math.PI;
        // Move character further from the house (increased from 14.5 to 15 for safety)
        characterRef.current.position.z = 15;
        
        // Update position in multiplayer if connected
        if (isConnected && sendPositionUpdate) {
          sendPositionUpdate({
            x: characterRef.current.position.x,
            z: 15,
            r: Math.PI
          });
        }
      }
      
      // Restore chat when done customizing
      if (typeof window !== 'undefined' && window.endCharacterInteraction) {
        window.endCharacterInteraction();
      }
    }
  };

  // Toggle hair customization
  const toggleHairCustomization = () => {
    // Only allow toggling if the character is not moving
    if (isCharacterMoving) return;
    
    const willBeCustomizing = !customizingHair;
    
    if (willBeCustomizing) {
      // Always set customization mode first to ensure it's activated on the first click
      setCustomizingHair(true);
      
      // Set global flag to disable movement
      window.isCustomizingClothing = true;
      
      // Position character at the optimal viewing position, facing AWAY from shop
      if (characterRef.current) {
        // Get current position to determine approach angle
        const currentPosition = characterRef.current.position.clone();
        
        // Calculate if they're approaching from the front or back side
        const isApproachingFromBack = currentPosition.z < barberShopPosition[2];
        
        console.log('Approaching barber shop from:', isApproachingFromBack ? 'back side' : 'front side');
        
        // Set to ideal position in front of the shop
        characterRef.current.position.x = 0;
        characterRef.current.position.z = 11.5; // Increased from 11.36 to match clothing shop
        characterRef.current.rotation.y = 0;
        
        // If we have position update capability, also set proper position
        if (isConnected && sendPositionUpdate) {
          console.log('Multiplayer: Setting character to ideal position');
          sendPositionUpdate({x: 0, z: 11.5, r: 0});
        }
      }
      
      // Force select the hair tool
      setTool(tools.find(t => t.id === "hair") || tools[0]);
      
      // Hide chat when customizing
      if (typeof window !== 'undefined' && window.startBarberShopInteraction) {
        window.startBarberShopInteraction();
      }
    } else {
      // Exiting customization mode
      setCustomizingHair(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        sendAppearanceUpdate(subToolColors, selected);
      }
      
      // Rotate character and move it further from the shop to prevent clipping
      if (characterRef.current) {
        // Ensure the rotation is set just once
        characterRef.current.rotation.y = Math.PI;
        characterRef.current.position.z = 15; // Increased from 14.5 to match other functions
        
        // Update position in multiplayer if connected
        if (isConnected && sendPositionUpdate) {
          sendPositionUpdate({
            x: characterRef.current.position.x,
            z: 15,
            r: Math.PI
          });
        }
      }
      
      // Restore chat when done customizing
      if (typeof window !== 'undefined' && window.endCharacterInteraction) {
        window.endCharacterInteraction();
      }
    }
  };

  // Download pose as png
  const DownloadPose = () => {
    setVisible(false)
    
    setTimeout(() => {
      const canvas = document.querySelector("canvas");

      if (!canvas) {
        return;
      }
      
      const image = canvas.toDataURL("image/png", 1)
      
      const link = document.createElement('a');
      link.download = "character.png";
      link.href = image;
      link.click();

      setVisible(true)
    }, 1000);
  };

  // Handle character movement state changes
  const handleCharacterMovementChange = (moving) => {
    if (moving && customizingClothing) {
      setCustomizingClothing(false);
    }
  };

  // Handle character pose changes
  useEffect(() => {
    // Keep track of current pose timeout
    let poseTimeout: number | null = null;
    
    window.setCharacterPose = (pose: string) => {
      // If there's a pending timeout, clear it
      if (poseTimeout) {
        window.clearTimeout(poseTimeout);
        poseTimeout = null;
      }
      
      // Convert camelCase to snake_case properly
      // First handle explicit mappings for poses we know
      let formattedPose;
      
      // Map specific IDs to their correct format
      switch (pose) {
        case "CrossedArm":
          formattedPose = "pose_crossed_arm";
          break;
        case "JumpHappy":
          formattedPose = "pose_jump_happy";
          break;
        case "PointingDown":
          formattedPose = "pose_pointing_down";
          break;
        case "PointingLeft":
          formattedPose = "pose_pointing_left";
          break;
        case "PointingRight":
          formattedPose = "pose_pointing_right";
          break;
        case "PointingUp":
          formattedPose = "pose_pointing_up";
          break;
        case "SittingHappy":
          formattedPose = "pose_sitting_happy";
          break;
        case "SittingSad":
          formattedPose = "pose_sitting_sad";
          break;
        case "Standing1":
          formattedPose = "pose_standing1";
          break;
        case "StandingSad":
          formattedPose = "pose_standing_sad";
          break;
        default:
          // For simple cases like "Confident", just lowercase
          formattedPose = `pose_${pose.toLowerCase()}`;
      }
      
      // Apply the new pose
      setSelected(prev => ({
        ...prev,
        pose: formattedPose
      }));
      
      // Set a timeout to revert to CrossedArm after 5 seconds
      // but only if the pose isn't already CrossedArm
      if (formattedPose !== "pose_crossed_arm" && formattedPose !== "pose_character_stop") {
        poseTimeout = window.setTimeout(() => {
          setSelected(prev => ({
            ...prev,
            pose: "pose_crossed_arm"
          }));
          poseTimeout = null;
        }, 5000);
      }
    };

    return () => {
      // Clean up any pending timeout
      if (poseTimeout) {
        window.clearTimeout(poseTimeout);
      }
      window.setCharacterPose = undefined;
    };
  }, []);

  // Send appearance data when it changes
  useEffect(() => {
    if (!isConnected) return;
    
    // Don't send updates during customization - will send on exit instead
    if (customizingClothing || customizingHair) return;
    
    // Check if appearance has actually changed
    const colorsStr = JSON.stringify(subToolColors);
    const selectedStr = JSON.stringify(selected);
    const lastColorsStr = JSON.stringify(lastSentAppearance.current.colors);
    const lastSelectedStr = JSON.stringify(lastSentAppearance.current.selected);
    
    // Only send if something changed
    if (colorsStr !== lastColorsStr || selectedStr !== lastSelectedStr) {
      // Use the function from context instead of direct socket.emit
      sendAppearanceUpdate(subToolColors, selected);
      
      // Update last sent appearance
      lastSentAppearance.current = {
        colors: JSON.parse(colorsStr),
        selected: JSON.parse(selectedStr)
      };
      
      console.log('Multiplayer: Sent appearance update', {
        changed: {
          colors: colorsStr !== lastColorsStr,
          selected: selectedStr !== lastSelectedStr
        }
      });
    }
  }, [subToolColors, selected, isConnected, customizingClothing, customizingHair, sendAppearanceUpdate]);

  // Send initial appearance data when first connected
  useEffect(() => {
    if (isConnected && subToolColors && selected) {
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        // Use the function from context instead of direct socket.emit
        sendAppearanceUpdate(subToolColors, selected);
        
        console.log('Multiplayer: Sent initial appearance data');
        
        // Store as last sent appearance
        lastSentAppearance.current = {
          colors: JSON.parse(JSON.stringify(subToolColors)),
          selected: JSON.parse(JSON.stringify(selected))
        };
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, subToolColors, selected, sendAppearanceUpdate]);

  // ---- NEW useEffect to handle joining the game ----
  useEffect(() => {
    // Ensure socket is connected, appearance data is ready, and we haven't joined yet
    if (isConnected && joinGame && subToolColors && selected && !hasJoinedGame.current) {
      console.log('AppContent: Connection ready, joining game with current appearance...');
      joinGame({ colors: subToolColors, selected });
      hasJoinedGame.current = true; // Mark as joined
    }
    // Reset join flag if disconnected
    if (!isConnected) {
      hasJoinedGame.current = false;
    }
  }, [isConnected, joinGame, subToolColors, selected]);
  // ---- END NEW useEffect ----

  // ---- Temporarily disable localStorage for debugging color sync issues ----
  /*
  // Load appearance from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('playerAppearance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.colors && parsed.selected) {
          // Validate loaded data (simple check for now)
          if (Array.isArray(parsed.colors) && typeof parsed.selected === 'object') {
            setSubToolColors(parsed.colors);
            setSelected(parsed.selected);
            console.log('Loaded saved appearance from localStorage');
          }
        }
      }
    } catch (error) {
      console.error('Error loading appearance from localStorage:', error);
    }
  }, []); // Run only once on mount
  */
  /*
  // Save appearance to localStorage whenever it changes
  useEffect(() => {
    // Don't save during customization - wait till complete
    if (customizingClothing || customizingHair) return;
    
    try {
      const appearanceToSave = { colors: subToolColors, selected };
      localStorage.setItem('playerAppearance', JSON.stringify(appearanceToSave));
      console.log('Saved appearance to localStorage');
    } catch (error) {
      console.error('Error saving appearance to localStorage:', error);
    }
  }, [subToolColors, selected, customizingClothing, customizingHair]);
  */
  // ---- End temporary localStorage disable ----

  // Effect to hide the game messaging UI when in special areas or talking to helper
  useEffect(() => {
    // Make sure window properties exist
    if (typeof window === 'undefined') return;
    
    // Explicitly update the chat visibility status
    const updateChatVisibility = () => {
      // Direct flag approach for immediate effect
      window.hideGameMessaging = customizingClothing || customizingHair || window.chatboxOpen || false;
      
      // Update joystick visibility
      window.hideJoystick = customizingClothing || customizingHair || window.chatboxOpen || false;
      
      // Update the config flag too
      if (window.gameChatConfig) {
        window.gameChatConfig.visible = !window.hideGameMessaging;
      }
      
      // Trigger appropriate interaction functions
      if (customizingClothing && window.startClothingShopInteraction) {
        window.startClothingShopInteraction();
      } else if (customizingHair && window.startBarberShopInteraction) {
        window.startBarberShopInteraction();
      } else if (window.chatboxOpen && window.startHelperInteraction) {
        window.startHelperInteraction();
      } else if (!customizingClothing && !customizingHair && !window.chatboxOpen && window.endCharacterInteraction) {
        // If we're not in any interaction, make sure chat is shown
        window.endCharacterInteraction();
      }
    };
    
    // Run immediately
    updateChatVisibility();
    
    // And set up a periodic check
    const interval = setInterval(updateChatVisibility, 100);
    
    return () => {
      // Reset on component unmount
      clearInterval(interval);
      window.hideGameMessaging = false;
      window.hideJoystick = false;
      if (window.gameChatConfig) {
        window.gameChatConfig.visible = true;
      }
    };
  }, [customizingClothing, customizingHair]);

  // When character is created, set up shop defaults
  useEffect(() => {
    if (characterRef.current) {
      // Hide game messaging when interacting with helper character
      if (typeof window !== 'undefined' && window.hideGameMessaging !== undefined) {
        // Add listeners for any time the character interacts with special shops
        const handleInteractionChange = () => {
          // Check if any shop or helper is active
          const inAnyInteraction = customizingClothing || customizingHair || window.chatboxOpen;
          
          // Update global messaging visibility
          if (inAnyInteraction && window.hideGameMessaging === false) {
            // Hide chat when any interaction starts
            if (customizingClothing && window.startClothingShopInteraction) {
              window.startClothingShopInteraction();
            } else if (customizingHair && window.startBarberShopInteraction) {
              window.startBarberShopInteraction();
            } else if (window.chatboxOpen && window.startHelperInteraction) {
              window.startHelperInteraction();
            }
          } 
        };
        
        // Check initially
        handleInteractionChange();
        
        // Set up interval to periodically check interaction state
        const checkInterval = setInterval(handleInteractionChange, 500);
        
        return () => {
          clearInterval(checkInterval);
        };
      }
    }
  }, [characterRef, customizingClothing, customizingHair]);

  // --- Render Reset Button ---
  const ResetButton = () => (
    <button
      onClick={handleReset}
      className="fixed bottom-5 right-5 z-[10000] bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out"
      aria-label="Reset Position"
    >
      I'm Stuck
    </button>
  );
  // -------------------------

  // --- Define Portal Position --- 
  const portalPosition: [number, number, number] = [25, 0, 25];
  // ------------------------------

  return (
    <div className="relative w-full h-screen">
      {/* Vibe Jam 2025 link - positioned in top left on mobile */}
      <a 
        target="_blank" 
        href="https://jam.pieter.com" 
        style={{
          fontFamily: 'system-ui, sans-serif',
          position: 'fixed',
          ...(window.innerWidth <= 768 
            ? { top: '0px', left: '0px', borderBottomRightRadius: '12px', borderTopLeftRadius: '0px' }
            : { bottom: '-1px', right: '-1px', borderTopLeftRadius: '12px', borderBottomRightRadius: '0px' }
          ),
          padding: '7px',
          fontSize: '14px',
          fontWeight: 'bold',
          background: '#fff',
          color: '#000',
          textDecoration: 'none',
          zIndex: 10000,
          border: '1px solid #fff'
        }}
      >
        🕹️ Vibe Jam 2025
      </a>

      <div
        className={classNames("w-full h-screen relative", {
          "bg-white": theme === "light",
          "bg-neutral-100": theme === "dark",
        })}
      >
        <Analytics mode="production" debug={true} />

        <div className="w-full h-screen">
          <Canvas gl={{ preserveDrawingBuffer: true, antialias: true }} shadows camera={{ fov: 30 }} linear={false} dpr={1.5}>
            <fog attach="fog" args={[theme === "light" ? '#1C1D22' : '#1C1D22', 17, 42.5]} />
            <Ground theme={theme} visible={visible} />
            <Character colors={subToolColors} selected={selected} logo={logo} characterRef={characterRef} />
            <CharacterMessage characterRef={characterRef} />
            <RemoteCharactersManager />
            {inClothingShop && (
              <ClothingShop 
                position={clothingShopPosition} 
                onChangeClothing={toggleClothingCustomization}
                canChangeClothing={nearShop && !isCharacterMoving}
                isCustomizing={customizingClothing}
                tool={tool}
                selected={selected}
                subToolColors={subToolColors}
                onClickItem={(item) => {
                  console.log('--- Clothing Item Clicked ---');
                  console.log('Item ID:', item.id);
                  console.log('Tool ID:', tool.id);
                  console.log('-----------------------------');
                  
                  // Existing logic
                  console.log('Multiplayer: Changing item', { toolId: tool.id, itemId: item.id });
                  setSelected({
                    ...selected,
                    [tool.id]: item.id
                  });
                  // Handle logo upload click specifically if needed
                  if (item.id === 'logo_upload') {
                    refLogoInput.current?.click();
                  }
                }}
                onChangeColor={(changeData) => {
                  const { subToolId: iconSubToolId, color } = changeData;
                  console.log(`Multiplayer: Received color change for icon ${iconSubToolId}`, color);

                  // --- Mapping from Icon subToolId to Target Mesh subToolId ---
                  let targetSubToolId: string | null = null;
                  switch (iconSubToolId) {
                    case "tool_2_item_1": // Hair Icon
                      targetSubToolId = "tool_2_item_4"; // Target Hair Mesh Color ID
                      break;
                    case "tool_2_item_2": // Beard Icon
                      targetSubToolId = "tool_2_item_2"; // Target Beard Mesh Color ID (Correct)
                      break;
                    case "tool_2_item_3": // Shirt Main Icon -> NOW TARGETS CUFFS
                      targetSubToolId = "tool_2_item_3"; // Target Shirt Cuffs Mesh Color ID
                      break;
                    case "tool_2_item_4": // Shirt Cuffs Icon -> NOW TARGETS MAIN SHIRT
                      targetSubToolId = "tool_2_item_5"; // Target Shirt Main Mesh Color ID
                      break;
                    case "tool_2_item_5": // Pants Icon
                      targetSubToolId = "tool_2_item_1"; // Target Pants Mesh Color ID
                      break;
                    // Add cases for other color icons if they exist (e.g., shoes, hat)
                    // default: 
                    //  console.warn(`No target mapping found for icon subToolId: ${iconSubToolId}`);
                  }
                  // ----------------------------------------------------------

                  if (targetSubToolId) {
                    console.log(`Multiplayer: Updating target ${targetSubToolId} with color ${color}`);
                    const newSubToolColors = subToolColors.map((item) => {
                      if (item.subToolId === targetSubToolId) {
                        return { ...item, color: color };
                      }
                      return item;
                    });
                    // Ensure the target item exists before updating state
                    if (newSubToolColors.some(item => item.subToolId === targetSubToolId)) {
                         setSubToolColors(newSubToolColors);
                    } else {
                        console.warn(`Target subToolId ${targetSubToolId} not found in subToolColors state.`);
                        // Optionally add the item if it's missing (though it should exist based on DEFAULT_COLORS)
                        // setSubToolColors([...newSubToolColors, { subToolId: targetSubToolId, color: color }]);
                    }
                  } else {
                     console.warn(`Could not find target subToolId mapping for icon: ${iconSubToolId}`);
                  }
                }}
                onExitCustomization={toggleClothingCustomization}
                isMobile={!isDesktop}
              />
            )}
            {inBarberShop && (
              <BarberShop 
                position={barberShopPosition} 
                onChangeHair={() => console.log("Barber shop coming soon!")}
                canChangeHair={nearBarberShop && !isCharacterMoving}
                isCustomizing={false}
              />
            )}
            <ThirdPersonCamera 
              characterRef={characterRef} 
              customizingClothing={customizingClothing || customizingHair} 
              shopPosition={clothingShopPosition} 
              helperCharacterRef={helperCharacterRef}
            />
            <CharacterControls characterRef={characterRef} />
            {inClothingShop && (
              <SceneManager 
                characterRef={characterRef} 
                shopPosition={clothingShopPosition}
                portalPosition={portalPosition}
                username={initialUsername}
                onNearShop={handleNearShop}
                onCharacterMovementChange={handleCharacterMovementChange}
              />
            )}
            {inBarberShop && (
              <SceneManager 
                characterRef={characterRef} 
                shopPosition={barberShopPosition} 
                portalPosition={portalPosition}
                username={initialUsername}
                onNearShop={handleNearBarberShop}
                onCharacterMovementChange={handleCharacterMovementChange}
              />
            )}
            <HelperCharacter ref={helperCharacterRef} />
            <Portal />
            <ContactShadows opacity={opacity} scale={scale * 0.5} blur={blur} far={far} />
            <Lights selected={selected} />
          </Canvas>
        </div>

        {/* Mobile controls - outside of Canvas */}
        <MobileControlsProvider />

        {/* Chatbox */}
        <Chatbox />

        {/* Add MultiplayerManager component for connection status display */}
        <MultiplayerManager initialUsername={initialUsername} />

        {/* Only show minimal UI on mobile */}
        {!isDesktop && (
          <>
            <div className="absolute top-6 left-6 z-20">
              <Logo className="w-32" fill={theme === "light" ? "#121F3E" : "white"} />
            </div>
            <div className="absolute top-6 right-6 z-20">
              <button
                className="text-sm text-white w-11 h-11 flex items-center justify-center bg-neutral-20 rounded-full"
                type="button"
                onClick={() => setIsManualOpen(true)}
              >
                <IconMenu className="w-5 h-5" fill="#4B50EC" />
              </button>
            </div>
          </>
        )}

        {/* Full UI only on desktop */}
        {isDesktop && (
          <>
            <div className="absolute top-8 left-8">
              <Logo className="w-44" fill={theme === "light" ? "#121F3E" : "white"} />
            </div>

            <div className="flex items-center absolute top-8 right-8">
              <div className="text-sm text-white font-medium h-11 px-4 bg-primary rounded-full flex items-center">
                Controls: W=forward, A=turn left, D=turn right, SHIFT=run
              </div>
              <button
                className="text-sm text-white font-medium h-11 px-4 bg-primary rounded-full ml-4"
                type="button"
                onClick={() => {
                  DownloadPose();
                }}
              >
                Export
              </button>
              <button
                className="text-sm text-white w-11 h-11 flex items-center justify-center bg-neutral-20 rounded-full ml-4"
                type="button"
                onClick={() => setIsManualOpen(true)}
              >
                <IconMenu className="w-5 h-5" fill="#4B50EC" />
              </button>
            </div>

            <div className="flex items-center mr-auto absolute bottom-8 left-8">
              <ThemeToggle />
              <button className="text-[#8D98AF] text-xs font-medium ml-5">
                {
                  debuggerVisible ? (
                    <span onClick={() => setDebuggerVisible(!debuggerVisible)}>Show Debugger</span>
                  ) : (
                    <span onClick={() => setDebuggerVisible(!debuggerVisible)}>Hide Debugger</span>
                  )
                }
              </button>
              <p className="text-[#8D98AF] text-xs font-medium ml-5" >
                © 2025,
                <a href="https://github.com/llo7d" target="_blank">
                  {" "}by llo7d
                </a>
              </p>
            </div>
          </>
        )}

        <ManualPopup
          isOpen={isManualOpen}
          onClickClose={() => setIsManualOpen(false)}
        />

        <Leva hidden={!debuggerVisible || !isDesktop} titleBar={{ title: 'Debugger' }} />

        {/* Render the reset button */}
        <ResetButton />
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  // State to track if the username has been submitted via the loader
  const [usernameSubmitted, setUsernameSubmitted] = useState<string | null>(null);

  // Callback for when username is submitted FROM THE LOADER
  const handleLoaderSubmit = useCallback((username: string) => {
    console.log("Username submitted via Loader:", username);
    setUsernameSubmitted(username);
    // The Loader component will handle its own fade-out
  }, []);

  return (
    <MultiplayerProvider initialUsername={usernameSubmitted || 'Player'}>
      {/* Display Loader until username is submitted */}
      {!usernameSubmitted && <Loader onLoadedSubmit={handleLoaderSubmit} />}
      
      {/* Render main content only AFTER username is submitted */}
      {usernameSubmitted && <AppContent initialUsername={usernameSubmitted} />}
    </MultiplayerProvider>
  );
}

