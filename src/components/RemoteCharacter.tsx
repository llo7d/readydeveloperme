import { useGLTF, useAnimations } from "@react-three/drei";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { SkeletonUtils } from 'three-stdlib';

interface RemoteCharacterProps {
    id: string;
    position: THREE.Vector3;
    rotation: number;
    colors?: any[];
    selected?: Record<string, string>;
    moving?: boolean;
}

// Position history interface
interface PositionSample {
    position: THREE.Vector3;
    timestamp: number;
    velocity?: THREE.Vector3;
}

// Player data structure
interface PlayerData {
    positions: PositionSample[];
    lastRotation: number;
    rotationVelocity: number;
    lastUpdateTime: number;
    currentAnimation: string | null;
}

// Map to store player data
const playerData = new Map<string, PlayerData>();

// Movement settings
const SETTINGS = {
    MAX_HISTORY_LENGTH: 8,
    MIN_POSITION_DELTA: 0.03,
    POSITION_LERP_BASE: 0.07,
    ROTATION_LERP_BASE: 0.10,
    SMALL_MOVEMENT_FACTOR: 0.5,
    MAX_VELOCITY: 10,
    USE_VELOCITY_PREDICTION: true,
    VELOCITY_SMOOTHING: 0.7,
    JITTER_THRESHOLD: 0.05,
    ANIMATION_FADE_DURATION: 0.2,
    IDLE_THRESHOLD: 0.02,
    IDLE_ROTATION_THRESHOLD: 0.01
};

// Pre-load the *alternate* model for remote characters
useGLTF.preload("/dev7_other.glb");

// Helper to calculate velocity
const calculateVelocity = (newSample: PositionSample, oldSample: PositionSample): THREE.Vector3 => {
    const deltaTime = (newSample.timestamp - oldSample.timestamp) / 1000;
    if (deltaTime <= 0) return new THREE.Vector3(0, 0, 0);
    const velocity = new THREE.Vector3().subVectors(newSample.position, oldSample.position).divideScalar(deltaTime);
    if (velocity.length() > SETTINGS.MAX_VELOCITY) {
        velocity.normalize().multiplyScalar(SETTINGS.MAX_VELOCITY);
    }
    return velocity;
};

// Map pose IDs to animation names
const getAnimationNameFromPose = (poseId?: string): string => {
    if (!poseId) return "CrossedArm";
    
    switch (poseId) {
        case "pose_character_stop": return "CrossedArm";
        case "pose_confident": return "Confident";
        case "pose_waving": return "Waving";
        case "pose_welcome": return "Welcome";
        default: return "CrossedArm";
    }
};

// Get color helper
const getColorHelper = (colors: any[] | undefined, subToolId: string): string => {
    if (!colors) return "#141414";
    const colorEntry = colors.find(c => c.subToolId === subToolId);
    return colorEntry ? colorEntry.color : "#141414";
};

