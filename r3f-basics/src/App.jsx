/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame } from '@react-three/fiber'
import { useState, useRef } from 'react'

import { Environment, OrbitControls } from '@react-three/drei'





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
          <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
          <OrbitControls />
          <Box color={color} />
        </Canvas>
      </div>
      <div>
        <button id='center' onClick={() => HandleColourChange()}>Click me</button>
      </div>
    </>
  )
}


export default App
