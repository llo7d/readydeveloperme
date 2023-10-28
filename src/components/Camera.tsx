import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from "three";


const CameraPosition = {

    "front": {
        position: new THREE.Vector3(0, 1, 7.5),
        target: new THREE.Vector3(0, 1, 0),
    },

    "close_up": {
        position: new THREE.Vector3(0, 1.8, 3),
        target: new THREE.Vector3(0, 1.8, 0),
    },

    "side": {
        position: new THREE.Vector3(8, 1, 0),
        target: new THREE.Vector3(0, 1, 0),
    },

    "logo": {
        position: new THREE.Vector3(0.19, 1.6, 3),
        // I could probably add the logo ref positiong here.
        target: new THREE.Vector3(0.19, 1.6, 0.2),
    },

    "free": "free"

}


const CameraControls = ({ viewMode, setViewMode }) => {

    const orbitControls = useRef();

    useFrame((state, delta) => {

        if (viewMode == "free") {
            return;
        }

        if (viewMode == "front") {
            state.camera.position.lerp(CameraPosition.front.position, 3 * delta)
            orbitControls.current.target.lerp(CameraPosition.front.target, 3 * delta)
        }

        if (viewMode == "close_up") {
            state.camera.position.lerp(CameraPosition.close_up.position, 3 * delta)
            orbitControls.current.target.lerp(CameraPosition.close_up.target, 3 * delta)

        }

        if (viewMode == "side") {
            state.camera.position.lerp(CameraPosition.side.position, 3 * delta)
            orbitControls.current.target.lerp(CameraPosition.side.target, 3 * delta)

        }
        if (viewMode == "logo") {
            state.camera.position.lerp(CameraPosition.logo.position, 3 * delta)
            orbitControls.current.target.lerp(CameraPosition.logo.target, 3 * delta)
        }

    }
    )

    return (
        <>
            <OrbitControls
                ref={orbitControls}
                onStart={() => {
                    setViewMode("free");
                }}
                ameraminPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={false}
                minDistance={2} maxDistance={10}

            />
        </>
    )
}

export default CameraControls