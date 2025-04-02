import { useGLTF, useAnimations, Html } from "@react-three/drei";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from 'three-stdlib';

interface RemoteCharacterProps {
    id: string;
    username: string;
    position: THREE.Vector3;
    rotation: number;
    colors?: any[];
    selected?: Record<string, string>;
    moving?: boolean;
    message?: {
        text: string;
        timestamp: number;
        messageId: string;
    };
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

// Map pose IDs to animation names - UPDATED WITH FULL MAPPING
const getAnimationNameFromPose = (poseId?: string): string => {
    if (!poseId) return "CrossedArm";
    
    switch (poseId) {
        // Existing ones
        case "pose_character_stop": return "CrossedArm";
        case "pose_crossed_arm": return "CrossedArm"; // Add alias
        case "pose_crossed_arm_1": return "CrossedArm"; // Add alias
        case "pose_confident": return "Confident";
        case "pose_waving": return "Waving";
        case "pose_welcome": return "Welcome";

        // Added from Character.tsx
        case "pose_confused": return "Confused";
        case "pose_happy_open_arm": return "HappyOpenArm";
        case "pose_jump_happy": return "JumpHappy";
        case "pose_on_phone": return "OnPhone";
        case "pose_pc01": return "PC01";
        case "pose_pc02": return "PC02";
        case "pose_pointing_down": return "PointingDown";
        case "pose_pointing_left": return "PointingLeft";
        case "pose_pointing_right": return "PointingRight";
        case "pose_pointing_up": return "PointingUp";
        case "pose_sitting_happy": return "SittingHappy";
        case "pose_sitting_sad": return "SittingSad";
        case "pose_standing1": return "Standing1"; // Keeping this mapped, although Character.tsx overrides it
        case "pose_standing_sad": return "StandingSad";
        case "pose_standing_thinking": return "StandingThinking";
        
        // Default
        default: return "CrossedArm";
    }
};

// Get color helper
const getColorHelper = (colors: any[] | undefined, subToolId: string): string => {
    if (!colors) return "#000000"; // Default to black if colors array is missing
    const colorEntry = colors.find(c => c.subToolId === subToolId);
    return colorEntry ? colorEntry.color : "#000000"; // Default to black if specific subToolId not found
};

// Extract pose from message text if present
const extractPoseFromMessage = (messageText: string, id: string): { pose: string | null, cleanText: string } => {
    // Regex to match "@poseName Rest of message" or "@poseName"
    const poseMatch = messageText.match(/^@([A-Za-z0-9_]+)\s*(.*)$/); 
    if (poseMatch) {
        const pose = `pose_${poseMatch[1].toLowerCase()}`; // Standardize to pose_ format
        const cleanText = poseMatch[2]?.trim() || ''; // Rest of the message or empty string
        // Basic validation: Check if the extracted pose exists in our mapping (case insensitive check might be needed if animation names vary)
        // We'll rely on the getAnimationNameFromPose to handle invalid poses for now.
        console.log(`[${id.slice(0,6)}] Extracted pose from message: ${pose}, Clean text: "${cleanText}"`);
        return { pose, cleanText };
    }
    
    return { pose: null, cleanText: messageText };
};

// Helper to format mesh names correctly (e.g., hair_1 -> GEO_Hair_01)
const getFormattedMeshName = (prefix: string, type: string | undefined): string | null => {
  if (!type) return null;
  const parts = type.split('_');
  if (parts.length >= 2) {
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) {
      const formattedNum = num.toString().padStart(2, '0');
      // Reconstruct prefix (e.g., GEO_Hair)
      const namePrefix = prefix + '_' + parts.slice(0, -1).join('_'); 
      return `${prefix}_${formattedNum}`;
    }
  }
  // Fallback if format is unexpected or no number found
  return `${prefix}_${type}`;
};

