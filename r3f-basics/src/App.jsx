/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useState, useRef, useEffect } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Environment, OrbitControls, Html, useProgress, useGLTF, useAnimations, ContactShadows, OrthographicCamera, PerspectiveCamera, Stage, CameraControls } from '@react-three/drei'
import { Suspense } from "react";
import { useControls } from 'leva'


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
      <group ref={group} {...props} dispose={null} position={[0, -1, 0]} scale={[0.02, 0.02, 0.02]}>
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



function App() {

  const DEG45 = Math.PI / 4;

  const [animation, setAnimation] = useState("Run")

  // console.log(animation);
  const cameraControlRef = useRef(null);


  return (

    <>
      <div className='App'>
        <Canvas >
          <Suspense fallback={<Loader />}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            {/* <Shoe /> */}
            <Fox animation={animation} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} ref={cameraControlRef} />
            {/* <CameraControls enableZoom={false} ref={cameraControlRef} maxZoom={1} minZoom={1} /> */}
            <OrbitControls cameraminPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={false} />

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
          cameraControlRef.current.position.set(0, 0, 3);
        }}
      >
        rotate theta 45deg
      </button>
    </>
  )
}


export default App
