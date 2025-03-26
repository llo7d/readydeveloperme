import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

// Declare global window property
declare global {
  interface Window {
    helperUIConfig: any;
  }
}

// Initialize portal config if it doesn't exist
if (!window.helperUIConfig) {
  window.helperUIConfig = {};
}

if (!window.helperUIConfig.portal) {
  window.helperUIConfig.portal = {
    height: 2,
    colors: {
      primary: '#37BA7E'
    },
    rotationSpeed: 0.05, // Speed at which the portal rotates to face character
    rotation: {
      offset: Math.PI, // Rotation offset (Math.PI = 180 degrees)
      x: Math.PI / 2,  // X-axis rotation (Math.PI/2 = 90 degrees)
      invertTracking: false // Whether to invert the tracking rotation
    }
  };
}

const Portal = () => {
  const portalRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Leva controls for portal configuration
  const {
    height,
    rotationSpeed,
    rotationOffset,
    xRotation,
    invertTracking,
    enableTracking,
    staticYRotation,
    pulseSpeed,
    pulseScale,
    floatSpeed,
    floatHeight,
    waveSpeed,
    waveAmplitude
  } = useControls('Portal Settings', {
    height: { value: 1.7, min: 0, max: 5, step: 0.1 },
    rotationSpeed: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
    rotationOffset: { value: Math.PI, min: 0, max: Math.PI * 2, step: 0.1 },
    xRotation: { value: 3.1707963267948966, min: 0, max: Math.PI * 2, step: 0.1 },
    enableTracking: { value: true, label: 'Enable Character Tracking' },
    staticYRotation: { 
      value: -2.4000000000000004, 
      min: -Math.PI * 2, 
      max: Math.PI * 2, 
      step: 0.1, 
      label: 'Static Y Rotation'
    },
    invertTracking: false,
    pulseSpeed: { value: 0.02, min: 0.01, max: 0.1, step: 0.01 },
    pulseScale: { value: 0.1, min: 0, max: 0.3, step: 0.01 },
    floatSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    floatHeight: { value: 0.3, min: 0, max: 1, step: 0.1 },
    waveSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    waveAmplitude: { value: 0.1, min: 0, max: 0.5, step: 0.01 }
  });

  const targetRotation = useRef(0);

  // Define base scale for the portal (10x larger than previous size)
  const baseScale = 0.5; // Increased from 0.05 (10x larger)

  // Custom shader for wave effect
  const waveShader = {
    uniforms: {
      time: { value: 0 },
      waveSpeed: { value: waveSpeed },
      waveAmplitude: { value: waveAmplitude },
      color: { value: new THREE.Color('#37BA7E') }
    },
    vertexShader: `
      uniform float time;
      uniform float waveSpeed;
      uniform float waveAmplitude;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.y * 5.0 * waveSpeed + time) * waveAmplitude * 0.2;
        pos.z += wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float time;
      varying vec2 vUv;
      void main() {
        float alpha = 0.5;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true
  };

  // Loading effect shader
  const loadingShader = {
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#7EECC2') } // Brighter green
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        // Create a sweeping effect that moves up and down more slowly
        float cyclePosition = sin(time * 0.2) * 0.5 + 0.5; // 0 to 1 range, slower cycle
        
        // Height of the loading effect
        float loadingHeight = 0.2; // Thinner loading band
        
        // Calculate the bottom and top of current loading section
        float loadingBottom = cyclePosition - loadingHeight * 0.5;
        float loadingTop = cyclePosition + loadingHeight * 0.5;
        
        // Determine if this fragment is in the loading area with sharper edges
        float inLoadingArea = smoothstep(loadingBottom - 0.02, loadingBottom, vUv.y) * 
                             (1.0 - smoothstep(loadingTop, loadingTop + 0.02, vUv.y));
        
        // Add some variation based on horizontal position for a more dynamic look
        float horizontalVar = sin(vUv.x * 30.0 + time * 3.0) * 0.15;
        
        // Create scan line effect
        float scanLines = sin(vUv.y * 40.0) * 0.5 + 0.5;
        
        // Combine for final effect
        float brightness = inLoadingArea * (0.8 + horizontalVar) * scanLines;
        
        // Brighter in the center
        float centerIntensity = 1.0 - 2.0 * abs(vUv.x - 0.5);
        brightness *= (0.6 + centerIntensity * 0.4);
        
        // Final color with full intensity at loading area
        gl_FragColor = vec4(color, brightness * 0.8);
      }
    `,
    transparent: true
  };

  // Store last position for movement detection
  const lastPosition = useRef(new THREE.Vector3());

  // Animation frame updates
  useFrame((state) => {
    if (!portalRef.current) return;

    let newRotation;

    if (enableTracking) {
      // Get camera position and calculate target rotation
      const cameraPosition = new THREE.Vector3();
      camera.getWorldPosition(cameraPosition);
      
      // Calculate angle between portal and camera
      const portalPosition = new THREE.Vector3(25, 0, 25); // Portal's fixed position - moved further away
      const directionToCamera = new THREE.Vector2(
        cameraPosition.x - portalPosition.x,
        cameraPosition.z - portalPosition.z
      );
      
      // Calculate target rotation with configurable offset and inversion
      const baseRotation = Math.atan2(directionToCamera.y, directionToCamera.x);
      targetRotation.current = invertTracking 
        ? baseRotation 
        : baseRotation - Math.PI / 2; // Adjusted to maintain flat orientation

      // Smoothly interpolate current rotation to target rotation
      const currentRotation = portalRef.current.rotation.y;
      
      // Calculate the shortest rotation path
      const rotationDiff = ((targetRotation.current - currentRotation + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      newRotation = currentRotation + rotationDiff * rotationSpeed;
    } else {
      // Use static rotation when tracking is disabled
      newRotation = staticYRotation;
    }
    
    // Apply the rotation
    portalRef.current.rotation.set(
      xRotation,
      newRotation,
      0
    );

    // Floating animation - modified to only float upward (0 to floatHeight)
    const floatOffset = (Math.sin(state.clock.getElapsedTime() * floatSpeed) + 1) * 0.5 * floatHeight;
    portalRef.current.position.y = height + floatOffset;

    // Pulse effect - using baseScale as the reference size
    const pulseAmount = 1 + Math.sin(state.clock.getElapsedTime() * pulseSpeed) * pulseScale;
    const scaledSize = baseScale * pulseAmount;
    portalRef.current.scale.set(scaledSize, scaledSize, scaledSize);

    // Update wave shader time
    const portalMesh = portalRef.current.children[2] as THREE.Mesh;
    if (portalMesh?.material && 'uniforms' in (portalMesh.material as any)) {
      (portalMesh.material as any).uniforms.time.value = state.clock.getElapsedTime();
      (portalMesh.material as any).uniforms.waveSpeed.value = waveSpeed;
      (portalMesh.material as any).uniforms.waveAmplitude.value = waveAmplitude;
    }

    // Update loading shader time - more specific reference to ensure it's found
    const children = portalRef.current.children;
    let loadingMesh: THREE.Mesh | undefined = undefined;
    
    // First try with userData
    loadingMesh = children.find(
      child => child instanceof THREE.Mesh && 
      child.userData && 
      child.userData.isLoadingEffect
    ) as THREE.Mesh | undefined;
    
    // If not found, try finding the last mesh which should be our loading effect
    if (!loadingMesh) {
      // Find the last mesh with shaderMaterial (should be our loading effect)
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.ShaderMaterial) {
          loadingMesh = child;
          break;
        }
      }
    }
    
    if (loadingMesh?.material && 'uniforms' in (loadingMesh.material as THREE.ShaderMaterial)) {
      (loadingMesh.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  // Log configuration instructions
  useEffect(() => {
    console.log("Portal Configuration:");
    console.log("Height: window.helperUIConfig.portal.height");
    console.log("Example: window.helperUIConfig.portal.height = 3  // 3 units high");
    console.log("\nRotation Settings:");
    console.log("Speed: window.helperUIConfig.portal.rotationSpeed");
    console.log("Example: window.helperUIConfig.portal.rotationSpeed = 0.1  // Faster rotation");
    console.log("\nRotation Offset: window.helperUIConfig.portal.rotation.offset");
    console.log("Example: window.helperUIConfig.portal.rotation.offset = 0  // No offset");
    console.log("Example: window.helperUIConfig.portal.rotation.offset = Math.PI  // 180 degrees");
    console.log("\nX-axis Rotation: window.helperUIConfig.portal.rotation.x");
    console.log("Example: window.helperUIConfig.portal.rotation.x = Math.PI/2  // 90 degrees (horizontal)");
    console.log("\nInvert Tracking: window.helperUIConfig.portal.rotation.invertTracking");
    console.log("Example: window.helperUIConfig.portal.rotation.invertTracking = true  // Invert rotation");
  }, []);

  return (
    <group 
      ref={portalRef} 
      position={[25, height, 25]} 
      rotation={[xRotation, 0, 0]}
    >
      {/* Vibe Portal Badge - moved higher above the portal */}
      <group position={[0, -4.0, 0]}>
        <Html
          center
          style={{
            background: 'rgba(0,0,0,0.7)',
            padding: '3px 12px',
            borderRadius: '6px',
            color: '#37BA7E',
            fontWeight: 'bold',
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            textShadow: '0 0 10px #37BA7E',
            whiteSpace: 'nowrap'
          }}
        >
          Vibe Portal
        </Html>
      </group>

      {/* Main portal ring */}
      <mesh scale={[1, 1.5, 1]}>
        <torusGeometry args={[2, 0.15, 32, 100]} />
        <meshStandardMaterial 
          color="#37BA7E"
          emissive="#37BA7E"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh scale={[1, 1.5, 1]}>
        <torusGeometry args={[2.2, 0.05, 32, 100]} />
        <meshStandardMaterial 
          color="#37BA7E"
          emissive="#37BA7E"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Simple portal background replacing complex wave shader */}
      <mesh scale={[1, 1.5, 1]}>
        <circleGeometry args={[1.85, 64]} />
        <meshBasicMaterial
          color="#057221"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Energy field - oval shaped */}
      <mesh scale={[1.7, 2.2, 1.7]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#37BA7E"
          transparent
          opacity={0.05}
          emissive="#37BA7E"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Portal particles */}
      {Array.from({ length: 30 }).map((_, i) => {
        const radius = 1.8 + Math.random() * 0.2;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = ((Math.random() - 0.5) * 2.8);  // Adjusted for oval shape
        
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#37BA7E"
              emissive="#37BA7E"
              emissiveIntensity={0.8}
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}

      {/* Energy beams */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 1.8;
        const y = Math.sin(angle) * 2.7; // Adjusted for oval shape
        
        return (
          <mesh key={i} position={[x, y, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshStandardMaterial
              color="#37BA7E"
              emissive="#37BA7E"
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Loading effect plane */}
      <mesh scale={[1, 1.5, 1]} position={[0, 0, 0.01]} userData={{ isLoadingEffect: true }}>
        <circleGeometry args={[1.9, 64]} />
        <shaderMaterial 
          attach="material"
          args={[loadingShader]}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default Portal; 