// ChatBubble component to display messages above character
const ChatBubble = ({ message, position, id }: { message: { text: string; timestamp: number; messageId: string }, position: [number, number, number], id: string }) => {
    const [visible, setVisible] = useState(true);
    const [currentMessageId, setCurrentMessageId] = useState(message.messageId);
    
    // Extract pose and clean text from message - pass id here
    const { pose, cleanText } = useMemo(() => extractPoseFromMessage(message.text, id), [message.text, id]);
    
    // Apply pose if found - needs to be in an effect to ensure it's called after the component mounts
    useEffect(() => {
        if (pose) {
            // Find parent RemoteCharacter component and apply pose
            // This will be handled by the animation system since we update the RemoteCharacter props
            console.log(`Remote player has pose in message: ${pose}`);
        }
    }, [pose, message.messageId]);
    
    // When message ID changes, reset the visibility and update current ID
    useEffect(() => {
        if (message.messageId !== currentMessageId) {
            setVisible(true);
            setCurrentMessageId(message.messageId);
        }
    }, [message.messageId, currentMessageId]);
    
    // Remove message after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [message.messageId]);
    
    if (!visible) return null;
    
    // Always use the clean text without the pose tag for display
    const displayText = cleanText || message.text;
    
    return (
        <group position={position}>
            <Html
                center
                as="div"
                className="pointer-events-none"
                distanceFactor={10}
                zIndexRange={[16777285, 16777290]}
                occlude={false}
                sprite={true}
            >
                <div className="bg-white text-black px-4 py-1 rounded-xl shadow-lg text-center whitespace-normal"
                     style={{ 
                       minWidth: displayText.length < 10 ? '100px' : '160px',
                       maxWidth: '300px',
                       width: 'auto',
                       wordSpacing: '0.05em',
                       lineHeight: '1.3',
                       whiteSpace: 'normal',
                       wordWrap: 'break-word'
                     }}>
                  <p className="text-base font-medium">{displayText}</p>
                </div>
            </Html>
        </group>
    );
};

