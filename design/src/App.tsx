import { Suspense, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, useAnimations, Environment, Html, useProgress, CameraControls } from "@react-three/drei";
import * as THREE from 'three'

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
import Camera from "./components/Camera";

type Mode = "front" | "side" | "close_up" | "free";


function Ground() {

  // const { cellColor, sectionColor } = useControls('Grid', { cellColor: '#DFAD06', sectionColor: '#C19400' })

  const gridConfig = {
    cellSize: 0, // 0,5
    cellThickness: 0.5,
    cellColor: '#DFAD06',
    sectionSize: 1, // 3
    sectionThickness: 1,
    sectionColor: '#C19400',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
}




function Loader() {
  const { progress } = useProgress()


  // return <Html center>
  //   {/* H1 in white */}
  //   <h1 className="text-white">

  //     {/* Show only first 2 digits from progress */}
  //     {progress.toFixed(0)}%

  //   </h1>

  // </Html>

  return (
    <Html center >
      {/* // create a h1 in geometry */}
      <h1 className="text-white">
        {/* Show only first 2 digits from progress */}
        {progress.toFixed(0)}%
      </h1>
    </Html>
  )


}

function Character(props) {


  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/dev3.glb");

  const { actions } = useAnimations(animations, group);



  const Hair = () => {

    // props.selected.hair

    const GEO_Hair_01 =
      <skinnedMesh
        name="GEO_Hair_01"
        geometry={nodes.GEO_Hair_01.geometry}
        material={materials.MAT_Hair}
        skeleton={nodes.GEO_Hair_01.skeleton}
        material-color={props.colors[0].color}
      />

    const GEO_Hair_02 = <skinnedMesh
      name="GEO_Hair_02"
      geometry={nodes.GEO_Hair_02.geometry}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_02.skeleton}
      material-color={props.colors[0].color}

    />

    const GEO_Hair_03 = <skinnedMesh
      name="GEO_Hair_03"
      geometry={nodes.GEO_Hair_03.geometry}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_03.skeleton}
      material-color={props.colors[0].color}
    />

    const GEO_Hair_04 = <skinnedMesh
      name="GEO_Hair_04"
      geometry={nodes.GEO_Hair_04.geometry}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_04.skeleton}
      material-color={props.colors[0].color}
    />

    return (
      <>
        {/* Return hair based on snap.selected.hair with a one of code*/}
        {props.selected.hair === "GEO_Hair_01" && GEO_Hair_01}
        {props.selected.hair === "GEO_Hair_02" && GEO_Hair_02}
        {props.selected.hair === "GEO_Hair_03" && GEO_Hair_03}
        {props.selected.hair === "GEO_Hair_04" && GEO_Hair_04}
      </>
    )
  }

  const Beard = () => {
    const GEO_Beard_01 = <skinnedMesh
      name="GEO_Beard_01"
      geometry={nodes.GEO_Beard_01.geometry}
      material={materials.MAT_Beard}
      skeleton={nodes.GEO_Beard_01.skeleton}
      material-color={props.colors[1].color}
    />

    const GEO_Beard_02 =
      <skinnedMesh
        name="GEO_Beard_02"
        geometry={nodes.GEO_Beard_02.geometry}
        material={materials.MAT_Beard}
        skeleton={nodes.GEO_Beard_02.skeleton}
        material-color={props.colors[1].color}
      />

    const GEO_Beard_03 = <skinnedMesh
      name="GEO_Beard_03"
      geometry={nodes.GEO_Beard_03.geometry}
      material={materials.MAT_Beard}
      skeleton={nodes.GEO_Beard_03.skeleton}
      material-color={props.colors[1].color}
    />

    const GEO_Beard_04 = <skinnedMesh
      name="GEO_Beard_04"
      geometry={nodes.GEO_Beard_04.geometry}
      material={materials.MAT_Beard}
      skeleton={nodes.GEO_Beard_04.skeleton}
      material-color={props.colors[1].color}
    />


    return (
      <>

        {/* Return hair based on snap.selected.hair with a one of code*/}
        {props.selected.beard === "GEO_Beard_01" && GEO_Beard_01}
        {props.selected.beard === "GEO_Beard_02" && GEO_Beard_02}
        {props.selected.beard === "GEO_Beard_03" && GEO_Beard_03}
        {props.selected.beard === "GEO_Beard_04" && GEO_Beard_04}
      </>
    )
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="DP-Character_RIG">
          <group name="GEO_Body">
            <skinnedMesh
              name="body"
              geometry={nodes.body.geometry}
              material={materials.MAT_Skin}
              skeleton={nodes.body.skeleton}
              morphTargetDictionary={nodes.body.morphTargetDictionary}
              morphTargetInfluences={nodes.body.morphTargetInfluences}
            />
            <skinnedMesh
              name="body_1"
              geometry={nodes.body_1.geometry}
              material={materials.MAT_Teeth}
              skeleton={nodes.body_1.skeleton}
              morphTargetDictionary={nodes.body_1.morphTargetDictionary}
              morphTargetInfluences={nodes.body_1.morphTargetInfluences}
            />
            <skinnedMesh
              name="body_2"
              geometry={nodes.body_2.geometry}
              material={materials.MAT_Eyes}
              skeleton={nodes.body_2.skeleton}
              morphTargetDictionary={nodes.body_2.morphTargetDictionary}
              morphTargetInfluences={nodes.body_2.morphTargetInfluences}
            />
          </group>
          <primitive object={nodes.desktop_bone} />
          <primitive object={nodes["DEF-pelvisL"]} />
          <primitive object={nodes["DEF-pelvisR"]} />
          <primitive object={nodes["DEF-thighL"]} />
          <primitive object={nodes["DEF-thighR"]} />
          <primitive object={nodes["DEF-shoulderL"]} />
          <primitive object={nodes["DEF-upper_armL"]} />
          <primitive object={nodes["DEF-shoulderR"]} />
          <primitive object={nodes["DEF-upper_armR"]} />
          <primitive object={nodes["DEF-breastL"]} />
          <primitive object={nodes["DEF-breastR"]} />
          <primitive object={nodes["DEF-spine"]} />
        </group>

        <Hair />
        <Beard />
        <skinnedMesh
          name="Brows"
          geometry={nodes.Brows.geometry}
          material={materials.MAT_Brows}
          skeleton={nodes.Brows.skeleton}
          morphTargetDictionary={nodes.Brows.morphTargetDictionary}
          morphTargetInfluences={nodes.Brows.morphTargetInfluences}
        />
        <group name="GEO_CC_Shoes">
          <skinnedMesh
            name="main_clothes002"
            geometry={nodes.main_clothes002.geometry}
            material={materials.shoes_main_sole}
            skeleton={nodes.main_clothes002.skeleton}
          />
          <skinnedMesh
            name="main_clothes002_1"
            geometry={nodes.main_clothes002_1.geometry}
            material={materials.shoes_main_2}
            skeleton={nodes.main_clothes002_1.skeleton}
          />
          <skinnedMesh
            name="main_clothes002_2"
            geometry={nodes.main_clothes002_2.geometry}
            material={materials.shoes_main_1}
            skeleton={nodes.main_clothes002_2.skeleton}
          />
        </group>
        <group name="GEO_Glassess_01">
          <skinnedMesh
            name="Plane003"
            geometry={nodes.Plane003.geometry}
            material={materials.glass_plastic}
            skeleton={nodes.Plane003.skeleton}
          />
          <skinnedMesh
            name="Plane003_1"
            geometry={nodes.Plane003_1.geometry}
            material={materials.glass_transparent}
            skeleton={nodes.Plane003_1.skeleton}
          />
        </group>
        <group name="GEO_Watch">
          <skinnedMesh
            name="body001"
            geometry={nodes.body001.geometry}
            material={materials.MAT_Watch_Belt}
            skeleton={nodes.body001.skeleton}
          />
          <skinnedMesh
            name="body001_1"
            geometry={nodes.body001_1.geometry}
            material={materials.MAT_Watch_Plastic}
            skeleton={nodes.body001_1.skeleton}
          />
          <skinnedMesh
            name="body001_2"
            geometry={nodes.body001_2.geometry}
            material={materials.MAT_Watch_Screen}
            skeleton={nodes.body001_2.skeleton}
          />
        </group>


        <skinnedMesh
          name="tongue_GEO"
          geometry={nodes.tongue_GEO.geometry}
          material={materials.Tongue}
          skeleton={nodes.tongue_GEO.skeleton}
        />
        <mesh
          name="iphone12"
          castShadow
          receiveShadow
          geometry={nodes.iphone12.geometry}
          material={materials.Iphone_Shader}
          position={[-0.143, 1.901, 0.168]}
          rotation={[0.303, -0.423, 1.473]}
          scale={1.744}
        />
        <group name="GEO_CC_Tshirt">
          <skinnedMesh
            name="t_shirt"
            geometry={nodes.t_shirt.geometry}
            material={materials.Shirt_main}
            skeleton={nodes.t_shirt.skeleton}
          />
          <skinnedMesh
            name="t_shirt_1"
            geometry={nodes.t_shirt_1.geometry}
            material={materials.logo}
            skeleton={nodes.t_shirt_1.skeleton}
          />
          <skinnedMesh
            name="t_shirt_2"
            geometry={nodes.t_shirt_2.geometry}
            material={materials.Shirt_main_cuffs}
            skeleton={nodes.t_shirt_2.skeleton}
          />
        </group>
        <group name="GEO_CC_Pants_Baked">
          <skinnedMesh
            name="pants002"
            geometry={nodes.pants002.geometry}
            material={materials.Pants_main}
            skeleton={nodes.pants002.skeleton}
          />
          <skinnedMesh
            name="pants002_1"
            geometry={nodes.pants002_1.geometry}
            material={materials.Pants_belt}
            skeleton={nodes.pants002_1.skeleton}
          />
          <skinnedMesh
            name="pants002_2"
            geometry={nodes.pants002_2.geometry}
            material={materials.Pants_belt_buckle}
            skeleton={nodes.pants002_2.skeleton}
          />
          <skinnedMesh
            name="pants002_3"
            geometry={nodes.pants002_3.geometry}
            material={materials.Pants_bottom}
            skeleton={nodes.pants002_3.skeleton}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/dev3.glb");


export default function App() {
  // Change to "false" if you want hide/reveal version of the toolbar.
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<Mode>("front");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const theme = useStore((state) => state.theme);
  const isDesktop = useMediaQuery({ query: "(min-width: 960px)" });

  const tools = getToolbarData();

  const [tool, setTool] = useState(tools[0]);
  const [subTool, setSubTool] = useState(tools[0].items[0]);

  const [selected, setSelected] = useState({
    hair: "GEO_Hair_01",
    beard: "GEO_Beard_01",
  })

  const [camera, setCamera] = useState({
    position: [0, 3, 6],
    target: new THREE.Vector3(0, 1.2, 0),
  })


  // Tool 2 subtool colors.
  const [subToolColors, setSubToolColors] = useState(
    tools[1].items.map((item) => {
      return {
        subToolId: item.id,
        color: "#4B50EC",
      };
    })
  );

  const trayWidth = 3.5 * tools.length + 1 * (tools.length - 1);

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
      {/* Background image */}
      {/* <img
        className="w-full h-screen object-cover"
        src="/images/background.jpg"
        alt="Mountain"
      /> */}

      <div className="w-full h-screen">
        <Canvas shadows camera={{ position: camera.position, fov: 20 }} >

          <Suspense fallback={<Loader />}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            <Ground />
            <Character colors={subToolColors} selected={selected} />
            <Camera viewMode={viewMode} setViewMode={setViewMode} />

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
          setSelected={setSelected}
          subToolId={subTool.id}
          tool={tool}
          colors={subToolColors}
          onClickItem={setSubTool}
          setCamera={setCamera}
          // Uncomment below if you want hide/reveal version of the toolbar.
          // onHoverTool={setIsToolbarOpen}
          onChangeColor={(subToolColor) => {
            const newSubToolColors = subToolColors.map((color) => {
              if (color.subToolId === subTool.id) {
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
                onClickItem={(tool) => {
                  setTool(tool);
                  setSubTool(tool.items[0]);
                }}
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

