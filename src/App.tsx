import React, { ChangeEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from 'three'

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
import { MultiplayerProvider, useMultiplayer } from './contexts/MultiplayerContext';
import MultiplayerManager from './components/MultiplayerManager';
import RemoteCharactersManager from "./components/RemoteCharactersManager";

// This component handles all scene-specific behaviors that need to use hooks like useFrame
const SceneManager = ({ 
  characterRef, 
  shopPosition, 
  onNearShop, 
  onCharacterMovementChange 
}) => {
  // Convert shop position array to Vector3
  const shopVec = new THREE.Vector3(shopPosition[0], shopPosition[1], shopPosition[2]);
  
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
      characterRef.current.position.set(0, 0, 30); // Start much further away from the shop
      characterRef.current.rotation.y = Math.PI; // 180 degrees, facing toward the shop
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

// Create a wrapper component that uses the multiplayer hooks
const AppContent = () => {
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

  const [debuggerVisible, setDebuggerVisible] = useState(true);
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
  
  // Get socket from multiplayer context
  const { socket, isConnected, sendAppearanceUpdate } = useMultiplayer();
  
  // Track last sent appearance
  const lastSentAppearance = useRef({ colors: null, selected: null });

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
      if (item.id === "tool_2_item_1") {
        return {
          subToolId: item.id,
          color: "#131313",
        };
      }
      if (item.id === "tool_2_item_2") {
        return {
          subToolId: item.id,
          color: "#131313",
        };
      }
      if (item.id === "tool_2_item_3") {
        return {
          subToolId: item.id,
          color: "#d8d8d8",
        };
      }

      if (item.id === "tool_2_item_4") {
        return {
          subToolId: item.id,
          color: "#ffffff",
        };
      }
      if (item.id === "tool_2_item_5") {
        return {
          subToolId: item.id,
          color: "#aabef9",
        };
      }
      if (item.id === "tool_2_item_6") {
        return {
          subToolId: item.id,
          color: "#768bca",
        };
      }

      if (item.id === "tool_2_item_8") {
        return {
          subToolId: item.id,
          color: "#ffffff",
        };
      }

      if (item.id === "tool_2_item_9") {
        return {
          subToolId: item.id,
          color: "#4e5a87",
        };
      }

      if (item.id === "tool_2_item_10") {
        return {
          subToolId: item.id,
          color: "#3a4673",
        };
      }

      if (item.id === "tool_2_item_11") {
        return {
          subToolId: item.id,
          color: "#ffffff",
        };
      }

      if (item.id === "tool_2_item_12") {
        return {
          subToolId: item.id,
          color: "#3a4673",
        };
      }

      return {
        subToolId: item.id,
        color: "#141414",
      };
    })
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
  
  // Toggle clothing customization mode
  const toggleClothingCustomization = () => {
    // Only allow toggling if the character is not moving
    if (isCharacterMoving) return;
    
    if (!customizingClothing) {
      // Entering customization mode
      setCustomizingClothing(true);
      
      // Set global flag to disable movement
      window.isCustomizingClothing = true;
      
      // Rotate character to face the camera
      if (characterRef.current) {
        // Face character toward the camera (character shows front to camera)
        characterRef.current.rotation.y = 0; // This makes the front of the character face the camera
      }
      
      // Force select the color tool
      setTool(tools.find(t => t.id === "tool_2") || tools[0]);
    } else {
      // Exiting customization mode
      setCustomizingClothing(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Return character to original rotation if needed
      if (characterRef.current) {
        // Reset character rotation to default (facing the shop)
        characterRef.current.rotation.y = Math.PI;
      }
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        // Use the function from context instead of direct socket.emit
        sendAppearanceUpdate(subToolColors, selected);
        console.log('Multiplayer: Sent appearance update on customization exit');
      }
    }
  };

  // Toggle hair customization mode
  const toggleHairCustomization = () => {
    // Only allow toggling if the character is not moving
    if (isCharacterMoving) return;
    
    if (!customizingHair) {
      // Entering customization mode
      setCustomizingHair(true);
      
      // Set global flag to disable movement
      window.isCustomizingClothing = true;
      
      // Rotate character to face the camera
      if (characterRef.current) {
        characterRef.current.rotation.y = 0;
      }
      
      // Force select the hair tool
      setTool(tools.find(t => t.id === "hair") || tools[0]);
    } else {
      // Exiting customization mode
      setCustomizingHair(false);
      
      // Remove global flag to re-enable movement
      window.isCustomizingClothing = false;
      
      // Return character to original rotation if needed
      if (characterRef.current) {
        characterRef.current.rotation.y = Math.PI;
      }
      
      // Send appearance update when exiting customization mode
      if (isConnected) {
        // Use the function from context instead of direct socket.emit
        sendAppearanceUpdate(subToolColors, selected);
        console.log('Multiplayer: Sent appearance update on hair customization exit');
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

  // Handle shop proximity changes
  const handleNearShop = (isNear) => {
    setNearShop(isNear);
  };

  // Handle barber shop proximity changes
  const handleNearBarberShop = (isNear) => {
    setNearBarberShop(isNear);
  };
  
  // Handle character movement state changes
  const handleCharacterMovementChange = (moving) => {
    if (moving && customizingClothing) {
      setCustomizingClothing(false);
    }
  };

  // Handle character pose changes
  useEffect(() => {
    window.setCharacterPose = (pose: string) => {
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
      
      setSelected(prev => ({
        ...prev,
        pose: formattedPose
      }));
    };

    return () => {
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
        <Loader />

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
              />
            )}
            {inBarberShop && (
              <BarberShop 
                position={barberShopPosition} 
                onChangeHair={toggleHairCustomization}
                canChangeHair={nearBarberShop && !isCharacterMoving}
                isCustomizing={customizingHair}
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
                onNearShop={handleNearShop}
                onCharacterMovementChange={handleCharacterMovementChange}
              />
            )}
            {inBarberShop && (
              <SceneManager 
                characterRef={characterRef} 
                shopPosition={barberShopPosition} 
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
        <MultiplayerManager visible={true} />

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

        {/* Fixed position close button for clothing customization */}
        {customizingClothing && (
          <div className="fixed top-8 right-8 z-50">
            <button
              className="text-2xl w-16 h-16 flex items-center justify-center bg-red-500 rounded-full shadow-lg border-2 border-white"
              type="button"
              onClick={() => toggleClothingCustomization()}
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = '#e74c3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Customization UI */}
        {customizingClothing && isDesktop && (
          <div className="fixed bottom-1/2 right-56 transform translate-y-1/2 z-30">
            <SubToolbar
              subToolId={selected[tool.id]}
              tool={tool}
              colors={subToolColors}
              onClickItem={(item) => {
                console.log('Multiplayer: Changing item', { toolId: tool.id, itemId: item.id });
                setSelected({
                  ...selected,
                  [tool.id]: item.id
                })

                if (item.id === 'logo_upload') {
                  refLogoInput.current?.click();
                }
              }}
              onChangeColor={(subToolColor) => {
                console.log('Multiplayer: Changing color', { subToolId: selected[tool.id], color: subToolColor.color });
                const newSubToolColors = subToolColors.map((color) => {
                  if (color.subToolId === selected[tool.id]) {
                    return {
                      ...color,
                      color: subToolColor.color,
                    };
                  }

                  return color;
                });

                setSubToolColors(newSubToolColors);
              }}
            />
            <input
              ref={refLogoInput}
              className="hidden"
              type="file"
              accept="image/png"
              onChange={handlePickedLogo}
            />
            
            {/* Exit button positioned right under the customization UI */}
            <div className="mt-4 flex justify-center">
              <button
                className="text-white font-bold px-6 py-3 bg-red-500 rounded-full shadow-lg border-2 border-white"
                type="button"
                onClick={() => toggleClothingCustomization()}
                style={{
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = '#e74c3c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Exit Clothing Customization
              </button>
            </div>
          </div>
        )}

        <ManualPopup
          isOpen={isManualOpen}
          onClickClose={() => setIsManualOpen(false)}
        />

        <Leva hidden={debuggerVisible} />
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  return (
    <MultiplayerProvider>
      <AppContent />
    </MultiplayerProvider>
  );
}

