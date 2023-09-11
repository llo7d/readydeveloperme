/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useState, useRef, useEffect, memo } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Environment, OrbitControls, Html, useProgress, useGLTF, useAnimations, ContactShadows, OrthographicCamera, PerspectiveCamera, Stage, CameraControls, Grid, AccumulativeShadows, RandomizedLight, Shadow } from '@react-three/drei'
import { Suspense } from "react";
import { useControls } from 'leva'
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

export function Shoe(props) {

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


export function Fox(props) {


  console.log("props in Fox", props.animation)

  // Run,Survey, Walk
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/Fox-processed.gltf");

  const { actions, mixer, ref } = useAnimations(animations, group);

  // // Reset and fade in animation after an index has been changed
  // useEffect(() => {

  //   mixer.stopAllAction();

  //   actions[props.animation].fadeIn(0.5);
  //   actions[props.animation].play();
  // }, [props.animation]);

  // // Change animation when the index changes
  // useEffect(() => {
  //   // Reset and fade in animation after an index has been changed
  //   actions[props.animation].reset().fadeIn(0.5).play()
  //   // In the clean-up phase, fade it out
  //   return () => actions[props.animation].fadeOut(0.5)
  // }, [props.animation])

  // Change animation when the index changes
  useEffect(() => {
    // Reset and fade in animation after an index has been changed
    actions[props.animation].reset().fadeIn(0.5).play()
    // In the clean-up phase, fade it out
    return () => actions[props.animation].fadeOut(0.5)
  }, [props.animation, actions])



  return (
    <>
      <group ref={group} {...props} dispose={null} position={[0, 0, 0]} scale={[0.02, 0.02, 0.02]}>
        <group>
          <group name="root">
            <skinnedMesh
              name="fox"
              geometry={nodes.fox.geometry}
              material={materials.fox_material}
              skeleton={nodes.fox.skeleton}
            // material-color="red"
            // onClick={(e) => actions[props.animation].play()}
            />
            <primitive object={nodes._rootJoint} />
          </group>
        </group>
      </group>
    </>
  );
}


function Developer(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/Developer.glb");
  const { actions } = useAnimations(animations, group);


  const logo = materials.logo.map = useLoader(
    THREE.TextureLoader,
    "/Logo.png"
  );


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
            />
            <skinnedMesh
              name="body_1"
              geometry={nodes.body_1.geometry}
              material={materials.MAT_Teeth}
              skeleton={nodes.body_1.skeleton}
            />
            <skinnedMesh
              name="body_2"
              geometry={nodes.body_2.geometry}
              material={materials.MAT_Brows}
              skeleton={nodes.body_2.skeleton}
            />
            <skinnedMesh
              name="body_3"
              geometry={nodes.body_3.geometry}
              material={materials.MAT_Eyes}
              skeleton={nodes.body_3.skeleton}
            />
          </group>
          <group name="GEO_CC_Pants_Baked">
            <skinnedMesh
              name="Mesh_5"
              geometry={nodes.Mesh_5.geometry}
              material={materials.Pants_main}
              material-color="red"
              skeleton={nodes.Mesh_5.skeleton}
            />
            <skinnedMesh
              name="Mesh_6"
              geometry={nodes.Mesh_6.geometry}
              material={materials.Pants_belt}
              skeleton={nodes.Mesh_6.skeleton}
            />
            <skinnedMesh
              name="Mesh_7"
              geometry={nodes.Mesh_7.geometry}
              material={materials.Pants_belt_buckle}
              skeleton={nodes.Mesh_7.skeleton}
            />
            <skinnedMesh
              name="Mesh_8"
              geometry={nodes.Mesh_8.geometry}
              material={materials.Pants_bottom}
              skeleton={nodes.Mesh_8.skeleton}
            />
          </group>
          <group name="GEO_CC_Shoes">
            <skinnedMesh
              name="Mesh_12"
              geometry={nodes.Mesh_12.geometry}
              material={materials.shoes_main_sole}
              skeleton={nodes.Mesh_12.skeleton}
            />
            <skinnedMesh
              name="Mesh_13"
              geometry={nodes.Mesh_13.geometry}
              material={materials.shoes_main_2}
              skeleton={nodes.Mesh_13.skeleton}
            />
            <skinnedMesh
              name="Mesh_14"
              geometry={nodes.Mesh_14.geometry}
              material={materials.shoes_main_1}
              skeleton={nodes.Mesh_14.skeleton}
            />
          </group>
          <group name="GEO_CC_Tshirt">
            <skinnedMesh
              name="Mesh_9"
              geometry={nodes.Mesh_9.geometry}
              material={materials.Shirt_main}
              skeleton={nodes.Mesh_9.skeleton}
            />
            <skinnedMesh
              name="Mesh_10"
              geometry={nodes.Mesh_10.geometry}
              material={materials.logo}
              skeleton={nodes.Mesh_10.skeleton}
              //
              material-map={logo}



            />
            <skinnedMesh
              name="Mesh_11"
              geometry={nodes.Mesh_11.geometry}
              material={materials.Shirt_main_cuffs}
              skeleton={nodes.Mesh_11.skeleton}
            />
          </group>
          <group name="GEO_Watch">
            <skinnedMesh
              name="Mesh"
              geometry={nodes.Mesh.geometry}
              material={materials.MAT_Watch_Belt}
              skeleton={nodes.Mesh.skeleton}
            />
            <skinnedMesh
              name="Mesh_1"
              geometry={nodes.Mesh_1.geometry}
              material={materials.MAT_Watch_Plastic}
              skeleton={nodes.Mesh_1.skeleton}
            />
            <skinnedMesh
              name="Mesh_2"
              geometry={nodes.Mesh_2.geometry}
              material={materials.MAT_Watch_Screen}
              skeleton={nodes.Mesh_2.skeleton}
            />
          </group>
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
      </group>
    </group>
  );
}

