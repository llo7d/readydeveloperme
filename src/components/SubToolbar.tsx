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
  setViewMode: (viewMode: string) => void;
};

const SubToolbar: React.FC<Props> = ({
  subToolId,
  tool,
  colors,
  onClickItem,
  onHoverTool,
  onChangeColor,
  setViewMode,
}) => {
  // Change to "true" if you want "always reveal" version of the toolbar.
  const [isSubToolbarOpen, setIsSubToolbarOpen] = useState(false);
  const [isColorPaletteShow, setIsColorPaletteShow] = useState(false);
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

  const activeItemRect = (() => {
    const index = tool.items.findIndex((item) => item.id === subToolId);
    const rect = refItems.current[index]?.getBoundingClientRect();

    return rect;
  })();

  const { colorPaletteStyles, colorPaletteArrowStyles } = (() => {
    const itemTop = activeItemRect?.top || 0;
    const itemBottom = activeItemRect?.bottom || 0;
    const itemHeight = 64;

    const scrollRect = refScroll.current?.getBoundingClientRect();

    if (!scrollRect) {
      return {
        colorPaletteStyles: {
          top: itemTop,
        },
        colorPaletteArrowStyles: {
          top: itemTop + itemHeight / 2,
        },
      };
    }

    const min = scrollRect.top;
    const max = scrollRect.bottom;



    if (itemTop - 72 <= min) {
      return {
        colorPaletteStyles: {
          top: min,
        },
        colorPaletteArrowStyles: {
          top: itemTop + itemHeight / 2,
        },
      };
    }

    if (itemBottom + 72 >= max) {
      return {
        colorPaletteStyles: {
          top: max,
          transform: "translateY(-100%)",
        },
        colorPaletteArrowStyles: {
          top: itemTop + itemHeight / 2,
        },
      };
    }

    return {
      colorPaletteStyles: {
        top: itemTop + itemHeight / 2,
        transform: "translateY(-50%)",
      },
      colorPaletteArrowStyles: {
        top: itemTop + itemHeight / 2,
      },
    };
  })();

  // Moving camera section. 
  // Maybe making custom camera positions for each tool would be good?
  const prevToolId = useRef(tool.id)
  useEffect(() => {

    // I think this is somehow wrong but, it works for now. Jobs finished.
    if (tool.id === "pose") {
      if (prevToolId.current === "tool_2" || prevToolId.current === "pose" || prevToolId.current === "lights") {
        return;
      }
      setViewMode("front");
    }
    if (tool.id === "tool_2") {
      if (prevToolId.current === "tool_2" || prevToolId.current === "pose" || prevToolId.current === "lights") {
        return;
      }
      else setViewMode("front");
    }
    if (tool.id === "hair") {
      if (prevToolId.current === "hair" || prevToolId.current === "beard" || prevToolId.current === "face" || prevToolId.current === "glasses" || prevToolId.current === "hats") {
        return;
      }
      setViewMode("close_up");
    }
    if (tool.id === "beard") {
      if (prevToolId.current === "hair" || prevToolId.current === "beard" || prevToolId.current === "face" || prevToolId.current === "glasses" || prevToolId.current === "hats") {
        return;
      }
      setViewMode("close_up");
    }
    if (tool.id === "face") {
      if (prevToolId.current === "hair" || prevToolId.current === "beard" || prevToolId.current === "face" || prevToolId.current === "glasses" || prevToolId.current === "hats") {
        return;
      }
      setViewMode("close_up");
    }
    if (tool.id === "glasses") {
      if (prevToolId.current === "hair" || prevToolId.current === "beard" || prevToolId.current === "face" || prevToolId.current === "glasses" || prevToolId.current === "hats") {
        return;
      }
      setViewMode("close_up");
    }
    if (tool.id === "lights") {
      if (prevToolId.current === "tool_2" || prevToolId.current === "pose" || prevToolId.current === "lights") {
        return;
      }
      else setViewMode("front");
    }
    if (tool.id === "logo") {
      setViewMode("logo");
    }
    if (tool.id === "hats") {
      if (prevToolId.current === "hair" || prevToolId.current === "beard" || prevToolId.current === "face" || prevToolId.current === "glasses" || prevToolId.current === "hats") {
        return;
      }
      setViewMode("close_up");
    }
    prevToolId.current = tool.id


  }, [tool.id, setViewMode]);


  return (
    <div
      className={classNames("w-20 py-2 rounded-[1.125rem]", {
        "bg-neutral-10": theme === "light",
        "bg-[#2A2B2F]": theme === "dark",
      })}
      // Comment onMouseEnter and onMouseLeave line of code below
      // if you want "always reveal" version of the toolbar.
      onMouseEnter={() => setIsSubToolbarOpen(true)}
      onMouseLeave={() => setIsSubToolbarOpen(false)}
    >
      <AnimatePresence>
        {isSubToolbarOpen && (
          <motion.div
            ref={refScroll}
            className={classNames(
              "flex flex-col items-center gap-y-2 max-h-[35.5rem] overflow-y-auto",
              {
                "scroll-light": theme === "light",
                "scroll-dark": theme === "dark",
              }
            )}
            initial={{ height: 0 }}
            animate={{ height: `${trayHeight}rem` }}
            exit={{ height: 0 }}
            onScroll={() => {
              setIsColorPaletteShow(false);
            }}
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
                <div key={item.id} className="w-16 h-16">
                  {isLogoUpload && (
                    <div
                      className={classNames("w-full border-b mb-3 mt-1", {
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
                      "w-16 h-16 flex items-center justify-center rounded-2xl border flex-shrink-0",
                      {
                        "border-primary": isActive,
                        "bg-white": isActive,
                        "border-neutral-30": !isActive && theme === "light",
                        "border-neutral-80": !isActive && theme === "dark",
                      }
                    )}
                    type="button"
                    onClick={() => {
                      onClickItem(item);

                      if (hasColorPalette) {
                        setIsColorPaletteShow(true);
                      }
                    }}
                    onMouseEnter={() => {
                      if (hasColorPalette && isActive) {
                        setIsColorPaletteShow(true);
                      }
                    }}
                    onMouseLeave={() => {
                      setIsColorPaletteShow(false);
                    }}
                  >
                    <Icon className="w-10 h-10" fill={color} />
                  </button>

                  {/* Color palette for Tool 2 */}
                  {hasColorPalette && isActive && isColorPaletteShow && (
                    <>
                      <div
                        className={classNames(
                          "w-4 h-4 fixed top-1/2 right-[7.5rem] -translate-y-1/2 rotate-45",
                          {
                            "bg-neutral-10": theme === "light",
                            "bg-[#2A2B2F]": theme === "dark",
                          }
                        )}
                        style={colorPaletteArrowStyles}
                      />
                      <div
                        className="fixed w-60 flex right-[6.5rem]"
                        style={colorPaletteStyles}
                        onMouseEnter={() => setIsColorPaletteShow(true)}
                        onMouseLeave={() => setIsColorPaletteShow(false)}
                      >
                        <div
                          className={classNames("p-2 rounded-2xl relative", {
                            "bg-neutral-10": theme === "light",
                            "bg-[#2A2B2F]": theme === "dark",
                          })}
                        >
                          <div className="relative z-20">
                            <HexColorPicker
                              color={color || "red"}
                              onChange={(color) => {
                                onChangeColor?.({
                                  subToolId: item.id,
                                  color,
                                });
                              }}
                            />
                            <div className="flex items-center justify-between w-full px-2 pt-2">
                              <p
                                className={classNames("text-sm", {
                                  "text-neutral-80": theme === "light",
                                  "text-neutral-10": theme === "dark",
                                })}
                              >
                                Hex
                              </p>
                              <HexColorInput
                                className="w-36 px-3 border border-primary rounded-2xl"
                                color={color}
                                onChange={(color) => {
                                  onChangeColor?.({
                                    subToolId: item.id,
                                    color,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="px-2"
        onMouseEnter={() => onHoverTool?.(true)}
        onMouseLeave={() => onHoverTool?.(false)}
      >
        {isSubToolbarOpen && (
          <div
            className={classNames("border-b my-3 w-full", {
              "border-neutral-30": theme === "light",
              "border-neutral-80": theme === "dark",
            })}
          />
        )}

        <div className="w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-primary/50 bg-primary">
          {ToolIcon && <ToolIcon className="w-10 h-10" fill="white" />}
        </div>
      </div>
    </div>
  );
};

export default SubToolbar;
