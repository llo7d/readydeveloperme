import React, { SVGProps, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";
import { Tool, ToolItem } from "../helpers/data";
import { useStore } from "../store/store";
import { useMediaQuery } from "react-responsive";

type Props = {
  subToolId: string;
  tool: Tool;
  colors: any[];
  onClickItem: (item: ToolItem) => void;
  onHoverTool?: (isEntered: boolean) => void;
  onChangeColor: (changeData: { subToolId: string; color: string }) => void;
  isMobile?: boolean;
};

const SubToolbar: React.FC<Props> = ({
  subToolId,
  tool,
  colors,
  onClickItem,
  onHoverTool,
  onChangeColor,
  isMobile = false,
}) => {
  const [isSubToolbarOpen, setIsSubToolbarOpen] = useState(true);
  const [isColorPaletteShow, setIsColorPaletteShow] = useState(false);
  const [activeColorItem, setActiveColorItem] = useState<string | null>(null);
  const theme = useStore((state) => state.theme);
  const refScroll = useRef<HTMLDivElement>(null);
  const refItems = useRef<(HTMLButtonElement | null)[]>([]);
  const [colorUpdateCounter, setColorUpdateCounter] = useState(0);

  useEffect(() => {
    setColorUpdateCounter(prev => prev + 1);
  }, [colors]);

  // --- Mapping from Icon ID to Target Mesh ID it controls ---
  const iconToTargetMap: Record<string, string> = {
    "tool_2_item_1": "tool_2_item_4", // Hair Icon -> Hair Mesh
    "tool_2_item_2": "tool_2_item_2", // Beard Icon -> Beard Mesh
    "tool_2_item_3": "tool_2_item_3", // Shirt Main Icon (Now Cuffs) -> Cuffs Mesh
    "tool_2_item_4": "tool_2_item_5", // Shirt Cuffs Icon (Now Main) -> Main Shirt Mesh
    "tool_2_item_5": "tool_2_item_1"  // Pants Icon -> Pants Mesh
    // Add mappings for other colorizable icons if needed
  };
  // --------------------------------------------------------

  // Filter to only the 5 required color items if on mobile
  const itemsToShow = isMobile 
    ? tool.items.filter(item => 
        item.id === 'tool_2_item_1' ||
        item.id === 'tool_2_item_2' ||
        item.id === 'tool_2_item_3' ||
        item.id === 'tool_2_item_4' ||
        item.id === 'tool_2_item_5'
      )
    : tool.items;

  const hasColorPalette = tool.id === "tool_2";

  // Handle color item click - now just toggles the picker visibility on mobile
  const handleColorItemClick = (item: ToolItem) => {
    // Dispatch custom event for item changes
    window.dispatchEvent(new CustomEvent('mp:itemChange'));
    
    onClickItem(item as ToolItem);
    
    if (hasColorPalette) {
      setActiveColorItem(item.id);
      setIsColorPaletteShow(true); // Always show picker on click
    }
  };

  const isPickerVisible = hasColorPalette && isColorPaletteShow && activeColorItem;

  const handleColorChange = (color: string) => {
    // Dispatch custom event for color changes
    window.dispatchEvent(new CustomEvent('mp:colorChange'));
    
    if (activeColorItem) {
      onChangeColor({
        subToolId: activeColorItem,
        color,
      });
    }
  };
  
  const handleClosePicker = () => {
      // Force a final color update before closing to ensure the current color is applied
      if (activeColorItem) {
          // Find the target mesh ID using the icon-to-target mapping
          const targetSubToolId = iconToTargetMap[activeColorItem] || activeColorItem;
          
          // Get the color for the target mesh
          const currentColor = colors.find(c => c.subToolId === targetSubToolId)?.color;
          
          if (currentColor) {
              // Trigger one final color update to ensure UI refreshes
              onChangeColor({
                  subToolId: activeColorItem,
                  color: currentColor,
              });
              
              // Force immediate re-render of icons
              setColorUpdateCounter(prev => prev + 1);
          }
      }
      
      setIsColorPaletteShow(false);
      setActiveColorItem(null);
  }

  // Render Desktop Grid or Mobile Row
  const renderIcons = () => {
    return itemsToShow.map((item, index) => {
      const isActive = subToolId === item.id;
      const Icon = item.icon;
      
      // --- Determine color based on the TARGET mesh ID --- 
      const targetSubToolId = iconToTargetMap[item.id] || item.id; // Find target ID from map, fallback to item.id if not mapped
      const displayColor = colors.find(c => c.subToolId === targetSubToolId)?.color || "#94A3B8"; // Use target ID for lookup
      
      // Use colorUpdateCounter to ensure we have the most recent colors (not used directly but forces re-render)
      const refresh = colorUpdateCounter;
      

      return (
        <button
          key={`${item.id}-${displayColor}`} // Add color to key to force re-render when color changes
          ref={(ref) => { refItems.current[index] = ref; }}
          className={classNames(
            "flex items-center justify-center rounded-md border transition-all hover:scale-105", // Smaller radius
            isMobile ? "w-11 h-11 p-0.5" : "w-16 h-16 aspect-square", // Even smaller mobile size
            {
              "border-primary shadow-md": isActive,
              "bg-white": isActive && theme === "light",
              "bg-[#343741]": isActive && theme === "dark",
              "border-neutral-30": !isActive && theme === "light",
              "border-neutral-80": !isActive && theme === "dark",
            }
          )}
          type="button"
          onClick={() => handleColorItemClick(item)}
          onMouseEnter={!isMobile ? () => {
            if (hasColorPalette && isActive) {
              setActiveColorItem(item.id);
              setIsColorPaletteShow(true);
            }
          } : undefined}
        >
          <Icon 
            className={isMobile ? "w-full h-full p-0.5" : "w-10 h-10"} // Added padding inside icon
            fill={isActive ? "#4B50EC" : displayColor} 
          />
        </button>
      );
    });
  };

  return (
    <div className={classNames("flex flex-col items-center", { "w-full": isMobile })}> 
      {/* Main Icon Container */} 
      <div
        className={classNames("rounded-xl shadow-lg", {
          "bg-neutral-10 p-2": theme === "light" && !isMobile, // Desktop padding & bg
          "bg-[#2A2B2F] p-2": theme === "dark" && !isMobile, // Desktop padding & bg
          "bg-transparent p-0": isMobile, // No background/padding for mobile wrapper
        })}
      >
        {isMobile ? (
          // Mobile: Horizontal row - ensure it fits screen width
          <div className="flex items-center justify-center gap-1.5 bg-[#2A2B2F] p-1.5 rounded-lg w-full max-w-[90vw]">
            {renderIcons()}
          </div>
        ) : (
          // Desktop: Horizontal row like mobile
          <AnimatePresence>
            {isSubToolbarOpen && (
              <motion.div
                ref={refScroll}
                className={classNames(
                  "flex items-center justify-center gap-2 p-2 bg-[#2A2B2F] rounded-lg", // Horizontal flex layout
                  {
                    "scroll-light": theme === "light",
                    "scroll-dark": theme === "dark",
                  }
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderIcons()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Color Picker Modal (Mobile and Desktop) */}
      <AnimatePresence>
        {isPickerVisible && (
          <motion.div
            className={classNames("fixed z-[1003]", {
              // Desktop color picker - position above icons like mobile
              "bottom-[20vh] left-[50%] transform -translate-x-1/2": !isMobile,
              // Mobile modal position
              "bottom-[15vh] left-[25%] transform -translate-x-1/2": isMobile 
            })}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div 
              className={classNames("p-4 rounded-xl shadow-xl border", { 
                "bg-white border-gray-200": theme === "light",
                "bg-[#2A2B2F] border-gray-700": theme === "dark",
                "w-[180px]": true // Same width for both mobile and desktop
              })}
            >
              {/* Close Button (Top Right) */}
              <button 
                  className={classNames("absolute top-2 right-2 p-1 rounded-full text-xl leading-none", {
                      "text-gray-500 hover:text-gray-800 hover:bg-gray-200": theme === "light",
                      "text-gray-400 hover:text-white hover:bg-gray-600": theme === "dark"
                  })}
                  onClick={handleClosePicker}
              >
                  ✕
              </button>

              {/* Picker Content */}
              <div className="flex items-center justify-between mb-3 mt-1"> {/* Adjusted margins */}
                <h3 className={classNames("font-medium text-sm", { // Smaller title for smaller picker
                  "text-neutral-80": theme === "light",
                  "text-neutral-10": theme === "dark",
                })}>
                  Select Color
                </h3>
              </div>
              
              <div className="relative z-20 flex flex-col items-center"> {/* Center content */}
                <HexColorPicker
                  style={{ width: '100%', height: '120px' }} // 50% shorter (was 160px)
                  color={colors.find(c => c.subToolId === activeColorItem)?.color || "#4B50EC"}
                  onChange={handleColorChange}
                />
                <div className="flex items-center justify-between w-full px-1 pt-3"> {/* Increased top padding */}
                  <p
                    className={classNames("text-sm font-medium", { // Slightly larger text
                      "text-neutral-80": theme === "light",
                      "text-neutral-10": theme === "dark",
                    })}
                  >
                    Hex
                  </p>
                  <HexColorInput
                    className={classNames("w-24 px-2 py-1 border rounded-md text-center text-sm", { // Slightly larger text/input
                      "border-primary": theme === "light",
                      "border-[#4B50EC] bg-[#3A3B46] text-white": theme === "dark",
                    })}
                    color={colors.find(c => c.subToolId === activeColorItem)?.color || "#4B50EC"}
                    onChange={handleColorChange}
                    prefixed 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay for both mobile and desktop when picker is visible */}
      {isPickerVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 z-[1002]" // More opaque background
          onClick={handleClosePicker}
        />
      )}
    </div>
  );
};

export default SubToolbar;


