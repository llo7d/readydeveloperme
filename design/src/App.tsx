import { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, useAnimations, Environment, Html, useProgress, CameraControls, ContactShadows } from "@react-three/drei";
import * as THREE from 'three'

import ThemeToggle from "./components/ThemeToggle";
import ViewMode from "./components/ViewMode";
import { useStore } from "./store/store";
import classNames from "classnames";
import Logo from "./assets/icons/Logo";
import Toolbar from "./components/Toolbar";
import { getToolbarData } from "./helpers/data";
import SubToolbar from "./components/SubToolbar";
import IconMenu from "./assets/icons/IconMenu";
import ManualPopup from "./components/ManualPopup";
import Camera from "./components/Camera";
import Character from "./components/Character";
import Loader from "./components/Loader";
import Ground from "./components/Ground";
import { useControls } from "leva";

type Mode = "front" | "side" | "close_up" | "free";



export default function App() {
  // Change to "false" if you want hide/reveal version of the toolbar.
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<Mode>("front");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const theme = useStore((state) => state.theme);
  const isDesktop = useMediaQuery({ query: "(min-width: 960px)" });

  const tools = getToolbarData();

  const [tool, setTool] = useState(tools[0]);

  const { opacity, blur, scale, far } = useControls('Shadows', { opacity: 0.7, scale: 2, blur: 3.5, far: 1.2 })

  // It has this format (you can see data.ts):
  // tool.id: tool.items.id
  const [selected, setSelected] = useState<Record<string, string>>({})

  // Tool 2 subtool colors.
  const [subToolColors, setSubToolColors] = useState(
    tools[1].items.map((item) => {
      return {
        subToolId: item.id,
        color: "#141414",
      };
    })
  );

  const trayWidth = 3.5 * tools.length + 1 * (tools.length - 1);

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

      newSelected[tool.id] = tool.items[0].id
    }

    setSelected(newSelected)
  }, [])



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
      <Loader />

      <div className="w-full h-screen">
        {/* <Canvas shadows camera={{ position: camera.position, fov: 20 }} > */}
        <Canvas shadows camera={{ fov: 20 }} >


          <Suspense fallback={null}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            <Ground theme={theme} />
            <Character colors={subToolColors} selected={selected} />
            <Camera viewMode={viewMode} setViewMode={setViewMode} />
            <ContactShadows opacity={opacity} scale={scale} blur={blur} far={far} />

          </Suspense>
        </Canvas>
      </div>

      <div className="absolute top-8 left-8">
        <Logo className="w-44" fill={theme === "light" ? "#121F3E" : "white"} />
      </div>

      <div className="flex items-center absolute top-8 right-8">
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
      </div>

      <div className="absolute top-1/2 left-8 -translate-y-1/2">
        <ViewMode mode={viewMode} onClickMode={setViewMode} />
      </div>

      {/* Illustration */}
      {/* <img
        className="w-[45rem] h-[40rem] object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        src="/images/illustration.svg"
      /> */}

      <div className="flex items-center mr-auto absolute bottom-8 left-8">
        <ThemeToggle />
        <p className="text-[#8D98AF] text-xs font-medium ml-5">
          © 2023, by llo7d
        </p>
      </div>

      <div className="absolute bottom-8 right-8">
        <SubToolbar
          subToolId={selected[tool.id]}
          tool={tool}
          colors={subToolColors}
          onClickItem={(item) => {
            setSelected({
              ...selected,
              [tool.id]: item.id
            })
          }}
          // Uncomment below if you want hide/reveal version of the toolbar.
          // onHoverTool={setIsToolbarOpen}
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
      </div>

      <div
        className="absolute right-32 bottom-10"
      // Uncomment below if you want hide/reveal version of the toolbar.
      // onMouseEnter={() => setIsToolbarOpen(true)}
      // onMouseLeave={() => setIsToolbarOpen(false)}
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
                onClickItem={setTool}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ManualPopup
        isOpen={isManualOpen}
        onClickClose={() => setIsManualOpen(false)}
      />
    </div >
  );
}

