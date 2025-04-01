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
  onChangeColor: (color: any) => void;
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
      setIsColorPaletteShow(false);
      setActiveColorItem(null);
  }

  // Render Desktop Grid or Mobile Row
  const renderIcons = () => {
    return itemsToShow.map((item, index) => {
      const isActive = subToolId === item.id;
      const Icon = item.icon;
      const color = colors.find(c => c.subToolId === item.id)?.color || "#94A3B8";

      return (
        <button
          key={item.id}
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
            fill={isActive ? "#4B50EC" : color} 
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
          // Desktop: Grid layout
          <AnimatePresence>
            {isSubToolbarOpen && (
              <motion.div
                ref={refScroll}
                className={classNames(
                  "grid grid-cols-3 gap-2 max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hidden", // Keep 3 columns for desktop
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
              // Desktop side panel position
              "top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-[calc(50%+15rem)]": !isMobile,
              // Mobile modal: Position above the icons at bottom but left aligned
              "bottom-[15vh] left-[15%] transform -translate-x-1/2": isMobile 
            })}
            initial={isMobile ? { y: 20, opacity: 0 } : { scale: 0.8, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: 20, opacity: 0 } : { scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div 
              className={classNames("p-4 rounded-xl shadow-xl border", { 
                "bg-white border-gray-200": theme === "light",
                "bg-[#2A2B2F] border-gray-700": theme === "dark",
                "w-[190px]": isMobile // 50% wider than previous 120px
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

      {/* Background overlay for MODAL (Mobile only now) */}
      {isMobile && isPickerVisible && (
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