export default function RemoteCharacter({ id, username, position, rotation, colors, selected, moving, message }: RemoteCharacterProps) {
    // --- DEBUG: Log received props --- 
    console.log(`[RemoteCharacter ${id.slice(0,6)}] Received Props:`, {
      username,
      colors: JSON.stringify(colors), // Log stringified colors to see the actual data received
      selected: JSON.stringify(selected)
    });
    // --- END DEBUG --- 

    // Log the username prop received by the component
    console.log(`[RemoteCharacter ${id.slice(0,6)}] Received username prop: "${username}"`);
    
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
            console.log(`[${id.slice(0,6)}] Applying updated appearance... Received colors:`, JSON.stringify(colors));

            // Apply Appearance to Clone - Match Character.tsx exactly
            clonedScene.traverse((object) => {
                if (object instanceof THREE.Mesh || object.type === 'SkinnedMesh') {
                    const mesh = object as THREE.Mesh | THREE.SkinnedMesh;
                    
                    // Ensure material is MeshStandardMaterial and clone it for uniqueness
                    let originalMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                    if (!originalMaterial || !(originalMaterial instanceof THREE.MeshStandardMaterial)) return;
                    
                    // --- Clone the material to ensure uniqueness --- 
                    const uniqueMaterial = originalMaterial.clone();
                    mesh.material = uniqueMaterial; // Assign the unique material back to the mesh
                    // ----------------------------------------------

                    // Apply colors/visibility based on mesh names - Match exactly with Character.tsx
                    
                    // *** ADD EYEBROW COLOR SETTING HERE ***
                    if (mesh.name === 'Brows') {
                        uniqueMaterial.color.set("#000000");
                        // console.log(` -> [${id.slice(0,6)}] Applied default black color to ${mesh.name}`);
                    } 
                    
                    // T-shirt parts - Apply correct subToolIds
                    if (mesh.name === 't_shirt') { 
                        // Main shirt body -> tool_2_item_5
                        const shirtColor = getColor("tool_2_item_5");
                        console.log(`[${id.slice(0,6)}] -- Applying to t_shirt: ${shirtColor}`);
                        uniqueMaterial.color.set(shirtColor);
                    } else if (mesh.name === 't_shirt_2') { 
                        // Shirt cuffs -> tool_2_item_3 
                        const cuffsColor = getColor("tool_2_item_3");
                        console.log(`[${id.slice(0,6)}] -- Applying to t_shirt_2 (cuffs): ${cuffsColor}`);
                        uniqueMaterial.color.set(cuffsColor);
                    } else if (mesh.name === 't_shirt_1') {
                        // Logo area - visibility based on selected.logo
                        mesh.visible = selected?.logo === "logo_1";
                        // console.log(` -> [${id.slice(0,6)}] Set logo visibility to ${mesh.visible}`);
                    } 
                    
                    // Pants parts - Apply correct subToolIds
                    else if (mesh.name === 'pants002') { 
                        // Main pants -> tool_2_item_1
                        const pantsColor = getColor("tool_2_item_1");
                        console.log(`[${id.slice(0,6)}] -- Applying to pants002 (main): ${pantsColor}`);
                        uniqueMaterial.color.set(pantsColor);
                    } else if (mesh.name === 'pants002_1') { 
                        // Pants belt -> tool_2_item_8 
                        const beltColor = getColor("tool_2_item_8");
                        console.log(`[${id.slice(0,6)}] -- Applying to pants002_1 (belt): ${beltColor}`);
                        uniqueMaterial.color.set(beltColor); 
                    } else if (mesh.name === 'pants002_3') {
                        // Pants bottom -> tool_2_item_1 (Matches Main Pants)
                        const pantsBottomColor = getColor("tool_2_item_1");
                        console.log(`[${id.slice(0,6)}] -- Applying to pants002_3 (bottom): ${pantsBottomColor}`);
                        uniqueMaterial.color.set(pantsBottomColor);
                    }
                    
                    // Hat - Apply correct subToolId
                    else if (mesh.name === 'GEO_Hat') {
                        mesh.visible = selected?.hats === "hat_1";
                        if (mesh.visible) {
                            // Hat color -> tool_2_item_11
                            const hatColor = getColor("tool_2_item_11");
                            console.log(` -> [${id.slice(0,6)}] Applying hat color ${hatColor} (from subToolId: tool_2_item_11) to ${mesh.name}`);
                            uniqueMaterial.color.set(hatColor);
                        } else {
                            // console.log(` -> [${id.slice(0,6)}] Set hat invisible`);
                        }
                    } 
                    
                    // Shoes parts - Apply correct subToolIds
                    else if (mesh.name === 'main_clothes002') {
                        // Shoes sole -> tool_2_item_9
                        const soleColor = getColor("tool_2_item_9");
                        console.log(` -> [${id.slice(0,6)}] Applying shoes sole color ${soleColor} (from subToolId: tool_2_item_9) to ${mesh.name}`);
                        uniqueMaterial.color.set(soleColor);
                    } else if (mesh.name === 'main_clothes002_1') {
                        // Shoes main 2 -> tool_2_item_10
                        const shoeMain2Color = getColor("tool_2_item_10");
                        console.log(` -> [${id.slice(0,6)}] Applying shoes main 2 color ${shoeMain2Color} (from subToolId: tool_2_item_10) to ${mesh.name}`);
                        uniqueMaterial.color.set(shoeMain2Color);
                    } else if (mesh.name === 'main_clothes002_2') { 
                        // Shoes main 1 -> tool_2_item_11
                        const shoeMain1Color = getColor("tool_2_item_11");
                        console.log(` -> [${id.slice(0,6)}] Applying shoes main 1 color ${shoeMain1Color} (from subToolId: tool_2_item_11) to ${mesh.name}`);
                        uniqueMaterial.color.set(shoeMain1Color);
                    }
                    
                    // Hair - Apply correct subToolId
                    else if (mesh.name.startsWith('GEO_Hair_')) {
                        const targetHairName = getFormattedMeshName('GEO_Hair', hairType);
                        mesh.visible = mesh.name === targetHairName;
                        // console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible} (Target: ${targetHairName})`);
                        if(mesh.visible) {
                            // Hair color -> tool_2_item_4 
                            const hairColor = getColor("tool_2_item_4");
                            console.log(` -> [${id.slice(0,6)}] Applying hair color ${hairColor} (from subToolId: tool_2_item_4) to ${mesh.name}`);
                            uniqueMaterial.color.set(hairColor);
                        }
                    } 
                    
                    // Beard - Apply correct subToolId
                    else if (mesh.name.startsWith('GEO_Beard_')) {
                        const targetBeardName = getFormattedMeshName('GEO_Beard', beardType);
                        mesh.visible = mesh.name === targetBeardName;
                        // console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible} (Target: ${targetBeardName})`);
                        if(mesh.visible) {
                            // Beard color -> tool_2_item_2
                            const beardColor = getColor("tool_2_item_2");
                            console.log(` -> [${id.slice(0,6)}] Applying beard color ${beardColor} (from subToolId: tool_2_item_2) to ${mesh.name}`);
                            uniqueMaterial.color.set(beardColor);
                        }
                    } 
                    
                    // Glasses - Apply correct subToolId
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
                        
                        // console.log(` -> [${id.slice(0,6)}] Setting ${mesh.name} visibility to ${mesh.visible}`);
                        
                        // Apply colors if visible
                        if(mesh.visible) {
                            // Special handling for multi-material glasses meshes
                            if (Array.isArray(mesh.material)) {
                                // Create unique materials for this specific instance
                                const uniqueMaterials = mesh.material.map(mat => mat.clone());
                                mesh.material = uniqueMaterials;
                                
                                uniqueMaterials.forEach(mat => { 
                                    if (mat instanceof THREE.MeshStandardMaterial) {
                                      if(mat.name.includes('plastic')) {
                                          // Glasses color -> tool_2_item_12
                                          const glassesPlasticColor = getColor("tool_2_item_12");
                                          console.log(` -> [${id.slice(0,6)}] Applying glasses plastic color ${glassesPlasticColor} (from subToolId: tool_2_item_12) to ${mesh.name}`);
                                          mat.color.set(glassesPlasticColor);
                                      }
                                    }
                                });
                            } else { 
                                // Glasses color -> tool_2_item_12
                                const glassesColor = getColor("tool_2_item_12");
                                console.log(` -> [${id.slice(0,6)}] Applying glasses color ${glassesColor} (from subToolId: tool_2_item_12) to ${mesh.name}`);
                                uniqueMaterial.color.set(glassesColor);
                            }
                        }
                    }
                    
                    // Watch elements - Apply correct subToolId
                    else if (mesh.name === 'body001') {
                        // Watch belt -> tool_2_item_12 (Seems watch uses glasses color based on Character.tsx indices/DEFAULT_COLORS)
                        const watchBeltColor = getColor("tool_2_item_12");
                        console.log(` -> [${id.slice(0,6)}] Applying watch belt color ${watchBeltColor} (from subToolId: tool_2_item_12) to ${mesh.name}`);
                        uniqueMaterial.color.set(watchBeltColor);
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

        // Extract potential pose from the current message - Pass ID here and fix destructuring
        const { pose: messagePose } = message ? extractPoseFromMessage(message.text, id) : { pose: null };

        let targetAnimationName: string;

        if (isMoving.current) {
            // When moving, always use walking_loop regardless of pose
            targetAnimationName = "walking_loop";
        } else {
            // When stopped: Prioritize message pose, then selected pose, then default
            if (messagePose) {
                targetAnimationName = getAnimationNameFromPose(messagePose);
                console.log(`[${id.slice(0,6)}] Using pose from message: ${messagePose} -> ${targetAnimationName}`);
            } else {
                targetAnimationName = getAnimationNameFromPose(selected?.pose);
                console.log(`[${id.slice(0,6)}] Using pose from selected state: ${selected?.pose} -> ${targetAnimationName}`);
            }
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

        // IMPORTANT: Save current position before animation transition
        const savedPosition = groupRef.current ? groupRef.current.position.clone() : null;
        
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
                
            // IMPORTANT: Restore position after animation has started
            if (savedPosition && groupRef.current) {
                groupRef.current.position.copy(savedPosition);
            }
        } else {
            console.error(`[${id.slice(0,6)}] Could not play animation: ${targetAnimationName} - action not found`);
        }

        // Update the tracked current animation
        data.currentAnimation = targetAnimationName;
        playerData.set(id, data);

    // Include message?.messageId to re-run when a new message arrives
    }, [isReady, actions, mixer, isMoving.current, selected?.pose, id, message?.messageId]); 

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
        <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow={false} position-z={0.2}>
            <circleGeometry args={[0.6, 32]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.2} />
        </mesh>
    );

    const Nametag = () => {
        // Remove useState - directly use the username prop
        // const [usernameToShow] = useState(username || `Player_${id.slice(0, 6)}`);
        const usernameToShow = username || `Player_${id.slice(0, 6)}`;
        // Log the final username being used in the Nametag
        console.log(`[RemoteCharacter ${id.slice(0,6)}] Nametag rendering username: "${usernameToShow}"`);
        
        return (
            <group position={[0, 2.3, 0]}>
                <Html
                    center
                    as="div"
                    className="pointer-events-none"
                    distanceFactor={10}
                    zIndexRange={[16777280, 16777284]}
                    occlude={false}
                    sprite={true}
                >
                    <div className="px-5 py-1 rounded-xl shadow-lg text-center" 
                         style={{ 
                             backgroundColor: "#4B50EC", 
                             opacity: 0.9,
                             color: 'white', 
                             fontSize: '15px', 
                             fontWeight: 'bold', 
                             fontFamily: 'Arial, sans-serif', 
                             whiteSpace: 'nowrap', 
                             userSelect: 'none', 
                             textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
                         }}>
                        {usernameToShow}
                    </div>
                </Html>
            </group>
        );
    };

    // --- Render Logic ---
    const canRender = isReady && clonedScene;

    console.log(`[${id.slice(0,6)}] Rendering. Can Render: ${canRender}, isReady: ${isReady}, Cloned Scene: ${!!clonedScene}`);

    return (
        <group ref={groupRef} name={`remote-player-${id}`} position={position.toArray()}>
            <CharacterShadow />
            <Nametag />
            
            {/* Chat message bubble - pass id here */}
            {message && <ChatBubble message={message} position={[0, 2.7, 0]} id={id} />}

            {/* Render the CLONED SCENE directly via primitive - do NOT add rotation here */}
            {canRender && (
                <primitive object={clonedScene} />
            )}
        </group>
    );
}