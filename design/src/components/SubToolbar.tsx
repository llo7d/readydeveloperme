import React, { SVGProps } from "react";
import classNames from "classnames";

import { useStore } from "../store/store";

type SubTool = {
  id: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
};

type Tool = {
  id: string;
  label: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  items: SubTool[];
};

type Props = {
  subToolId: string;
  tool: Tool;
  onClickItem: (subTool: SubTool) => void;
  onHoverTool: (isEntered: boolean) => void;
};

const SubToolbar: React.FC<Props> = ({
  subToolId,
  tool,
  onClickItem,
  onHoverTool,
}) => {
  const theme = useStore((state) => state.theme);

  const ToolIcon = tool.icon;

  return (
    <div
      className={classNames("w-20 py-2 rounded-[1.125rem]", {
        "bg-neutral-10": theme === "light",
        "bg-[#2A2B2F]": theme === "dark",
      })}
    >
      <div
        className={classNames(
          "flex flex-col items-center gap-y-2 max-h-[35.5rem] overflow-y-auto",
          {
            "scroll-light": theme === "light",
            "scroll-dark": theme === "dark",
          }
        )}
      >
        {tool.items.map((item) => {
          const isActive = subToolId === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
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
              onClick={() => onClickItem(item)}
            >
              <Icon
                className="w-10 h-10"
                fill={isActive ? "#4B50EC" : "#94A3B8"}
              />
            </button>
          );
        })}
      </div>

      <div
        className="px-2"
        onMouseEnter={() => onHoverTool(true)}
        onMouseLeave={() => onHoverTool(false)}
      >
        <div
          className={classNames("border-b my-3 w-full", {
            "border-neutral-30": theme === "light",
            "border-neutral-80": theme === "dark",
          })}
        />

        <div className="w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-primary/50 bg-primary">
          <ToolIcon className="w-10 h-10" fill="white" />
        </div>
      </div>
    </div>
  );
};

export default SubToolbar;
