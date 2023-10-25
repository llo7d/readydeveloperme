import { Environment, useHelper, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import { SpotLightHelper } from 'three'
import * as THREE from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'





const Lights = ({ selected }) => {
    // const env_map = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr'
    // preoload potsdamer_platz_1k.hdr from public folder using useTexture
    const light_ref = useRef()

    useHelper(light_ref, SpotLightHelper, 'cyan')

    console.log(selected.lights);

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
            <Environment files={"./potsdamer_platz_1k.hdr"} />
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

    const Lights4 = () => {

        // const { scene } = useThree();

        // // This somehow changes the texture of the ground-plane and makes it more shiny? Very interesting
        // RectAreaLightUniformsLib.init();

        // const rectLight = new THREE.RectAreaLight("white", 1, 5, 5);
        // rectLight.position.set(0, 2, -3);
        // // Rotate rectlight 90 degrees on the x axis
        // rectLight.rotation.x = THREE.MathUtils.degToRad(-180);
        // scene.add(rectLight);
        // scene.add(new RectAreaLightHelper(rectLight));


        // // Add a hempehre light to the scene
        // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        // hemiLight.position.set(0, 20, 0);
        // scene.add(hemiLight);

        const rectAreaLight = useRef();
        useHelper(rectAreaLight, RectAreaLightHelper);

        return (
            <rectAreaLight
                ref={rectAreaLight}
                position={[0, 2, -3]}
                width={5}
                height={5}
                color={"white"}
                intensity={1}
            />
        )

    }

    return (
        <>
            {selected.lights === "lights_0" && <></>}
            {selected.lights === "lights_1" && <Lights1 />}
            {selected.lights === "lights_2" && <Lights2 />}
            {selected.lights === "lights_3" && <Lights3 />}
            {selected.lights === "lights_4" && <Lights4 />}

        </>
    )
}

export default Lights