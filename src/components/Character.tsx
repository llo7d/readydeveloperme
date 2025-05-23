import { useAnimations, useGLTF, Html } from "@react-three/drei";
import React, { useEffect, useRef, MutableRefObject, useState } from "react";
import * as THREE from 'three';

// Window interface is now defined globally in src/types/window.d.ts
// declare global {
//     interface Window {
//         logAnimStates?: () => string;
//     }
// }

interface CharacterProps {
    selected: any;
    colors: any[];
    logo: any;
    characterRef?: MutableRefObject<THREE.Group | null>;
    message?: {
        text: string;
        timestamp: number;
        messageId: string;
    };
}

// ChatBubble component to display messages above character
const ChatBubble = ({ message, position }: { message: { text: string; timestamp: number; messageId: string }, position: [number, number, number] }) => {
    const [visible, setVisible] = useState(true);
    const [currentMessageId, setCurrentMessageId] = useState(message.messageId);
    
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
    
    return (
        <group position={position}>
            <Html
                center
                as="div"
                className="pointer-events-none"
                distanceFactor={10}
                zIndexRange={[16777280, 16777290]}
                occlude={false}
                sprite={true}
            >
                <div className="bg-white text-black px-4 py-1 rounded-xl shadow-lg text-center whitespace-normal"
                     style={{ 
                       minWidth: message.text.length < 10 ? '100px' : '160px',
                       maxWidth: '300px',
                       width: 'auto',
                       wordSpacing: '0.05em',
                       lineHeight: '1.3',
                       whiteSpace: 'normal',
                       wordWrap: 'break-word'
                     }}>
                  <p className="text-base font-medium">{message.text}</p>
                </div>
            </Html>
        </group>
    );
};

// Get color helper (similar to RemoteCharacter)
const getColorHelper = (colors: any[] | undefined, subToolId: string): string => {
    if (!colors) return "#000000"; // Default to black if colors array is missing
    const colorEntry = colors.find(c => c.subToolId === subToolId);
    return colorEntry ? colorEntry.color : "#000000"; // Default to black if specific subToolId not found
};

