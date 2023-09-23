import React, { SVGProps } from "react";
import { useStore } from "../store/store";
import classNames from "classnames";

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
  toolId: string;
  items: Tool[];
  onClickItem: (tool: Tool) => void;
};

const Toolbar: React.FC<Props> = ({ toolId, items, onClickItem }) => {
  const theme = useStore((state) => state.theme);

  return (
    <div className="h-14 flex items-center gap-x-4">
      {items.map((tool) => {
        const isActive = toolId === tool.id;
        const Icon = tool.icon;

        return (
          <div key={tool.id} className="flex flex-col items-center relative">
            {isActive && (
              <p
                className={classNames(
                  "text-sm font-medium mb-3 text-center absolute -top-8 left-0 w-full",
                  {
                    "text-[#121F3E]": theme === "light",
                    "text-white": theme === "dark",
                  }
                )}
              >
                {tool.label}
              </p>
            )}
            <button
              className={classNames(
                "w-14 h-14 flex items-center justify-center rounded-2xl border",
                {
                  "border-primary": isActive,
                  "bg-white": isActive,
                  "border-neutral-30": !isActive && theme === "light",
                  "border-neutral-80": !isActive && theme === "dark",
                }
              )}
              type="button"
              onClick={() => onClickItem(tool)}
            >
              <Icon
                className="w-8 h-8"
                fill={isActive ? "#4B50EC" : "#6D7D93"}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toolbar;
