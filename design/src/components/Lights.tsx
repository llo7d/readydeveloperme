import { Environment, useHelper } from '@react-three/drei'
import { useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import { SpotLightHelper } from 'three'
import * as THREE from 'three'

const Lights = () => {

    const light_ref = useRef()

    useHelper(light_ref, SpotLightHelper, 'cyan')


    // Using useControls, create a [0,0,0 ] poistion for the light, with 1 steps
    const light_position = useControls('Light Position', {
        position: {
            value: [-1, 12, -10],
            step: 1
        }
    })


    // console.log(light_position);

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


        // Create a new new THREE.Object3D() and set its cordinates to [0,5,0]
        const light = new THREE.Object3D()
        light.position.set(0, 1, 0)



        return <>
            {/* <ambientLight intensity={0.7} /> */}
            {/* <Environment preset="city" /> */}
            <spotLight ref={light_ref} intensity={150} angle={15} penumbra={1} position={light_position.position} castShadow target={light} />
            {/* -1,3,5 angle 90, int80 */}

        </>
    }

    return (
        <>
            <Lights2 />
        </>
    )
}

export default Lights