export default function RemoteCharacter({ id, position, rotation, colors, selected, moving }: RemoteCharacterProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [clonedScene, setClonedScene] = useState<THREE.Object3D | null>(null);
    const [isReady, setIsReady] = useState(false);
    const lastLogTime = useRef(0);
    const isMoving = useRef(moving || false);

    // Load GLTF data PER INSTANCE - Get scene, nodes, materials, animations
    // @ts-ignore
    const { scene, nodes, materials, animations } = useGLTF("/dev7_other.glb");

    // Setup animations targeting the main group
    const { actions, mixer } = useAnimations(animations, groupRef);

    // --- Appearance Setup ---
    // Use hair_2 and beard_4 as defaults
    const hairType = selected?.hair || "hair_2";
    const beardType = selected?.beard || "beard_4";
    const glassesType = selected?.glasses || "glasses_1";

    // Memoize color fetching function
    const getColor = useMemo(() => (subToolId: string) => getColorHelper(colors, subToolId), [colors]);

    // Memoize appearance object
    const appearance = useMemo(() => ({
        tshirtColor: getColor("tool_2_item_5"),
        pantsColor: getColor("tool_2_item_1"),
        hatColor: getColor("tool_2_item_3"),
        shoesColor: getColor("tool_2_item_6"),
        hairColor: getColor("hair"),
        beardColor: getColor("beard"),
        glassesColor: getColor("glasses")
    }), [getColor]);
    // --- End Appearance Setup ---

    // Refs for interpolation targets
    const targetPosition = useRef(new THREE.Vector3().copy(position));
    const targetRotation = useRef(rotation);

    // Effect to CLONE the entire SCENE and APPLY initial appearance
    useEffect(() => {
        // We need the original scene object from useGLTF
        if (scene && !clonedScene && !isReady) {
            try {
                console.log(`[${id.slice(0,6)}] Cloning entire scene now...`);
                const clone = SkeletonUtils.clone(scene);
                clone.visible = true; // Ensure root is visible
                console.log(`[${id.slice(0,6)}] Scene clone successful. Applying appearance...`);

                // Setting clone now so it's available for the appearance update effect
                setClonedScene(clone);
                setIsReady(true); 
                console.log(`[${id.slice(0,6)}] Set clonedScene state and isReady=true.`);
            } catch (error) {
                 console.error(`[${id.slice(0,6)}] Error cloning scene:`, error);
                 setIsReady(false); 
                 setClonedScene(null);
            }
        }
    }, [scene, id, clonedScene, isReady]); // Remove appearance dependencies since we handle that separately

    // Separate effect to apply appearance changes whenever colors or selected props change
    useEffect(() => {
        // Only run if we have a cloned scene to update
        if (!clonedScene || !isReady) return;

        try {
            console.log(`[${id.slice(0,6)}] Applying updated appearance...`);

            // Apply Appearance to Clone - Match Character.tsx exactly
            clonedScene.traverse((object) => {
                if (object instanceof THREE.Mesh || object.type === 'SkinnedMesh') {
                    const mesh = object as THREE.Mesh | THREE.SkinnedMesh;
                    const currentMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                    if (!currentMaterial) return;

                    // Apply colors/visibility based on mesh names - Match exactly with Character.tsx
                    
                    // T-shirt parts - use actual tool_2_item mappings from Character.tsx
                    if (mesh.name === 't_shirt') { 
                        // Main shirt body - tool_2_item_5
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_5"));
                        console.log(` -> [${id.slice(0,6)}] Applied shirt main color ${getColor("tool_2_item_5")} to ${mesh.name}`);
                    } else if (mesh.name === 't_shirt_2') { 
                        // Shirt cuffs - tool_2_item_3 (not 2)
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_2"));
                        console.log(` -> [${id.slice(0,6)}] Applied shirt cuffs color ${getColor("tool_2_item_2")} to ${mesh.name}`);
                    } else if (mesh.name === 't_shirt_1') {
                        // Logo area - visibility based on selected.logo
                        mesh.visible = selected?.logo === "logo_1";
                        console.log(` -> [${id.slice(0,6)}] Set logo visibility to ${mesh.visible}`);
                    } 
                    
                    // Pants parts
                    else if (mesh.name === 'pants002') { 
                        // Main pants - tool_2_item_1
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_1"));
                        console.log(` -> [${id.slice(0,6)}] Applied pants main color ${getColor("tool_2_item_1")} to ${mesh.name}`);
                    } else if (mesh.name === 'pants002_1') { 
                        // Pants belt - tool_2_item_6
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_6")); 
                        console.log(` -> [${id.slice(0,6)}] Applied pants belt color ${getColor("tool_2_item_6")} to ${mesh.name}`);
                    } else if (mesh.name === 'pants002_3') {
                        // Pants bottom - tool_2_item_5
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_5"));
                        console.log(` -> [${id.slice(0,6)}] Applied pants bottom color ${getColor("tool_2_item_5")} to ${mesh.name}`);
                    }
                    
                    // Hat - Only show if selected.hats is "hat_1"
                    else if (mesh.name === 'GEO_Hat') {
                        mesh.visible = selected?.hats === "hat_1";
                        if (mesh.visible) {
                            // Hat color - tool_2_item_11
                            (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_11"));
                            console.log(` -> [${id.slice(0,6)}] Set hat visible and applied color ${getColor("tool_2_item_11")}`);
                        } else {
                            console.log(` -> [${id.slice(0,6)}] Set hat invisible`);
                        }
                    } 
                    
                    // Shoes parts
                    else if (mesh.name === 'main_clothes002') {
                        // Shoes sole - tool_2_item_7
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_7"));
                        console.log(` -> [${id.slice(0,6)}] Applied shoes sole color ${getColor("tool_2_item_7")} to ${mesh.name}`);
                    } else if (mesh.name === 'main_clothes002_1') {
                        // Shoes main 2 - tool_2_item_8
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_8"));
                        console.log(` -> [${id.slice(0,6)}] Applied shoes main 2 color ${getColor("tool_2_item_8")} to ${mesh.name}`);
                    } else if (mesh.name === 'main_clothes002_2') { 
                        // Shoes main 1 - tool_2_item_9
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_9"));
                        console.log(` -> [${id.slice(0,6)}] Applied shoes main 1 color ${getColor("tool_2_item_9")} to ${mesh.name}`);
                    }
                    
                    // Hair - Set visibility based on selection
                    else if (mesh.name.startsWith('GEO_Hair_')) {
                        const targetHairName = `GEO_${hairType}`;
                        mesh.visible = mesh.name === targetHairName; 
                        console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible} (Target: ${targetHairName})`);
                        if(mesh.visible) {
                            // Hair color - tool_2_item_4
                            (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_4"));
                            console.log(` -> [${id.slice(0,6)}] Applied hair color ${getColor("tool_2_item_4")} to ${mesh.name}`);
                        }
                    } 
                    
                    // Beard - Set visibility based on selection
                    else if (mesh.name.startsWith('GEO_Beard_')) {
                        const targetBeardName = `GEO_${beardType}`;
                        mesh.visible = mesh.name === targetBeardName;
                        console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible} (Target: ${targetBeardName})`);
                        if(mesh.visible) {
                            // Beard color - tool_2_item_2
                            (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_2"));
                            console.log(` -> [${id.slice(0,6)}] Applied beard color ${getColor("tool_2_item_2")} to ${mesh.name}`);
                        }
                    } 
                    
                    // Glasses - Set visibility based on selection
                    else if (mesh.name.startsWith('GEO_Glassess_') || 
                             mesh.name === 'Plane003' || 
                             mesh.name === 'Plane003_1' ||
                             mesh.name === 'Torus002' ||
                             mesh.name === 'Torus002_1') { 
                        
                        // Determine if this is part of glasses_1 or glasses_2
                        const isGlasses1 = mesh.name === 'Plane003' || mesh.name === 'Plane003_1';
                        const isGlasses2 = mesh.name === 'Torus002' || mesh.name === 'Torus002_1';
                        
                        // Set visibility based on selection
                        if (isGlasses1) {
                            mesh.visible = selected?.glasses === "glasses_1" || selected?.glasses === "glasses_2";
                        } else if (isGlasses2) {
                            mesh.visible = selected?.glasses === "glasses_3" || selected?.glasses === "glasses_4";
                        } else {
                            // Generic fallback for other glasses parts
                            const targetGlassesName = `GEO_${glassesType}`;
                            mesh.visible = mesh.name === targetGlassesName;
                        }
                        
                        console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible}`);
                        
                        // Apply colors if visible
                        if(mesh.visible) {
                            if(Array.isArray(mesh.material)) {
                                mesh.material.forEach(mat => { 
                                    if(mat.name.includes('plastic')) {
                                        // Glasses color - tool_2_item_12
                                        (mat as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_12"));
                                        console.log(` -> [${id.slice(0,6)}] Applied glasses plastic color ${getColor("tool_2_item_12")} to ${mesh.name}`);
                                    }
                                });
                            } else if (currentMaterial) {
                                (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_12"));
                                console.log(` -> [${id.slice(0,6)}] Applied glasses color ${getColor("tool_2_item_12")} to ${mesh.name}`);
                            }
                        }
                    }
                    
                    // Watch elements
                    else if (mesh.name === 'body001') {
                        // Watch belt - tool_2_item_10
                        (currentMaterial as THREE.MeshStandardMaterial).color.set(getColor("tool_2_item_10"));
                        console.log(` -> [${id.slice(0,6)}] Applied watch belt color ${getColor("tool_2_item_10")} to ${mesh.name}`);
                    }
                }
            });
            console.log(`[${id.slice(0,6)}] Updated appearance application finished.`);
        } catch (error) {
            console.error(`[${id.slice(0,6)}] Error updating appearance:`, error);
        }
    // This effect depends on appearance, colors, selected, etc. to re-run when they change
    }, [clonedScene, isReady, hairType, beardType, glassesType, selected, colors, getColor, id]);

    // Setup player data
    useEffect(() => {
        if (!playerData.has(id)) {
            console.log(`[${id.slice(0,6)}] Initializing player data with rotation: ${rotation}`);
            playerData.set(id, {
                positions: [{ position: position.clone(), timestamp: performance.now(), velocity: new THREE.Vector3(0, 0, 0) }],
                lastRotation: rotation,
                rotationVelocity: 0,
                lastUpdateTime: performance.now(),
                currentAnimation: null,
            });
            
            // Initialize target rotation
            targetRotation.current = rotation;
            
            // Set initial rotation directly if ref is available
            if (groupRef.current) {
                groupRef.current.rotation.y = rotation;
                console.log(`[${id.slice(0,6)}] Applied initial rotation: ${rotation}`);
            }
        }
        return () => { playerData.delete(id); };
    }, [id, position, rotation]);

    // Update player data and moving state
    useEffect(() => {
        isMoving.current = moving || false;
        
        const data = playerData.get(id);
        if (!data) return;
        const currentTime = performance.now();
        const deltaTime = (currentTime - data.lastUpdateTime) / 1000;
        const lastSample = data.positions[data.positions.length - 1];
        
        // Always update target position and rotation
        targetPosition.current.copy(position);
        targetRotation.current = rotation;
        
        // Log rotation updates to help debug
        console.log(`[${id.slice(0,6)}] Rotation updated: ${rotation.toFixed(2)}`);

        const distanceChanged = lastSample.position.distanceTo(targetPosition.current);

        if (distanceChanged > SETTINGS.MIN_POSITION_DELTA || currentTime - lastSample.timestamp > 300) {
            const newSample: PositionSample = { position: targetPosition.current.clone(), timestamp: currentTime };
            if (data.positions.length > 0) {
                const rawVelocity = calculateVelocity(newSample, lastSample);
                newSample.velocity = lastSample.velocity
                    ? new THREE.Vector3().lerpVectors(rawVelocity, lastSample.velocity, SETTINGS.VELOCITY_SMOOTHING)
                    : rawVelocity;
            } else { newSample.velocity = new THREE.Vector3(0, 0, 0); }

            data.positions.push(newSample);
            while (data.positions.length > SETTINGS.MAX_HISTORY_LENGTH) { data.positions.shift(); }

            if (deltaTime > 0) {
                let rotationDelta = targetRotation.current - data.lastRotation;
                if (rotationDelta > Math.PI) rotationDelta -= Math.PI * 2;
                if (rotationDelta < -Math.PI) rotationDelta += Math.PI * 2;
                const newRotationVelocity = rotationDelta / deltaTime;
                data.rotationVelocity = THREE.MathUtils.lerp(data.rotationVelocity, newRotationVelocity, 1 - SETTINGS.VELOCITY_SMOOTHING);
            }
            data.lastRotation = targetRotation.current;
            data.lastUpdateTime = currentTime;
            playerData.set(id, data);
        }
    }, [position, rotation, id, moving]);

    // --- Animation Hooks ---

    // Single useEffect to handle all animation state changes
    useEffect(() => {
        if (!isReady || !actions || !mixer) return;

        const data = playerData.get(id);
        if (!data) return;

        // The key change: determine target animation based on movement state first
        let targetAnimationName: string;

        if (isMoving.current) {
            // When moving, always use walking_loop regardless of pose
            targetAnimationName = "walking_loop";
        } else {
            // When stopped, use the selected pose from the user
            targetAnimationName = getAnimationNameFromPose(selected?.pose);
        }

        // Skip if already playing this animation
        if (data.currentAnimation === targetAnimationName) return;

        const targetAction = actions[targetAnimationName];
        const currentAction = data.currentAnimation ? actions[data.currentAnimation] : null;

        console.log(`[${id.slice(0,6)}] Animation Transition: ${data.currentAnimation || '(none)'} -> ${targetAnimationName}`);

        // Ensure target animation exists
        if (!targetAction) {
            console.warn(`[${id.slice(0,6)}] Target animation "${targetAnimationName}" not found!`);
            // Attempt to fallback to default idle if target is missing
            const fallbackAnimName = getAnimationNameFromPose(undefined);
            const fallbackAction = actions[fallbackAnimName];
            if (!fallbackAction) {
                console.error(`[${id.slice(0,6)}] CRITICAL: Default idle animation "${fallbackAnimName}" also not found!`);
                return; // Cannot proceed
            }
            
            // Use fallback action instead
            targetAnimationName = fallbackAnimName;
            
            // Skip if already playing fallback
            if (data.currentAnimation === targetAnimationName) return;
            
            console.log(`[${id.slice(0,6)}] Falling back to default idle: ${targetAnimationName}`);
        }

        // First, stop ALL currently running animations to ensure clean transitions
        Object.entries(actions).forEach(([name, action]) => {
            if (action && action.isRunning() && name !== targetAnimationName) {
                console.log(` -> Stopping animation: ${name}`);
                action.fadeOut(SETTINGS.ANIMATION_FADE_DURATION);
            }
        });

        // Now play the target animation with clean state
        console.log(` -> Playing target animation: ${targetAnimationName}`);
        const finalAction = actions[targetAnimationName];
        if (finalAction) {
            finalAction.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(SETTINGS.ANIMATION_FADE_DURATION)
                .play();
        } else {
            console.error(`[${id.slice(0,6)}] Could not play animation: ${targetAnimationName} - action not found`);
        }

        // Update the tracked current animation
        data.currentAnimation = targetAnimationName;
        playerData.set(id, data);

    }, [isReady, actions, mixer, isMoving.current, selected?.pose, id]); // Dependencies that trigger transitions

    // Interpolation logic - Add mixer update
    useFrame((state, delta) => {
        const now = state.clock.elapsedTime;
        const logThrottle = 1.0;

        if (!groupRef.current) return;
        const data = playerData.get(id);
        const currentPosition = groupRef.current.position;
        const currentRotationY = groupRef.current.rotation.y;
        const targetY = targetRotation.current;

        // --- Idle Optimization Check --- 
        const positionDifference = currentPosition.distanceTo(targetPosition.current);
        let rotationDifference = Math.abs(targetY - currentRotationY);
        if (rotationDifference > Math.PI) rotationDifference = Math.PI * 2 - rotationDifference; // Handle wrap-around

        if (!isMoving.current && 
            positionDifference < SETTINGS.IDLE_THRESHOLD && 
            rotationDifference < SETTINGS.IDLE_ROTATION_THRESHOLD) {
            
            // If very close and not moving, snap to target and only update mixer
            if (positionDifference > 0.001) groupRef.current.position.copy(targetPosition.current); 
            if (rotationDifference > 0.001) groupRef.current.rotation.y = targetY;
            
            if (isReady) mixer?.update(delta); 
            return; // Skip full interpolation
        }
        // --- End Idle Optimization ---

        // Proceed with interpolation if moving or not close enough
        if (!data || data.positions.length < 2) {
            // Fallback interpolation if not enough data
            currentPosition.lerp(targetPosition.current, SETTINGS.POSITION_LERP_BASE);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotationY, targetY, SETTINGS.ROTATION_LERP_BASE);
            
            if (isReady) mixer?.update(delta);
            return;
        }
        
        const currentTime = performance.now();
        const lastSample = data.positions[data.positions.length - 1];

        // Interpolate Position (using prediction if enabled)
        if (SETTINGS.USE_VELOCITY_PREDICTION && lastSample.velocity && currentTime - lastSample.timestamp < 300) {
            const timeSinceLastSample = (currentTime - lastSample.timestamp) / 1000;
            const predictedPosition = lastSample.position.clone().add(lastSample.velocity.clone().multiplyScalar(timeSinceLastSample));
            const speed = lastSample.velocity.length();
            const adjustedLerp = SETTINGS.POSITION_LERP_BASE * (delta * 60);
            let lerpFactor = speed < 1.0 ? adjustedLerp * SETTINGS.SMALL_MOVEMENT_FACTOR : adjustedLerp;
            if (currentPosition.distanceTo(predictedPosition) < SETTINGS.JITTER_THRESHOLD) { lerpFactor *= 0.2; }
            currentPosition.lerp(predictedPosition, Math.min(1.0, lerpFactor));
        } else {
            // Standard lerp if prediction is off or sample is too old
            currentPosition.lerp(targetPosition.current, SETTINGS.POSITION_LERP_BASE * delta * 60);
        }

        // Interpolate Rotation - Smoothed shortest path
        let deltaY = targetY - currentRotationY;
        if (deltaY > Math.PI) deltaY -= Math.PI * 2;
        if (deltaY < -Math.PI) deltaY += Math.PI * 2;
        const rotLerpFactor = SETTINGS.ROTATION_LERP_BASE * delta * 60;
        groupRef.current.rotation.y = currentRotationY + deltaY * Math.min(1.0, rotLerpFactor);

        // --- UPDATE MIXER --- 
        if (isReady) mixer?.update(delta);

        // Throttled Logging
        if (now - lastLogTime.current > logThrottle) {
            console.log(`[${id.slice(0,6)}] useFrame @ ${now.toFixed(2)}s | Pos Delta: ${positionDifference.toFixed(3)} | Rot Delta: ${rotationDifference.toFixed(3)} | Idle Skip: ${!isMoving.current && positionDifference < SETTINGS.IDLE_THRESHOLD && rotationDifference < SETTINGS.IDLE_ROTATION_THRESHOLD}`);
            lastLogTime.current = now;
        }
    });

    // --- Sub-components ---
    const CharacterShadow = () => (
        <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow={false}>
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.2} />
        </mesh>
    );

    const Nametag = () => (
        <group position={[0, 2.5, 0]}>
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1, 0.3]} />
                <meshBasicMaterial color="#4B50EC" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            <Html position={[0, 0, 0]} center className="pointer-events-none" distanceFactor={10} zIndexRange={[16777271, 16777272]} occlude={false}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', padding: '2px 6px', whiteSpace: 'nowrap', userSelect: 'none', textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                    {id.slice(0, 6)}
                </div>
            </Html>
        </group>
    );

    // --- Render Logic ---
    const canRender = isReady && clonedScene;

    console.log(`[${id.slice(0,6)}] Rendering. Can Render: ${canRender}, isReady: ${isReady}, Cloned Scene: ${!!clonedScene}`);

    return (
        <group ref={groupRef} name={`remote-player-${id}`} position={position.toArray()}>
            <CharacterShadow />
            <Nametag />

            {/* Render the CLONED SCENE directly via primitive - do NOT add rotation here */}
            {canRender && (
                <primitive object={clonedScene} />
            )}
        </group>
    );
}