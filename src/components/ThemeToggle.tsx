import React from "react";
import { useStore } from "../store/store";
import classNames from "classnames";

import IconSun from "../assets/icons/IconSun";
import IconMoon from "../assets/icons/IconMoon";

type Props = Record<string, never>;

const ThemeToggle: React.FC<Props> = () => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  return (
    <div
      className={classNames(
        "w-20 h-10 rounded-full p-0.5 flex items-center justify-between",
        {
          "bg-neutral-10": theme === "light",
          "bg-[#2A2B2F]": theme === "dark",
        }
      )}
    >
      <button
        className={classNames(
          "w-9 h-9 flex items-center justify-center rounded-full",
          {
            "bg-white": theme === "light",
            "bg-[#2A2B2F]": theme === "dark",
          }
        )}
        type="button"
        onClick={() => setTheme("light")}
      >
        <IconSun
          className="w-6 h-6"
          fill={theme === "light" ? "#4B50EC" : "#6D7D93"}
        />
      </button>
      <button
        className={classNames(
          "w-9 h-9 flex items-center justify-center bg-white rounded-full",
          {
            "bg-white": theme === "dark",
            "bg-neutral-10": theme === "light",
          }
        )}
        type="button"
        onClick={() => setTheme("dark")}
      >
        <IconMoon
          className="w-6 h-6"
          fill={theme === "dark" ? "#FCC838" : "#6D7D93"}
        />
      </button>
    </div>
  );
};

export default ThemeToggle;
