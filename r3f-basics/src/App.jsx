/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useState, useRef, useEffect, memo } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Environment, OrbitControls, Html, useProgress, useGLTF, useAnimations, ContactShadows, OrthographicCamera, PerspectiveCamera, Stage, CameraControls, Grid, AccumulativeShadows, RandomizedLight, Shadow, useTexture } from '@react-three/drei'
import { Suspense } from "react";
import { useControls } from 'leva'
import { HexColorPicker } from "react-colorful";

import * as THREE from 'three'


function Box({ color, ...props }) {

  const meshRef = useRef()

  return (
    <>

      <mesh
        {...props}
        ref={meshRef}
      // scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      // onClick={() => setActive(!active)}
      // onPointerOver={() => setHover(true)}
      // onPointerOut={() => setHover(false)}
      >
        <ambientLight intensity={1.1} />
        <directionalLight color="white" position={[0, 5, 0]} intensity={3} />

        <directionalLight color="white" position={[0, 0, 5]} intensity={3} />
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} />

      </mesh>
    </>
  )
}

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

function Shoe(props) {

  const { soleColor, bootColor, moveShoeX } = useControls({ soleColor: 'red', bootColor: 'green', moveShoeX: { value: 0, min: 0, max: 10 } })

  const { nodes, materials } = useGLTF('/shoe2lDraco.gltf')

  return (
    <group {...props} dispose={null} position={[0, moveShoeX, 0]}>
      <mesh material-color={soleColor} geometry={nodes.shoe.geometry} material={materials.laces} />
      <mesh material-color={soleColor} geometry={nodes.shoe_1.geometry} material={materials.mesh} />
      <mesh material-color="green" geometry={nodes.shoe_2.geometry} material={materials.caps} />
      <mesh material-color="green" geometry={nodes.shoe_3.geometry} material={materials.inner} />
      <mesh material-color={bootColor} geometry={nodes.shoe_4.geometry} material={materials.sole} />
      <mesh geometry={nodes.shoe_5.geometry} material={materials.stripes} />
      <mesh geometry={nodes.shoe_6.geometry} material={materials.band} />
      <mesh geometry={nodes.shoe_7.geometry} material={materials.patch} />
    </group>
  )
}


// function Fox(props) {


//   console.log("props in Fox", props.animation)

//   // Run,Survey, Walk
//   const group = useRef();
//   const { nodes, materials, animations } = useGLTF("/Fox-processed.gltf");

//   const { actions, mixer, ref } = useAnimations(animations, group);

//   // // Reset and fade in animation after an index has been changed
//   // useEffect(() => {

//   //   mixer.stopAllAction();

//   //   actions[props.animation].fadeIn(0.5);
//   //   actions[props.animation].play();
//   // }, [props.animation]);

//   // // Change animation when the index changes
//   // useEffect(() => {
//   //   // Reset and fade in animation after an index has been changed
//   //   actions[props.animation].reset().fadeIn(0.5).play()
//   //   // In the clean-up phase, fade it out
//   //   return () => actions[props.animation].fadeOut(0.5)
//   // }, [props.animation])

//   // // Change animation when the index changes
//   // useEffect(() => {
//   //   // Reset and fade in animation after an index has been changed
//   //   actions[props.animation].reset().fadeIn(0.5).play()
//   //   // In the clean-up phase, fade it out
//   //   return () => actions[props.animation].fadeOut(0.5)
//   // }, [props.animation, actions])

//   useEffect(() => {
//     // Reset and fade in animation after an index has been changed
//     console.log(actions);

//     actions["Walk"].play()

//     // Stop animation at frame 1 in 1 second
//     setTimeout(() => {
//       actions["Walk"].paused = true;
//     }, 1000)


//   }, [])

//   return (
//     <>
//       <group ref={group} {...props} dispose={null} position={[0, 0, 0]} scale={[0.02, 0.02, 0.02]}>
//         <group>
//           <group name="root">
//             <skinnedMesh
//               name="fox"
//               geometry={nodes.fox.geometry}
//               material={materials.fox_material}
//               skeleton={nodes.fox.skeleton}
//             // material-color="red"
//             // onClick={(e) => actions[props.animation].play()}
//             />
//             <primitive object={nodes._rootJoint} />
//           </group>
//         </group>
//       </group>
//     </>
//   );
// }

