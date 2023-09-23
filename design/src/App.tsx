import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ThemeToggle from "./components/ThemeToggle";
import ViewMode from "./components/ViewMode";
import { useStore } from "./store/store";
import classNames from "classnames";
import Logo from "./assets/images/Logo";
import Toolbar from "./components/Toolbar";
import { getToolbarData } from "./helpers/data";
import SubToolbar from "./components/SubToolbar";
import IconMenu from "./assets/images/IconMenu";
import ManualPopup from "./components/ManualPopup";

type Mode = "front" | "side" | "close_up";

function App() {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<Mode>("front");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const theme = useStore((state) => state.theme);

  const tools = getToolbarData();

  const [tool, setTool] = useState(tools[0]);
  const [subTool, setSubTool] = useState(tools[0].items[0]);

  const trayWidth = 3.5 * tools.length + 1 * (tools.length - 1);

  return (
    <div
      className={classNames("w-full h-screen p-8 flex flex-col", {
        "bg-white": theme === "light",
        "bg-neutral-100": theme === "dark",
      })}
    >
      {/* Header */}
      <header className="flex items-center">
        <Logo className="w-44" fill={theme === "light" ? "#121F3E" : "white"} />
        <button
          className="text-sm text-white font-medium h-11 px-4 bg-primary rounded-full ml-auto"
          type="button"
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
      </header>

      {/* Main Section */}
      <div className="flex-1 flex relative justify-center items-center">
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <ViewMode mode={viewMode} onClickMode={setViewMode} />
        </div>

        <img
          className="w-[45rem] h-[40rem] object-contain"
          src="/images/illustration.svg"
        />
      </div>

      {/* Footer */}
      <footer className="flex items-end">
        <div className="flex items-center mr-auto">
          <ThemeToggle />
          <p className="text-[#8D98AF] text-xs font-medium ml-5">
            © 2023, by llo7d
          </p>
        </div>

        <div className="flex items-center -mt-16 relative">
          <div
            className="absolute right-20 pr-4 bottom-0 mb-3"
            onMouseEnter={() => setIsToolbarOpen(true)}
            onMouseLeave={() => setIsToolbarOpen(false)}
          >
            <AnimatePresence>
              {isToolbarOpen && (
                <motion.div
                  className="overflow-hidden h-24 flex items-end"
                  initial={{ width: 0 }}
                  animate={{ width: `${trayWidth}rem` }}
                  exit={{ width: 0 }}
                >
                  <Toolbar
                    toolId={tool.id}
                    items={tools}
                    onClickItem={(tool) => {
                      setTool(tool);
                      setSubTool(tool.items[0]);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 right-0">
            <SubToolbar
              subToolId={subTool.id}
              tool={tool}
              onClickItem={setSubTool}
              onHoverTool={setIsToolbarOpen}
            />
          </div>
        </div>
      </footer>

      <ManualPopup
        isOpen={isManualOpen}
        onClickClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}

export default App;
