import { Environment } from '@react-three/drei'
import { useControls } from 'leva'
import React from 'react'
import { log } from 'three/examples/jsm/nodes/Nodes.js'

const Lights = () => {

    // Using useControls, create a [0,0,0 ] poistion for the light
    const { light_position } = useControls({ lights: [0, 0, 0] })



    console.log(light_position);

    const Lights1 = () => {


        return <>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        </>
    }

    const Lights2 = () => {


        return <>
            <ambientLight intensity={1} />
            <Environment preset="city" />
            {/* // Pointlight that is behind the character and glows a white light
            <pointLight intensity={1} color={[10, 10, 10]} distance={5} /> */}

        </>
    }

    const Lights3 = () => {


        return <>
            {/* <ambientLight intensity={0.7} /> */}
            {/* <Environment preset="city" /> */}
            <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[5, 5, 5]} castShadow />

        </>
    }

    return (
        <>
            <Lights2 />
        </>
    )
}

export default Lights