function changeLogo() {

}


function Developer2(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/dev3.glb");
  const { actions, mixer, ref } = useAnimations(animations, group);



  useEffect(() => {
    // Reset and fade in animation after an index has been changed
    console.log(actions);

    // actions["DP-Character_Pointing Down"].play()

  }, [])

  console.log("props in Developer2", props)

  const logo = materials.logo.map = useTexture(props.logo)

  // Load logo texture
  // const logo = materials.logo.map = useLoader(
  //   THREE.TextureLoader,
  //   props.logo
  // );

  logo.flipY = false;


  const hair = props.hair;
  const hairColor = props.hairColor;

  const Character_Rig = () => {
    return (
      <>
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
      </>
    )
  }


  const Eyebrows = () => {
    return (
      <>
        <skinnedMesh
          name="Brows"
          geometry={nodes.Brows.geometry}
          material={materials.MAT_Brows}
          skeleton={nodes.Brows.skeleton}
          morphTargetDictionary={nodes.Brows.morphTargetDictionary}
          morphTargetInfluences={nodes.Brows.morphTargetInfluences}
          material-color="#262626"
        />
      </>
    )
  }

  const Hair = () => {

    console.log("props in Hair", props);
    // Based on props name return only the hair that matches the name
    const GEO_Hair_01 = <skinnedMesh
      name="GEO_Hair_01"
      geometry={nodes.GEO_Hair_01.geometry}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_01.skeleton}
      // material-metalness={0.3}
      material-color={hairColor}
      visible={true}
    />

    const GEO_Hair_02 = <skinnedMesh
      name="GEO_Hair_02"
      geometry={nodes.GEO_Hair_02.geometry}
      material={materials.MAT_Hair}
      material-color={hairColor}
      skeleton={nodes.GEO_Hair_02.skeleton}
      visible={true}
    />

    const GEO_Hair_03 = <skinnedMesh
      name="GEO_Hair_03"
      geometry={nodes.GEO_Hair_03.geometry}
      material-color={hairColor}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_03.skeleton}
      visible={true}
    />

    const GEO_Hair_04 = <skinnedMesh
      name="GEO_Hair_04"
      geometry={nodes.GEO_Hair_04.geometry}
      material-color={hairColor}
      material={materials.MAT_Hair}
      skeleton={nodes.GEO_Hair_04.skeleton}
      visible={true}
    />

    return (

      <>
        {hair === "none" && <></>}
        {hair === "GEO_Hair_01" && GEO_Hair_01}
        {hair === "GEO_Hair_02" && GEO_Hair_02}
        {hair === "GEO_Hair_03" && GEO_Hair_03}
        {hair === "GEO_Hair_04" && GEO_Hair_04}
      </>
    )
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <Character_Rig />
        <Eyebrows />
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
        <Hair hair={"GEO_Hair_01"} />

        <skinnedMesh
          name="GEO_Beard_01"
          geometry={nodes.GEO_Beard_01.geometry}
          material={materials.MAT_Beard}
          skeleton={nodes.GEO_Beard_01.skeleton}
          visible={true}
        />
        <skinnedMesh
          name="GEO_Beard_02"
          geometry={nodes.GEO_Beard_02.geometry}
          material={materials.MAT_Beard}
          skeleton={nodes.GEO_Beard_02.skeleton}
          visible={false}
        />


        <skinnedMesh
          name="GEO_Beard_03"
          geometry={nodes.GEO_Beard_03.geometry}
          material={materials.MAT_Beard}
          skeleton={nodes.GEO_Beard_03.skeleton}
          visible={false}
        />
        <skinnedMesh
          name="GEO_Beard_04"
          geometry={nodes.GEO_Beard_04.geometry}
          material={materials.MAT_Beard}
          skeleton={nodes.GEO_Beard_04.skeleton}
          visible={false}
        />

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
            material-roughness={1}
            material-metalness={1}
            skeleton={nodes.t_shirt_1.skeleton}
            visible={true}
            position={[0, 0, 0]}
            position-x={0}
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



// useGLTF.preload("/Developer_Depressed.glb");