useGLTF.preload("/Developer.glb");

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


function App() {


  const [animation, setAnimation] = useState("Run")
  const cameraControlRef = useRef(null);

  const { cameraPosition } = useControls({ cameraPosition: [0, 0, 5] })
  const { opacity, blur, scale, far } = useControls('Shadows', { opacity: 1, scale: 10, blur: 3, far: 1.1 })


  return (

    <>
      <div className='App'>
        <Canvas shadows camera={{ fov: 25 }}>
          <Suspense fallback={<Loader />}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            {/* <Shoe /> */}
            {/* <Fox animation={animation} /> */}
            <PerspectiveCamera makeDefault position={cameraPosition} ref={cameraControlRef} />
            {/* <CameraControls enableZoom={false} ref={cameraControlRef} maxZoom={1} minZoom={1} /> */}
            <OrbitControls cameraminPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={false} target={new THREE.Vector3(0, 1.2, 0)} />
            <Ground />
            <Developer />
            {/* <Cube position={[0, 1, 0]} /> */}
            <ContactShadows opacity={opacity} scale={scale} blur={blur} far={far} />


          </Suspense>
        </Canvas>
      </div>
      <form id='center'>
        <select
          onChange={(event) => setAnimation(event.target.value)}
          value={animation}
        >
          <option value="Run">Run</option>
          <option value="Survey">Survey</option>
          <option value="Walk">Walk</option>
        </select>
      </form>


      <button
        id='center'
        onClick={() => {
          // Camera looks at the Fox
          cameraControlRef.current.position.set(0, 2, 3);
        }}
      >
        rotate theta 45deg
      </button>

      <button
        id='center2'
        onClick={() => {
          // Camera looks at the Fox
          cameraControlRef.current.position.set(5.5, 1.5, 5.5);
        }}
      >
        side view
      </button>

    </>
  )
}


export default App
