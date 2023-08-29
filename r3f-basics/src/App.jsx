/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useState, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Environment, OrbitControls, Html, useProgress, useGLTF } from '@react-three/drei'
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

useGLTF.preload('/shoe2lDraco.gltf')


function GLBModel() {
  const gltf = useLoader(GLTFLoader, 'shoe2.gltf')


  // usiung the useFrame hook to rotate the model
  useFrame(() => {
    gltf.scene.getObjectByName('shoe_5').rotation.y += 0.01
  })

  // grabbing the matieral from the model and changing the color

  console.log(gltf.scene)
  return (
    <>
      <primitive object={gltf.scene} />
    </>
  )
}


function App() {

  const [color, setColor] = useState('red')

  function HandleColourChange() {
    if (color === 'red') {
      setColor('blue')
    } else {
      setColor('red')
    }


  }


  return (

    <>
      <div className='App'>
        <Canvas >
          <Suspense fallback={<Loader />}>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            <OrbitControls />
            {/* <GLBModel /> */}
            <Shoe />
          </Suspense>
        </Canvas>
      </div>
      {/* <div>
        <button id='center' onClick={() => HandleColourChange()}>Click me</button>
      </div> */}
    </>
  )
}


export default App