export default function Character({ selected, colors, logo, characterRef, message }: CharacterProps) {
    // Create an internal ref if no external ref is provided
    const internalRef = useRef<THREE.Group>(null);
    
    // @ts-ignore - ignoring GLTF typing issues
    const { nodes, materials, animations } = useGLTF("/dev7.glb");

    // Track character movement
    const [isWalking, setIsWalking] = useState(false);
    const lastPosition = useRef(new THREE.Vector3());
    const walkingStateTimeout = useRef<number | null>(null);

    // Use the animations with the appropriate ref
    const { actions, mixer } = useAnimations(animations, characterRef || internalRef);

    // Log available actions/animations for debugging - only once on initialization
    useEffect(() => {
        if (actions) {
            // Remove assignment to window to fix linter error
            // window.logAnimStates = () => { ... };
            
            // Log available animations once at startup only
            console.log("Available character animations:", Object.keys(actions));
            
            // Specifically check for our required animations
            const hasCrossedArm = !!actions["CrossedArm"];
            const hasWalking = !!actions["walking_loop"];
            
            console.log("Animation check:", {
                CrossedArm: hasCrossedArm,
                walking_loop: hasWalking
            });
            
            if (!hasCrossedArm) {
                console.warn("WARNING: CrossedArm animation missing!");
            }
            if (!hasWalking) {
                console.warn("WARNING: walking_loop animation missing!");
            }
        }
    }, [actions]);

    // Set initial position
    useEffect(() => {
        if (characterRef?.current || internalRef.current) {
            // Set initial position at ground level
            const ref = characterRef?.current || internalRef.current;
            if (ref) {
                ref.position.set(0, 0, 0);
                // Initialize last position
                lastPosition.current.copy(ref.position);
            }
        }
    }, [characterRef]);

    // Track character movement to detect walking
    useEffect(() => {
        if (!characterRef?.current && !internalRef.current) return;
        
        const ref = characterRef?.current || internalRef.current;
        if (!ref) return;
        
        const checkForMovement = () => {
            if (!ref) return;
            
            // Calculate distance moved since last check
            const currentPos = ref.position.clone();
            const distance = currentPos.distanceTo(lastPosition.current);
            
            // If moved more than threshold, character is walking
            const MOVEMENT_THRESHOLD = 0.02; // Increase threshold to avoid false positives
            const nowWalking = distance > MOVEMENT_THRESHOLD;
            
            // Update walking state with debounce for stopping
            if (nowWalking && !isWalking) {
                // Clear any existing timeout to stop walking
                if (walkingStateTimeout.current !== null) {
                    window.clearTimeout(walkingStateTimeout.current);
                    walkingStateTimeout.current = null;
                }
                
                // Start walking immediately
                setIsWalking(true);
            } else if (!nowWalking && isWalking) {
                // Debounce stopping to prevent flickering
                if (walkingStateTimeout.current === null) {
                    walkingStateTimeout.current = window.setTimeout(() => {
                        setIsWalking(false);
                        walkingStateTimeout.current = null;
                    }, 300); // Standard debounce timeout
                }
            }
            
            // Update last position
            lastPosition.current.copy(currentPos);
        };
        
        // Check for movement regularly
        const intervalId = setInterval(checkForMovement, 100);
        
        return () => {
            clearInterval(intervalId);
            if (walkingStateTimeout.current !== null) {
                window.clearTimeout(walkingStateTimeout.current);
            }
        };
    }, [characterRef, isWalking]);
    
    // Pose thing
    const pose = (() => {
        switch (selected.pose) {
            case "pose_character_stop": return "CrossedArm";
            case "pose_confident": return "Confident";
            case "pose_confused": return "Confused";
            case "pose_crossed_arm": return "CrossedArm";
            case "pose_happy_open_arm": return "HappyOpenArm";
            case "pose_jump_happy": return "JumpHappy";
            case "pose_on_phone": return "OnPhone";
            case "pose_pc01": return "PC01";
            case "pose_pc02": return "PC02";
            case "pose_crossed_arm_1": return "CrossedArm";
            case "pose_pointing_down": return "PointingDown";
            case "pose_pointing_left": return "PointingLeft";
            case "pose_pointing_right": return "PointingRight";
            case "pose_pointing_up": return "PointingUp";
            case "pose_sitting_happy": return "SittingHappy";
            case "pose_sitting_sad": return "SittingSad";
            case "pose_standing1": return "Standing1";
            case "pose_standing_sad": return "StandingSad";
            case "pose_standing_thinking": return "StandingThinking";
            case "pose_waving": return "Waving";
            case "pose_welcome": return "Welcome";
            default: return "CrossedArm";
        }
    })();
    
    // Helper function to completely reset all animations
    const resetAllAnimations = () => {
        if (!actions) return;
        
        Object.values(actions).forEach(action => {
            if (action) {
                action.stop();
                action.reset();
                action.setEffectiveWeight(0);
                action.enabled = false;
            }
        });
        
        if (mixer) {
            mixer.stopAllAction();
            mixer.update(0);
        }
    };
    
    // Initialize default animation on first load with a clean slate
    useEffect(() => {
        if (!actions) return;
        
        console.log("Initializing default animation");
                
        const crossedArmAnimation = actions["CrossedArm"];
        if (!crossedArmAnimation) {
            console.warn("CrossedArm animation not found!");
            return;
        }
        
        // Only set initial animation if not walking
        if (!isWalking) {
            // Make sure CrossedArm is properly initialized
            // Stop any other animations first
            Object.values(actions).forEach(action => {
                if (action && action !== crossedArmAnimation && action.isRunning()) {
                    action.stop();
                }
            });
            
            crossedArmAnimation.reset();
            crossedArmAnimation.enabled = true;
            crossedArmAnimation.setEffectiveTimeScale(1);
            crossedArmAnimation.setEffectiveWeight(1);
            crossedArmAnimation.play();
            
            console.log("CrossedArm animation started");
        }
    }, [actions]); // Only run once when actions are loaded, not when isWalking changes
    
    // Handle walking animation transitions and pose selection
    useEffect(() => {
        if (!actions) return;
        
        // Debug logging
        console.log("Animation update triggered. isWalking:", isWalking, "selected.pose:", selected.pose);
        
        // Always show walking animation when walking, CrossedArm when stopping
        if (isWalking) {
            const walkAnim = actions["walking_loop"];
            if (walkAnim) {
                Object.entries(actions).forEach(([name, action]) => {
                    if (action && action !== walkAnim && action.isRunning()) {
                        action.fadeOut(0.3);
                    }
                });
                
                if (!walkAnim.isRunning()) {
                    walkAnim.reset();
                    walkAnim.enabled = true;
                    walkAnim.setEffectiveTimeScale(1);
                    walkAnim.setEffectiveWeight(1);
                    walkAnim.play();
                    console.log("Started walking animation");
                }
            }
        } else {
            // IMPORTANT: When stopping walking, ALWAYS switch to CrossedArm regardless of selected.pose
            // This overrides the default "pose_standing1" set in App.tsx
            const crossedArmAnim = actions["CrossedArm"];
            
            if (crossedArmAnim) {
                // Fade out all other animations
                Object.entries(actions).forEach(([name, action]) => {
                    if (action && action !== crossedArmAnim && action.isRunning()) {
                        console.log("Fading out animation:", name);
                        action.fadeOut(0.3);
                    }
                });
                
                if (!crossedArmAnim.isRunning()) {
                    crossedArmAnim.reset();
                    crossedArmAnim.enabled = true;
                    crossedArmAnim.setEffectiveTimeScale(1);
                    crossedArmAnim.setEffectiveWeight(1);
                    crossedArmAnim.play();
                    console.log("Started CrossedArm animation after walking stopped");
                }
            } else {
                console.error("CrossedArm animation not found - this is a critical issue!");
            }
        }
    }, [actions, isWalking]); // Remove selected.pose and pose dependencies to prevent pose changes affecting this
    
    // Handle specific pose selection (only when not walking)
    useEffect(() => {
        if (!actions || isWalking) return; // Skip if walking or no actions
        
        // Only handle pose selection when explicitly changed via UI and not walking
        let targetAnim;
        
        // IMPORTANT: Always ignore pose_standing1 and treat it as CrossedArm
        if (selected.pose === "pose_standing1") {
            targetAnim = actions["CrossedArm"];
            console.log("Ignoring Standing1 pose, using CrossedArm instead");
        } else if (selected.pose !== "pose_character_stop" && 
            selected.pose !== "pose_crossed_arm" && 
            selected.pose !== "pose_crossed_arm_1" && 
            pose in actions) {
            // Use a specifically selected pose
            targetAnim = actions[pose];
            console.log("Using UI-selected pose:", pose);
        } else {
            // Default fallback is always CrossedArm
            targetAnim = actions["CrossedArm"];
            console.log("Using default CrossedArm pose from UI selection");
        }
        
        if (targetAnim) {
            // Fade out all other animations
            Object.entries(actions).forEach(([name, action]) => {
                if (action && action !== targetAnim && action.isRunning()) {
                    action.fadeOut(0.3);
                }
            });
            
            if (!targetAnim.isRunning()) {
                targetAnim.reset();
                targetAnim.enabled = true;
                targetAnim.setEffectiveTimeScale(1);
                targetAnim.setEffectiveWeight(1);
                targetAnim.play();
                console.log("Started pose animation from UI selection:", targetAnim._clip.name);
            }
        }
    }, [actions, selected.pose, pose, isWalking]);

    const Face = () => {
        // Safely modify morphTargetInfluences if they exist
        // @ts-ignore
        if (nodes.body && nodes.body.morphTargetInfluences) {
            if (selected.face === "default") {
                // @ts-ignore
                nodes.body.morphTargetInfluences[0] = 0
                // @ts-ignore
                nodes.body.morphTargetInfluences[1] = 1
            }
            else if (selected.face === "round") {
                // @ts-ignore
                nodes.body.morphTargetInfluences[0] = 1
                // @ts-ignore
                nodes.body.morphTargetInfluences[1] = 1
            }
            else if (selected.face === "square") {
                // @ts-ignore
                nodes.body.morphTargetInfluences[0] = 0
                // @ts-ignore
                nodes.body.morphTargetInfluences[1] = 0
            }
        }
        return <></>
    }

    const Phone = () => {
        if (selected.pose === "pose_on_phone") {
            return (
                <>
                    <mesh
                        name="iphone12"
                        castShadow
                        receiveShadow
                        // @ts-ignore
                        geometry={nodes.iphone12.geometry}
                        material={materials.Iphone_Shader}
                        position={[-0.143, 1.901, 0.168]}
                        rotation={[0.303, -0.423, 1.473]}
                        scale={1.744}
                    />
                </>
            )
        } else {
            return <></>
        }
    }

    const Hair = () => {
        // Get hair color using helper
        const hairColor = getColorHelper(colors, "tool_2_item_4");

        const GEO_Hair_01 =
            <skinnedMesh
                name="GEO_Hair_01"
                // @ts-ignore
                geometry={nodes.GEO_Hair_01.geometry}
                material={materials.MAT_Hair}
                // @ts-ignore
                skeleton={nodes.GEO_Hair_01.skeleton}
                material-color={hairColor}
                material-roughness={0.5}
            />

        const GEO_Hair_02 = <skinnedMesh
            name="GEO_Hair_02"
            // @ts-ignore
            geometry={nodes.GEO_Hair_02.geometry}
            material={materials.MAT_Hair}
            // @ts-ignore
            skeleton={nodes.GEO_Hair_02.skeleton}
            material-color={hairColor}
        />

        const GEO_Hair_03 = <skinnedMesh
            name="GEO_Hair_03"
            // @ts-ignore
            geometry={nodes.GEO_Hair_03.geometry}
            material={materials.MAT_Hair}
            // @ts-ignore
            skeleton={nodes.GEO_Hair_03.skeleton}
            material-color={hairColor}
        />

        const GEO_Hair_04 = <skinnedMesh
            name="GEO_Hair_04"
            // @ts-ignore
            geometry={nodes.GEO_Hair_04.geometry}
            material={materials.MAT_Hair}
            // @ts-ignore
            skeleton={nodes.GEO_Hair_04.skeleton}
            material-color={hairColor}
        />

        return (
            <>
                {selected.hair === "hair_1" && GEO_Hair_01}
                {selected.hair === "hair_2" && GEO_Hair_02}
                {selected.hair === "hair_3" && GEO_Hair_03}
                {selected.hair === "hair_4" && GEO_Hair_04}
            </>
        )
    }

    const Beard = () => {
        // Find the beard color by subToolId instead of using a fixed index
        const beardColor = getColorHelper(colors, "tool_2_item_2");
        
        const GEO_Beard_01 = <skinnedMesh
            name="GEO_Beard_01"
            // @ts-ignore
            geometry={nodes.GEO_Beard_01.geometry}
            material={materials.MAT_Beard}
            // @ts-ignore
            skeleton={nodes.GEO_Beard_01.skeleton}
            material-color={beardColor}
            material-roughness={0.6}
            material-metalness={0.1}
            material-envMap={null}
        />

        const GEO_Beard_02 =
            <skinnedMesh
                name="GEO_Beard_02"
                // @ts-ignore
                geometry={nodes.GEO_Beard_02.geometry}
                material={materials.MAT_Beard}
                // @ts-ignore
                skeleton={nodes.GEO_Beard_02.skeleton}
                material-color={beardColor}
            />

        const GEO_Beard_03 = <skinnedMesh
            name="GEO_Beard_03"
            // @ts-ignore
            geometry={nodes.GEO_Beard_03.geometry}
            material={materials.MAT_Beard}
            // @ts-ignore
            skeleton={nodes.GEO_Beard_03.skeleton}
            material-color={beardColor}
        />

        const GEO_Beard_04 = <skinnedMesh
            name="GEO_Beard_04"
            // @ts-ignore
            geometry={nodes.GEO_Beard_04.geometry}
            material={materials.MAT_Beard}
            // @ts-ignore
            skeleton={nodes.GEO_Beard_04.skeleton}
            material-color={beardColor}
        />

        return (
            <>
                {selected.beard === "beard_1" && GEO_Beard_01}
                {selected.beard === "beard_2" && GEO_Beard_02}
                {selected.beard === "beard_3" && GEO_Beard_03}
                {selected.beard === "beard_4" && GEO_Beard_04}
            </>
        )
    }

    const Desktop = () => {
        const desktop_bone = nodes.desktop_bone
        
        // Ensure desktop_bone exists and has children before accessing
        if (desktop_bone && desktop_bone.children && desktop_bone.children.length > 0) {
            desktop_bone.children[0].visible = false
        }

        if (selected.pose === "pose_pc01" || selected.pose === "pose_pc02") {
            return (
                <>
                    <primitive object={desktop_bone} visible={true} />
                </>
            )
        } else {
            return (
                <>
                    <primitive object={desktop_bone} visible={false} />
                </>
            )
        }
    }

    const Shoes = () => {
        // Get shoe colors using helper
        const soleColor = getColorHelper(colors, "tool_2_item_9");
        const main2Color = getColorHelper(colors, "tool_2_item_10");
        const main1Color = getColorHelper(colors, "tool_2_item_11");

        return (
            <group name="GEO_CC_Shoes">
                <skinnedMesh
                    name="main_clothes002"
                    // @ts-ignore
                    geometry={nodes.main_clothes002.geometry}
                    material={materials.shoes_main_sole}
                    // @ts-ignore
                    skeleton={nodes.main_clothes002.skeleton}
                    material-color={soleColor}
                />
                <skinnedMesh
                    name="main_clothes002_1"
                    // @ts-ignore
                    geometry={nodes.main_clothes002_1.geometry}
                    material={materials.shoes_main_2}
                    // @ts-ignore
                    skeleton={nodes.main_clothes002_1.skeleton}
                    material-color={main2Color}
                />
                <skinnedMesh
                    name="main_clothes002_2"
                    // @ts-ignore
                    geometry={nodes.main_clothes002_2.geometry}
                    material={materials.shoes_main_1}
                    // @ts-ignore
                    skeleton={nodes.main_clothes002_2.skeleton}
                    material-color={main1Color}
                />
                <skinnedMesh
                    name="main_clothes002_3"
                    // @ts-ignore
                    geometry={nodes.main_clothes002_3.geometry}
                    material={materials.shoes_main_laces}
                    // @ts-ignore
                    skeleton={nodes.main_clothes002_3.skeleton}
                />
                <skinnedMesh
                    name="main_clothes002_4"
                    // @ts-ignore
                    geometry={nodes.main_clothes002_4.geometry}
                    material={materials.shoes_main_gromments}
                    // @ts-ignore
                    skeleton={nodes.main_clothes002_4.skeleton}
                />
            </group>
        )
    }

    const Eyebrows = () => {
        return (
            <skinnedMesh
                name="Brows"
                // @ts-ignore
                geometry={nodes.Brows.geometry}
                material={materials.MAT_Brows}
                // @ts-ignore
                skeleton={nodes.Brows.skeleton}
                material-color={"black"}
            />
        )
    }

    const Glasses = () => {
        if (selected.glasses === "glasses_1") {
            return (
                <group name="GEO_Glassess_01">
                    <skinnedMesh
                        name="Plane003"
                        // @ts-ignore
                        geometry={nodes.Plane003.geometry}
                        material={materials.glass_plastic}
                        // @ts-ignore
                        skeleton={nodes.Plane003.skeleton}
                        // @ts-ignore - matrixWorld type mismatch
                        localToWorld={nodes.Plane003.matrixWorld}
                    />

                    <skinnedMesh
                        name="Plane003_1"
                        // @ts-ignore
                        geometry={nodes.Plane003_1.geometry}
                        material={materials.glass_transparent}
                        material-opacity={0.1}
                        material-metalness={-12}
                        // @ts-ignore
                        skeleton={nodes.Plane003_1.skeleton}
                    />
                </group>
            )
        }
        if (selected.glasses === "glasses_2") {
            return (
                <group name="GEO_Glassess_01">
                    <skinnedMesh
                        name="Plane003"
                        // @ts-ignore
                        geometry={nodes.Plane003.geometry}
                        material={materials.glass_plastic}
                        // @ts-ignore
                        skeleton={nodes.Plane003.skeleton}
                        // @ts-ignore - matrixWorld type mismatch
                        localToWorld={nodes.Plane003.matrixWorld}
                    />

                    <skinnedMesh
                        name="Plane003_1"
                        // @ts-ignore
                        geometry={nodes.Plane003_1.geometry}
                        material={materials.glass_transparent}
                        material-opacity={0.9}
                        // @ts-ignore
                        skeleton={nodes.Plane003_1.skeleton}
                        material-metalness={-3}
                    />
                </group>
            )
        }

        if (selected.glasses === "glasses_3") {
            return (
                <group name="GEO_Glassess_02">
                    <skinnedMesh
                        name="Torus002"
                        // @ts-ignore
                        geometry={nodes.Torus002.geometry}
                        material={materials["MAT_Glassess.002_glass"]}
                        // @ts-ignore
                        skeleton={nodes.Torus002.skeleton}
                        material-opacity={0}
                    />
                    <skinnedMesh
                        name="Torus002_1"
                        // @ts-ignore
                        geometry={nodes.Torus002_1.geometry}
                        material={materials["MAT_Glassess.002_plastic"]}
                        // @ts-ignore
                        skeleton={nodes.Torus002_1.skeleton}
                    />
                </group>
            )
        }

        if (selected.glasses === "glasses_4") {
            return (
                <group name="GEO_Glassess_02">
                    <skinnedMesh
                        name="Torus002"
                        // @ts-ignore
                        geometry={nodes.Torus002.geometry}
                        material={materials["MAT_Glassess.002_glass"]}
                        // @ts-ignore
                        skeleton={nodes.Torus002.skeleton}
                        material-metalness={-3}
                        material-opacity={0.9}
                    />
                    <skinnedMesh
                        name="Torus002_1"
                        // @ts-ignore
                        geometry={nodes.Torus002_1.geometry}
                        material={materials["MAT_Glassess.002_plastic"]}
                        // @ts-ignore
                        skeleton={nodes.Torus002_1.skeleton}
                    />
                </group>
            )
        }

        else {
            return <></>
        }
    }

    const Tshirt = () => {
        // @ts-ignore
        materials.logo.map = logo
        // @ts-ignore
        materials.logo.map.flipY = false
        
        // Get T-shirt colors using helper
        const mainColor = getColorHelper(colors, "tool_2_item_5");
        const cuffsColor = getColorHelper(colors, "tool_2_item_3");

        const Logo = () => {
            if (selected.logo === "logo_1") {
                return (
                    <skinnedMesh
                        name="t_shirt_1"
                        // @ts-ignore
                        geometry={nodes.t_shirt_1.geometry}
                        material={materials.logo}
                        // @ts-ignore
                        skeleton={nodes.t_shirt_1.skeleton}
                        visible={true}
                        material-roughness={1}
                        material-metalness={1}
                    />
                )
            }
            else {
                return (
                    <skinnedMesh
                        name="t_shirt_1"
                        // @ts-ignore
                        geometry={nodes.t_shirt_1.geometry}
                        material={materials.logo}
                        // @ts-ignore
                        skeleton={nodes.t_shirt_1.skeleton}
                        visible={false}
                    />
                )
            }
        }

        return (
            <group name="GEO_CC_Tshirt">
                <skinnedMesh
                    name="t_shirt"
                    // @ts-ignore
                    geometry={nodes.t_shirt.geometry}
                    material={materials.Shirt_main}
                    // @ts-ignore
                    skeleton={nodes.t_shirt.skeleton}
                    material-color={mainColor}
                />
                <Logo />
                <skinnedMesh
                    name="t_shirt_2"
                    // @ts-ignore
                    geometry={nodes.t_shirt_2.geometry}
                    material={materials.Shirt_main_cuffs}
                    // @ts-ignore
                    skeleton={nodes.t_shirt_2.skeleton}
                    material-color={cuffsColor}
                />
            </group>
        )
    }

    const Watch = () => {
        // Get watch color using helper
        const beltColor = getColorHelper(colors, "tool_2_item_12");

        return <group name="GEO_Watch">
            <skinnedMesh
                name="body001"
                // @ts-ignore
                geometry={nodes.body001.geometry}
                material={materials.MAT_Watch_Belt}
                // @ts-ignore
                skeleton={nodes.body001.skeleton}
                material-color={beltColor}
            />
            <skinnedMesh
                name="body001_1"
                // @ts-ignore
                geometry={nodes.body001_1.geometry}
                material={materials.MAT_Watch_Plastic}
                // @ts-ignore
                skeleton={nodes.body001_1.skeleton}
            />
            <skinnedMesh
                name="body001_2"
                // @ts-ignore
                geometry={nodes.body001_2.geometry}
                material={materials.MAT_Watch_Screen}
                material-metalness={0.5}
                material-roughness={0.1}
                // @ts-ignore
                skeleton={nodes.body001_2.skeleton}
            />
        </group>
    }

    const Pants = () => {
        // Get pants colors using helper
        const mainColor = getColorHelper(colors, "tool_2_item_1");
        const bottomColor = getColorHelper(colors, "tool_2_item_1"); // Same as main
        const beltColor = getColorHelper(colors, "tool_2_item_8");

        return (
            <group name="GEO_CC_Pants">
                <skinnedMesh
                    name="pants002"
                    // @ts-ignore
                    geometry={nodes.pants002.geometry}
                    material={materials.Pants_main}
                    // @ts-ignore
                    skeleton={nodes.pants002.skeleton}
                    material-color={mainColor}
                />
                <skinnedMesh
                    name="pants002_1"
                    // @ts-ignore
                    geometry={nodes.pants002_1.geometry}
                    material={materials.Pants_belt}
                    // @ts-ignore
                    skeleton={nodes.pants002_1.skeleton}
                    material-color={beltColor}
                />
                <skinnedMesh
                    name="pants002_2"
                    // @ts-ignore
                    geometry={nodes.pants002_2.geometry}
                    material={materials.Pants_belt_buckle}
                    // @ts-ignore
                    skeleton={nodes.pants002_2.skeleton}
                />
                <skinnedMesh
                    name="pants002_3"
                    // @ts-ignore
                    geometry={nodes.pants002_3.geometry}
                    material={materials.Pants_bottom}
                    // @ts-ignore
                    skeleton={nodes.pants002_3.skeleton}
                    material-color={bottomColor}
                />
            </group>
        )
    }

    const Hat = () => {
        // Get hat color using helper
        const hatColor = getColorHelper(colors, "tool_2_item_11");

        if (selected.hats === "hat_1") {
            return (
                <skinnedMesh
                    name="GEO_Hat"
                    // @ts-ignore
                    geometry={nodes.GEO_Hat.geometry}
                    material={materials.MAT_Cap}
                    // @ts-ignore
                    skeleton={nodes.GEO_Hat.skeleton}
                    material-color={hatColor}
                />
            )
        }

        return <></>
    }

    // Define a character shadow component
    const CharacterShadow = () => {
        return (
            <mesh 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, 0.01, 0.18]} 
                receiveShadow={false}
            >
                <circleGeometry args={[0.6, 32]} />
                
                    <meshBasicMaterial 
                    color="#000000"
                    transparent={true}
                    opacity={0.3}
                    depthWrite={false}
                />
            </mesh>
        );
    };

    return (
        <group ref={characterRef || internalRef} dispose={null}>
            {/* Chat message bubble */}
            {message && <ChatBubble message={message} position={[0, 3.1, 0]} />}
            
            {/* Character shadow */}
            <CharacterShadow />
            
            <group name="Scene">
                <group name="DP-Character_RIG">
                    <group name="GEO_Body">
                        <skinnedMesh
                            name="body"
                            // @ts-ignore
                            geometry={nodes.body.geometry}
                            material={materials.MAT_Skin}
                            // @ts-ignore
                            skeleton={nodes.body.skeleton}
                            // @ts-ignore
                            {...(nodes.body.morphTargetDictionary && { morphTargetDictionary: nodes.body.morphTargetDictionary })}
                            // @ts-ignore
                            {...(nodes.body.morphTargetInfluences && { morphTargetInfluences: nodes.body.morphTargetInfluences })}
                        />
                        <skinnedMesh
                            name="body_1"
                            // @ts-ignore
                            geometry={nodes.body_1.geometry}
                            material={materials.MAT_Teeth}
                            // @ts-ignore
                            skeleton={nodes.body_1.skeleton}
                            // @ts-ignore
                            {...(nodes.body_1.morphTargetDictionary && { morphTargetDictionary: nodes.body_1.morphTargetDictionary })}
                            // @ts-ignore
                            {...(nodes.body_1.morphTargetInfluences && { morphTargetInfluences: nodes.body_1.morphTargetInfluences })}
                        />
                        <skinnedMesh
                            name="body_2"
                            // @ts-ignore
                            geometry={nodes.body_2.geometry}
                            material={materials.MAT_Eyes}
                            // @ts-ignore
                            skeleton={nodes.body_2.skeleton}
                            // @ts-ignore
                            {...(nodes.body_2.morphTargetDictionary && { morphTargetDictionary: nodes.body_2.morphTargetDictionary })}
                            // @ts-ignore
                            {...(nodes.body_2.morphTargetInfluences && { morphTargetInfluences: nodes.body_2.morphTargetInfluences })}
                        />
                    </group>
                    <primitive object={nodes.desktop_bone} />
                    <primitive object={nodes['DEF-pelvisL']} />
                    <primitive object={nodes['DEF-pelvisR']} />
                    <primitive object={nodes['DEF-thighL']} />
                    <primitive object={nodes['DEF-thighR']} />
                    <primitive object={nodes['DEF-shoulderL']} />
                    <primitive object={nodes['DEF-upper_armL']} />
                    <primitive object={nodes['DEF-shoulderR']} />
                    <primitive object={nodes['DEF-upper_armR']} />
                    <primitive object={nodes['DEF-breastL']} />
                    <primitive object={nodes['DEF-breastR']} />
                    <primitive object={nodes['DEF-spine']} />
                </group>
                <skinnedMesh
                    name="Brows"
                    // @ts-ignore
                    geometry={nodes.Brows.geometry}
                    material={materials.MAT_Brows}
                    // @ts-ignore
                    skeleton={nodes.Brows.skeleton}
                />
                <skinnedMesh
                    name="tongue_GEO"
                    // @ts-ignore
                    geometry={nodes.tongue_GEO.geometry}
                    material={materials.Tongue}
                    // @ts-ignore
                    skeleton={nodes.tongue_GEO.skeleton}
                />

                <Hair />
                <Beard />
                <Shoes />
                <Eyebrows />
                <Glasses />
                <Tshirt />
                <Watch />
                <Pants />
                <Desktop />
                <Phone />
                <Face />
                <Hat />
            </group>
        </group>
    );
}

useGLTF.preload("/dev7.glb");
