import React, { SVGProps, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";

import { useStore } from "../store/store";

type SubTool = {
  id: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  name?: string;
};

type Tool = {
  id: string;
  label: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  items: SubTool[];
};

type SubToolColor = {
  subToolId: string;
  color: string;
};

type Props = {
  subToolId: string;
  tool: Tool;
  colors: SubToolColor[];
  onClickItem: (subTool: SubTool) => void;
  onHoverTool?: (isEntered: boolean) => void;
  onChangeColor?: (color: SubToolColor) => void;
};

const SubToolbar: React.FC<Props> = ({
  subToolId,
  tool,
  colors,
  onClickItem,
  onHoverTool,
  onChangeColor,
}) => {
  const [isSubToolbarOpen, setIsSubToolbarOpen] = useState(true);
  const [isColorPaletteShow, setIsColorPaletteShow] = useState(false);
  const [activeColorItem, setActiveColorItem] = useState<string | null>(null);
  const theme = useStore((state) => state.theme);
  const refScroll = useRef<HTMLDivElement>(null);
  const refItems = useRef<(HTMLButtonElement | null)[]>([]);

  const ToolIcon = tool.items.find(item => item.id === subToolId)?.icon;
  const hasColorPalette = tool.id === "tool_2";

  const trayHeight = (() => {
    const height = 4 * tool.items.length + 0.5 * (tool.items.length - 1)

    if (tool.id === 'logo') {
      return height + 1 + (1 / 16)
    }

    return height
  })();

  // Moving camera section. 
  // Maybe making custom camera positions for each tool would be good?
  const prevToolId = useRef(tool.id)
  useEffect(() => {
    // Store the current tool id for reference
    prevToolId.current = tool.id
  }, [tool.id]);

  // Handle color item click
  const handleColorItemClick = (item: SubTool) => {
    onClickItem(item);
    if (hasColorPalette) {
      setActiveColorItem(item.id);
      setIsColorPaletteShow(true);
    }
  };

  // Center color picker positioning
  const isCenterColorPickerVisible = hasColorPalette && isColorPaletteShow && activeColorItem;

  return (
    <div className="flex flex-col items-center">
      {/* Main color tools panel */}
      <div
        className={classNames("rounded-xl shadow-lg p-4 mb-4", {
          "bg-neutral-10": theme === "light",
          "bg-[#2A2B2F]": theme === "dark",
        })}
      >
        <AnimatePresence>
          {isSubToolbarOpen && (
            <motion.div
              ref={refScroll}
              className={classNames(
                "grid grid-cols-3 gap-3 max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hidden", 
                {
                  "scroll-light": theme === "light",
                  "scroll-dark": theme === "dark",
                }
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {tool.items.map((item, index) => {
                const isLogoUpload = item.id === "logo_upload";
                const isActive = subToolId === item.id;
                const Icon = item.icon;

                const color = (() => {
                  const customColor = colors.find(
                    (color) => color.subToolId === item.id
                  )?.color;

                  if (hasColorPalette) {
                    return customColor;
                  }

                  return isActive ? "#4B50EC" : "#94A3B8";
                })();

                return (
                  <div key={item.id} className={classNames("flex flex-col items-center")}>
                    {isLogoUpload && (
                      <div
                        className={classNames("w-full border-b mb-2", {
                          "border-neutral-30": theme === "light",
                          "border-neutral-80": theme === "dark",
                        })}
                      />
                    )}

                    <button
                      key={item.id}
                      ref={(ref) => {
                        refItems.current[index] = ref;
                      }}
                      className={classNames(
                        "w-20 h-20 flex items-center justify-center rounded-xl border transition-all hover:scale-105", 
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
                      onMouseEnter={() => {
                        if (hasColorPalette && isActive) {
                          setActiveColorItem(item.id);
                          setIsColorPaletteShow(true);
                        }
                      }}
                    >
                      <Icon className="w-12 h-12" fill={color} />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered color picker - moved to the side but centered vertically */}
      <AnimatePresence>
        {isCenterColorPickerVisible && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-[calc(50%+20.5rem)] z-50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div 
              className={classNames("p-5 rounded-xl shadow-xl", {
                "bg-white": theme === "light",
                "bg-[#2A2B2F]": theme === "dark",
              })}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={classNames("font-medium", {
                  "text-neutral-80": theme === "light",
                  "text-neutral-10": theme === "dark",
                })}>
                  Select Color
                </h3>
                <button 
                  className={classNames("p-1 rounded-full hover:bg-opacity-10 hover:bg-black", {
                    "text-neutral-80": theme === "light",
                    "text-neutral-10": theme === "dark",
                  })}
                  onClick={() => setIsColorPaletteShow(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="relative z-20">
                <HexColorPicker
                  color={colors.find(c => c.subToolId === activeColorItem)?.color || "#4B50EC"}
                  onChange={(color) => {
                    if (activeColorItem) {
                      onChangeColor?.({
                        subToolId: activeColorItem,
                        color,
                      });
                    }
                  }}
                />
                <div className="flex items-center justify-between w-full px-2 pt-4">
                  <p
                    className={classNames("text-sm font-medium", {
                      "text-neutral-80": theme === "light",
                      "text-neutral-10": theme === "dark",
                    })}
                  >
                    Hex
                  </p>
                  <HexColorInput
                    className={classNames("w-36 px-3 py-2 border rounded-lg text-center", {
                      "border-primary": theme === "light",
                      "border-[#4B50EC] bg-[#3A3B46] text-white": theme === "dark",
                    })}
                    color={colors.find(c => c.subToolId === activeColorItem)?.color || "#4B50EC"}
                    onChange={(color) => {
                      if (activeColorItem) {
                        onChangeColor?.({
                          subToolId: activeColorItem,
                          color,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay for color picker */}
      {isCenterColorPickerVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsColorPaletteShow(false)}
        />
      )}
    </div>
  );
};

export default SubToolbar;