function Cube(props) {
  const { nodes, materials } = useGLTF("/SqaureGLTF.glb");

  console.log("dict", nodes.Cube.morphTargetDictionary, "influences", nodes.Cube.morphTargetInfluences)


  nodes.Cube.morphTargetInfluences[0] = useControls('Morphing', { morph: 0 })['morph']


  return (
    <group {...props} dispose={null}>
      <mesh
        name="Cube"
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials.Material}
        morphTargetDictionary={nodes.Cube.morphTargetDictionary}
        morphTargetInfluences={nodes.Cube.morphTargetInfluences}
      />
    </group>
  );
}

function Ground() {

  const { cellColor, sectionColor } = useControls('Grid', { cellColor: '#DFAD06', sectionColor: '#C19400' })

  const gridConfig = {
    cellSize: 0, // 0,5
    cellThickness: 0.5,
    cellColor: cellColor,
    sectionSize: 1, // 3
    sectionThickness: 1,
    sectionColor: sectionColor,
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
}

function CameraHelper() {
  const camera = new PerspectiveCamera(60, 1, 1, 3)
  return <group position={[0, 0, 2]}>
    <cameraHelper args={[camera]} />
  </group>
}



function App() {
  // const city = import('@pmndrs/assets/hdri/city.exr')


  const [animation, setAnimation] = useState("Run")
  const [hair, setHair] = useState("GEO_Hair_01")
  const [hairColor, setHairColor] = useState("#262626")
  const cameraControlRef = useRef(null);

  const { cameraPosition } = useControls({ cameraPosition: [0, 0, 5] })
  const { opacity, blur, scale, far } = useControls('Shadows', { opacity: 1, scale: 10, blur: 3, far: 1.1 })


  const [logo, setLogo] = useState("/Logo.png");

  function handleChange(e) {

    console.log(e.target.files[0]);


    // Check if logo is a .jpg, if yes, alert the user "Only .png files are allowed"
    if (e.target.files[0].type !== "image/png") {
      alert("Only .png files are allowed");
      return;
    }

    setLogo(URL.createObjectURL(e.target.files[0]));

    console.log("logo", logo);


  }

  return (

    <>
      <div className='App'>
        <Canvas shadows camera={{ position: [0, -3, 6], fov: 20 }} >
          <Suspense fallback={<Loader />}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            {/* <Shoe /> */}
            {/* <CameraControls enableZoom={false} ref={cameraControlRef} maxZoom={1} minZoom={1} setLookAt={{ positionX: 0, positionY: 10, positionZ: 10 }} /> */}
            <OrbitControls cameraminPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={false} target={new THREE.Vector3(0, 1.2, 0)} position={new THREE.Vector3(1, 2, 5)} position0={new THREE.Vector3(1, 2, 5)} />
            <Ground />
            <Developer2 logo={logo} hair={hair} hairColor={hairColor} />
            {/* <Cube position={[0, 1, 0]} /> */}
            <ContactShadows opacity={opacity} scale={scale} blur={blur} far={far} />
            {/* <Environment files={city.default} /> */}
            {/* <Fox /> */}
          </Suspense>
        </Canvas>
      </div >

      <div id='center3'>
        <HexColorPicker color={hairColor} onChange={setHairColor} />;
      </div>


      <form id='center'>
        <select
          onChange={(event) => setHair(event.target.value)}
          value={hair}>
          <option value="none">None</option>
          <option value="GEO_Hair_01">Hair 1</option>
          <option value="GEO_Hair_02">Hair 2</option>
          <option value="GEO_Hair_03">Hair 3</option>
          <option value="GEO_Hair_04">Hair 4</option>
        </select>
      </form>

      {/* 
      < button
        id='center'
        onClick={() => {
          // Camera looks at the Fox
          cameraControlRef.current.position.set(0, 2, 3);
        }
        }
      >
        Front View
      </button > */}

      {/* < button
        id='center'
        onClick={() => {
          // Camera looks at the Fox
          cameraControlRef.current.position.set(0, 2, 3);
        }
        }
      >
        Front View
      </button > */}

      {/* <button
        id='center2'
        onClick={() => {
          // Camera looks at the Fox
          cameraControlRef.current.position.set(2.5, 1.5, 2.5);
        }}
      >
        Side View
      </button> */}
      <div id="center2">
        <input type="file" onChange={handleChange} accept='.png' />

      </div>



    </>
  )
}


export default App
