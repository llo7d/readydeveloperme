import React from "react";
import { useStore } from "../store/store";
import classNames from "classnames";

import IconCamera from "../assets/images/IconCamera";

type Mode = "front" | "side" | "close_up";

type Props = {
  mode: Mode;
  onClickMode: (mode: Mode) => void;
};

const ViewMode: React.FC<Props> = ({ mode, onClickMode }) => {
  const theme = useStore((state) => state.theme);

  return (
    <div className="flex">
      <div
        className={classNames(
          "w-16 h-44 rounded-[1.125rem] p-2 flex flex-col items-center justify-between mr-5",
          {
            "bg-neutral-10": theme === "light",
            "bg-[#2A2B2F]": theme === "dark",
          }
        )}
      >
        <button
          className={classNames(
            "w-12 h-12 flex items-center justify-center rounded-2xl border",
            {
              "bg-primary": mode === "front",
              "border-primary": mode === "front",
              "border-dashed": mode !== "front",
              "bg-neutral-10": mode !== "front" && theme === "light",
              "border-neutral-30": mode !== "front" && theme === "light",
              "bg-[#2A2B2F]": mode !== "front" && theme === "dark",
              "border-white/20": mode !== "front" && theme === "dark",
            }
          )}
          type="button"
          onClick={() => onClickMode("front")}
        >
          <IconCamera
            className="w-6 h-6"
            fill={mode === "front" ? "white" : "#6D7D93"}
          />
        </button>
        <button
          className={classNames(
            "w-12 h-12 flex items-center justify-center rounded-2xl border",
            {
              "bg-primary": mode === "side",
              "border-primary": mode === "side",
              "border-dashed": mode !== "side",
              "bg-neutral-10": mode !== "side" && theme === "light",
              "border-neutral-30": mode !== "side" && theme === "light",
              "bg-[#2A2B2F]": mode !== "side" && theme === "dark",
              "border-white/20": mode !== "side" && theme === "dark",
            }
          )}
          type="button"
          onClick={() => onClickMode("side")}
        >
          <IconCamera
            className="w-6 h-6"
            fill={mode === "side" ? "white" : "#6D7D93"}
          />
        </button>
        <button
          className={classNames(
            "w-12 h-12 flex items-center justify-center rounded-2xl border",
            {
              "bg-primary": mode === "close_up",
              "border-primary": mode === "close_up",
              "border-dashed": mode !== "close_up",
              "bg-neutral-10": mode !== "close_up" && theme === "light",
              "border-neutral-30": mode !== "close_up" && theme === "light",
              "bg-[#2A2B2F]": mode !== "close_up" && theme === "dark",
              "border-white/20": mode !== "close_up" && theme === "dark",
            }
          )}
          type="button"
          onClick={() => onClickMode("close_up")}
        >
          <IconCamera
            className="w-6 h-6"
            fill={mode === "close_up" ? "white" : "#6D7D93"}
          />
        </button>
      </div>

      <div className="flex flex-col justify-between w-20 py-2">
        <div className="flex items-center h-12">
          <p
            className={classNames("text-sm", {
              "font-medium": mode === "front",
              "text-white": mode === "front" && theme === "dark",
              "text-[#121F3E]": mode === "front" && theme === "light",
              "text-[#8D98AF]": mode !== "front",
            })}
          >
            Front
          </p>
        </div>
        <div className="flex items-center h-12">
          <p
            className={classNames("text-sm", {
              "font-medium": mode === "side",
              "text-white": mode === "side" && theme === "dark",
              "text-[#121F3E]": mode === "side" && theme === "light",
              "text-[#8D98AF]": mode !== "side",
            })}
          >
            Side
          </p>
        </div>
        <div className="flex items-center h-12">
          <p
            className={classNames("text-sm", {
              "font-medium": mode === "close_up",
              "text-white": mode === "close_up" && theme === "dark",
              "text-[#121F3E]": mode === "close_up" && theme === "light",
              "text-[#8D98AF]": mode !== "close_up",
            })}
          >
            Close Up
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewMode;
