/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react"

// @ts-ignore
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { TextureLoader } from "three"

//@ts-ignore
import textureColor from "./textures/door/color.jpg"
//@ts-ignore
import textureHeight from "./textures/door/height.jpg"
//@ts-ignore
import textureMetalness from "./textures/door/metalness.jpg"
//@ts-ignore
import textureNormal from "./textures/door/normal.jpg"
//@ts-ignore
import textureAlpha from "./textures/door/alpha.jpg"
//@ts-ignore
import textureAmbientOcclusion from "./textures/door/ambientOcclusion.jpg"




export default function App() {



  useEffect(() => {

    // Make a scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


    // Make a renderer
    const canvas = document.querySelector('canvas.webgl')

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true } as any)
    renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(renderer.domElement)

    // Add orbit controls
    const controls = new OrbitControls(camera, canvas as any)
    controls.enableDamping = true
    controls.enablePan = true



    // Make a light
    const pointLight = new THREE.PointLight(0xffffff, 65)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4
    scene.add(pointLight)

    // Make a light
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);

    scene.add(light);



    // Make a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100)




    const material = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(textureColor) })

    material.normalMap = new THREE.TextureLoader().load(textureNormal)

    material.normalScale.set(8, 8)

    material.metalnessMap = new THREE.TextureLoader().load(textureMetalness)

    material.metalness = 0.7

    material.roughnessMap = new THREE.TextureLoader().load("./textures/door/roughness.jpg")

    material.displacementMap = new THREE.TextureLoader().load(textureHeight)

    material.displacementScale = 0.1




    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Add three.js clock
    const clock = new THREE.Clock()



    // Move the camera
    camera.position.z = 5

    // Add axess
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animate the cube
    const animate = function () {

      const elapsedTime = clock.getElapsedTime()

      controls.update()

      requestAnimationFrame(animate)



      renderer.render(scene, camera)
    }
    animate()
  }, [])

  return (
    <div >
      <canvas className="webgl"></canvas>

      {/* <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1> */}



    </div>
  )
}