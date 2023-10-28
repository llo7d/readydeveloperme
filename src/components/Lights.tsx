import { Environment } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'



const Lights = ({ selected }: { selected: { lights: string } }) => {

    // Light 1 Controls
    const { spotLightIntensitiy1, spotLightPosition1, spotLightIntensitiy2, spotLightPosition2 } = useControls('Lights1', {
        spotLightIntensitiy1: {
            value: 90,
            min: 50,
            max: 350,
            step: 1,
        },
        spotLightPosition1: {
            value: [0, 1, -5],
            step: 0.1,
        },

        spotLightIntensitiy2: {
            value: 150,
            min: 50,
            max: 350,
            step: 1,
        },
        spotLightPosition2: {
            value: [-3, 1, 10],
            step: 0.1,
        },

    })

    // Lights2 Controls
    const {
        pointLightIntensitiy1, pointLightColor1, pointLightPosition1,
        pointLightIntensitiy2, pointLightColor2, pointLightPosition2,
        pointLightIntensitiy3, pointLightColor3, pointLightPosition3 }
        = useControls('Lights2',
            {
                pointLightIntensitiy1: {
                    value: 10,
                    min: 0,
                    max: 100,
                    step: 1,
                },
                pointLightColor1: {
                    value: "#ffedbf",
                },
                pointLightPosition1: {
                    value: [2, 3, 0],
                    step: 0.1,
                },
                pointLightIntensitiy2: {
                    value: 10,
                    min: 0,
                    max: 100,
                    step: 1,
                },
                pointLightColor2: {
                    value: "#ffedbf",
                },

                pointLightPosition2: {
                    value: [-2, 3, 0],
                    step: 0.1,
                },

                pointLightIntensitiy3: {
                    value: 10,
                    min: 0,
                    max: 100,
                    step: 1,
                },
                pointLightColor3: {
                    value: "#ffedbf",
                },
                pointLightPosition3: {
                    value: [0, 1, 3],
                    step: 0.1,
                },



            })

    const Lights1 = () => {

        // Create a new new THREE.Object3D() and set its cordinates to [0,5,0]

        const light = new THREE.Object3D()
        light.position.set(0, 1.5, 0)

        return <>
            <Environment files={"./potsdamer_platz_1k.hdr"} />
            <ambientLight intensity={0.7} />
            <spotLight intensity={spotLightIntensitiy1} angle={90} penumbra={1} position={spotLightPosition1} castShadow target={light} />
            <spotLight intensity={spotLightIntensitiy2} angle={45} penumbra={1} position={spotLightPosition2} castShadow target={light} />

        </>
    }

    const Lights2 = () => {


        return <>
            <directionalLight intensity={3} position={[-5, 5, 5]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

            <pointLight intensity={pointLightIntensitiy1} color={pointLightColor1} distance={5} position={pointLightPosition1} />
            <pointLight intensity={pointLightIntensitiy2} color={pointLightColor2} distance={5} position={pointLightPosition2} />
            <pointLight intensity={pointLightIntensitiy3} color={pointLightColor3} distance={5} position={pointLightPosition3} />

        </>
    }

    // const Lights3 = () => {

    //     return <>
    //         <Environment preset="warehouse" />
    //         <directionalLight intensity={1} position={[-5, 5, 5]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

    //     </>
    // }



    return (
        <>
            {selected.lights === "lights_0" && <></>}
            {selected.lights === "lights_1" && <Lights1 />}
            {selected.lights === "lights_2" && <Lights2 />}
        </>
    )
}

export default Lights