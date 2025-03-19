import React, { ChangeEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
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
  
  // Initialize character rotation to face away from the shop (180 degrees around Y axis)
  useEffect(() => {
    if (characterRef.current) {
      // Position character further away from the shop initially
      characterRef.current.position.set(0, 0, 30); // Start much further away from the shop
      characterRef.current.rotation.y = Math.PI; // 180 degrees, facing the shop
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

export default function App() {
  // Character reference for controlling movement
  const characterRef = useRef<THREE.Group>(null);
  
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

  const { opacity, blur, scale, far } =
    useControls('Ground Shadows', {
      opacity: { value: 0.7, step: 0.05 },
      scale: { value: 2, step: 0.05 },
      blur: { value: 3.5, step: 0.05 },
      far: { value: 1.2, step: 0.05 },
    })

  // It has this format (you can see data.ts):
  // tool.id: tool.items.id
  const [selected, setSelected] = useState<Record<string, string>>({})

  // Tool 2 subtool colors. Set default color state here.
  const [subToolColors, setSubToolColors] = useState(
    tools[1].items.map((item) => {
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
        newSelected[tool.id] = "pose_standing1" // Use a standing pose for movement
        continue
      }

      newSelected[tool.id] = tool.items[0].id
    }

    setSelected(newSelected)
    
    // Set the clothing shop mode to true by default
    setInClothingShop(true);
  }, [])
  
  // Toggle clothing customization mode
  const toggleClothingCustomization = () => {
    // Only allow toggling if the character is not moving
    if (isCharacterMoving) return;
    
    if (!customizingClothing) {
      // Entering customization mode
      setCustomizingClothing(true);
      
      // Rotate character to face away from the house (away from door/shop) for better camera view
      if (characterRef.current) {
        // Face character away from the shop (door is at z+ direction of shop)
        characterRef.current.rotation.y = 0; // This makes character face along z+ direction, away from shop door
      }
      
      // Force select the color tool
      setTool(tools.find(t => t.id === "tool_2") || tools[0]);
    } else {
      // Exiting customization mode
      setCustomizingClothing(false);
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
  
  // Handle character movement state changes
  const handleCharacterMovementChange = (moving) => {
    setIsCharacterMoving(moving);
    
    // If character starts moving while customizing, exit customization mode
    if (moving && customizingClothing) {
      setCustomizingClothing(false);
    }
  };

  if (!isDesktop) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-3xl font-medium">Mobile support coming soon</p>
      </div>
    );
  }
  
  return (
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
          {inClothingShop && (
            <ClothingShop 
              position={clothingShopPosition} 
              onChangeClothing={toggleClothingCustomization}
              canChangeClothing={nearShop && !isCharacterMoving}
            />
          )}
          <ThirdPersonCamera characterRef={characterRef} customizingClothing={customizingClothing} shopPosition={clothingShopPosition} />
          <CharacterControls characterRef={characterRef} />
          {inClothingShop && (
            <SceneManager 
              characterRef={characterRef} 
              shopPosition={clothingShopPosition} 
              onNearShop={handleNearShop}
              onCharacterMovementChange={handleCharacterMovementChange}
            />
          )}
          <ContactShadows opacity={opacity} scale={scale} blur={blur} far={far} />
          <Lights selected={selected} />
        </Canvas>
      </div>

      <div className="absolute top-8 left-8">
        <Logo className="w-44" fill={theme === "light" ? "#121F3E" : "white"} />
      </div>

      <div className="flex items-center absolute top-8 right-8">
        <div className="text-sm text-white font-medium h-11 px-4 bg-primary rounded-full flex items-center">
          Controls: W=back, S=forward, A=right, D=left, SHIFT=run
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

      {/* Only show toolbar when customizing clothing */}
      {customizingClothing && (
        <div className="fixed bottom-1/2 right-56 transform translate-y-1/2 z-30">
          <SubToolbar
            subToolId={selected[tool.id]}
            tool={tool}
            colors={subToolColors}
            onClickItem={(item) => {
              setSelected({
                ...selected,
                [tool.id]: item.id
              })

              if (item.id === 'logo_upload') {
                refLogoInput.current?.click();
              }
            }}
            onChangeColor={(subToolColor) => {
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
        </div>
      )}

      <ManualPopup
        isOpen={isManualOpen}
        onClickClose={() => setIsManualOpen(false)}
      />

      <Leva hidden={debuggerVisible} />
    </div>
  );
}

