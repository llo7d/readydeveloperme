import { Environment } from '@react-three/drei'
import * as THREE from 'three'



const Lights = ({ selected }: { selected: string }) => {

    const Lights1 = () => {
        // Create a new new THREE.Object3D() and set its cordinates to [0,5,0]

        const light = new THREE.Object3D()
        light.position.set(0, 1.5, 0)

        return <>
            <Environment files={"./potsdamer_platz_1k.hdr"} />
            <ambientLight intensity={0.7} />
            <spotLight intensity={90} angle={90} penumbra={1} position={[0, 1, -5]} castShadow target={light} />
            <spotLight intensity={150} angle={45} penumbra={1} position={[-3, 1, 10]} castShadow target={light} />

        </>
    }

    const Lights2 = () => {

        return <>
            <directionalLight intensity={3} position={[-5, 5, 5]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

            <pointLight intensity={10} color={"#ffedbf"} distance={5} position={[2, 3, 0]} />
            <pointLight intensity={10} color={"#ffedbf"} distance={5} position={[-2, 3, 0]} />
            <pointLight intensity={10} color={"#ffedbf"} distance={5} position={[0, 1, 3]} />

        </>
    }

    const Lights3 = () => {

        return <>
            <Environment preset="warehouse" />
            <directionalLight intensity={1} position={[-5, 5, 5]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

        </>
    }



    return (
        <>
            {selected.lights === "lights_0" && <></>}
            {selected.lights === "lights_1" && <Lights1 />}
            {selected.lights === "lights_2" && <Lights2 />}
            {selected.lights === "lights_3" && <Lights3 />}
        </>
    )
}

export default Lights