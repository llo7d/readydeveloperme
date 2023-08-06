import { useEffect } from "react"

// @ts-ignore
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export default function App() {

  useEffect(() => {

    // Make a scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


    // Make a renderer
    const canvas = document.getElementById('cube')
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true } as any)
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)

    document.body.appendChild(renderer.domElement)

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)


    // Add stats
    const stats = new Stats()
    document.body.appendChild(stats.dom)


    // Make a light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    ambientLight.castShadow = true
    scene.add(ambientLight)


    // Make a cube
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshNormalMaterial({ color: 0x00ff00 } as any)
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

      stats.update()
      controls.update()

      requestAnimationFrame(animate)
      // cube.rotation.x += 0.001
      // cube.rotation.y += 0.001


      // Move the cube on they y axis going between 0 and 3
      // cube.position.y = Math.sin(Date.now() * 0.001) + 1 

      // Doing a circle
      // cube.position.y = Math.sin(elapsedTime)
      // cube.position.x = Math.cos(elapsedTime)

      // Look at the cube
      // camera.lookAt(cube.position)



      renderer.render(scene, camera)
    }
    animate()
  }, [])

  return (
    <div >
      <canvas id='cube' />
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>


    </div>
  )
}