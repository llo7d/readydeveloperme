import { useAnimations, useGLTF } from "@react-three/drei";
import React, { useEffect, useRef, MutableRefObject } from "react";
import * as THREE from 'three';

interface CharacterProps {
    selected: any;
    colors: any[];
    logo: any;
    characterRef?: MutableRefObject<THREE.Group | null>;
}

export default function Character({ selected, colors, logo, characterRef }: CharacterProps) {
    // Create an internal ref if no external ref is provided
    const internalRef = useRef<THREE.Group>(null);
    
    // @ts-ignore - ignoring GLTF typing issues
    const { nodes, materials, animations } = useGLTF("/dev7_compress.glb");

    // Use the animations with the appropriate ref
    const { actions, mixer } = useAnimations(animations, characterRef || internalRef);

    // Set initial position
    useEffect(() => {
        if (characterRef?.current || internalRef.current) {
            // Set initial position at ground level
            const ref = characterRef?.current || internalRef.current;
            if (ref) {
                ref.position.set(0, 0, 0);
            }
        }
    }, [characterRef]);

    // Pose thing
    const pose = (() => {
        switch (selected.pose) {
            case "pose_character_stop": return "CharacterStop";
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
            default: return "Default";
        }
    })();

    // Handle animations with proper effect callback
    useEffect(() => {
        // Check if the action exists
        if (actions && actions[pose]) {
            // Reset and fade in pose
            actions[pose].reset().fadeIn(0.3).play();
            
            // Clean up function
            return () => {
                if (actions[pose]) {
                    actions[pose].fadeOut(0.3);
                }
            };
        }
    }, [actions, pose]);

    const Face = () => {
        if (selected.face === "default") {
            nodes.body.morphTargetInfluences[0] = 0
            nodes.body.morphTargetInfluences[1] = 1
        }
        else if (selected.face === "round") {
            nodes.body.morphTargetInfluences[0] = 1
            nodes.body.morphTargetInfluences[1] = 1
        }
        else if (selected.face === "square") {
            nodes.body.morphTargetInfluences[0] = 0
            nodes.body.morphTargetInfluences[1] = 0
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
        const GEO_Hair_01 =
            <skinnedMesh
                name="GEO_Hair_01"
                geometry={nodes.GEO_Hair_01.geometry}
                material={materials.MAT_Hair}
                skeleton={nodes.GEO_Hair_01.skeleton}
                material-color={colors[0].color}
                material-roughness={0.5}
            />

        const GEO_Hair_02 = <skinnedMesh
            name="GEO_Hair_02"
            geometry={nodes.GEO_Hair_02.geometry}
            material={materials.MAT_Hair}
            skeleton={nodes.GEO_Hair_02.skeleton}
            material-color={colors[0].color}
        />

        const GEO_Hair_03 = <skinnedMesh
            name="GEO_Hair_03"
            geometry={nodes.GEO_Hair_03.geometry}
            material={materials.MAT_Hair}
            skeleton={nodes.GEO_Hair_03.skeleton}
            material-color={colors[0].color}
        />

        const GEO_Hair_04 = <skinnedMesh
            name="GEO_Hair_04"
            geometry={nodes.GEO_Hair_04.geometry}
            material={materials.MAT_Hair}
            skeleton={nodes.GEO_Hair_04.skeleton}
            material-color={colors[0].color}
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
        const GEO_Beard_01 = <skinnedMesh
            name="GEO_Beard_01"
            geometry={nodes.GEO_Beard_01.geometry}
            material={materials.MAT_Beard}
            skeleton={nodes.GEO_Beard_01.skeleton}
            material-color={colors[1].color}
            material-roughness={0.6}
            material-metalness={0.1}
            material-envMap={null}
        />

        const GEO_Beard_02 =
            <skinnedMesh
                name="GEO_Beard_02"
                geometry={nodes.GEO_Beard_02.geometry}
                material={materials.MAT_Beard}
                skeleton={nodes.GEO_Beard_02.skeleton}
                material-color={colors[1].color}
            />

        const GEO_Beard_03 = <skinnedMesh
            name="GEO_Beard_03"
            geometry={nodes.GEO_Beard_03.geometry}
            material={materials.MAT_Beard}
            skeleton={nodes.GEO_Beard_03.skeleton}
            material-color={colors[1].color}
        />

        const GEO_Beard_04 = <skinnedMesh
            name="GEO_Beard_04"
            geometry={nodes.GEO_Beard_04.geometry}
            material={materials.MAT_Beard}
            skeleton={nodes.GEO_Beard_04.skeleton}
            material-color={colors[1].color}
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

        desktop_bone.children[0].visible = false

        if (selected.pose === "pose_pc01" || selected.pose === "pose_pc02") {
            return (
                <>
                    <primitive object={desktop_bone} visible={true} />
                </>
            )
        } else {
            return <><primitive object={desktop_bone} visible={false} />
            </>
        }
    }

    const Shoes = () => {
        return (
            <group name="GEO_CC_Shoes">
                <skinnedMesh
                    name="main_clothes002"
                    geometry={nodes.main_clothes002.geometry}
                    material={materials.shoes_main_sole}
                    skeleton={nodes.main_clothes002.skeleton}
                    material-color={colors[7].color}
                />
                <skinnedMesh
                    name="main_clothes002_1"
                    geometry={nodes.main_clothes002_1.geometry}
                    material={materials.shoes_main_2}
                    skeleton={nodes.main_clothes002_1.skeleton}
                    material-color={colors[8].color}
                />
                <skinnedMesh
                    name="main_clothes002_2"
                    geometry={nodes.main_clothes002_2.geometry}
                    material={materials.shoes_main_1}
                    skeleton={nodes.main_clothes002_2.skeleton}
                    material-color={colors[9].color}
                />
            </group>
        )
    }

    const Eyebrows = () => {
        return (
            <skinnedMesh
                name="Brows"
                geometry={nodes.Brows.geometry}
                material={materials.MAT_Brows}
                skeleton={nodes.Brows.skeleton}
                morphTargetDictionary={nodes.Brows.morphTargetDictionary}
                morphTargetInfluences={nodes.Brows.morphTargetInfluences}
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
                        geometry={nodes.Plane003.geometry}
                        material={materials.glass_plastic}
                        skeleton={nodes.Plane003.skeleton}
                        localToWorld={nodes.Plane003.matrixWorld}
                    />

                    <skinnedMesh
                        name="Plane003_1"
                        geometry={nodes.Plane003_1.geometry}
                        material={materials.glass_transparent}
                        material-opacity={0.1}
                        material-metalness={-12}
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
                        geometry={nodes.Plane003.geometry}
                        material={materials.glass_plastic}
                        skeleton={nodes.Plane003.skeleton}
                        localToWorld={nodes.Plane003.matrixWorld}
                    />

                    <skinnedMesh
                        name="Plane003_1"
                        geometry={nodes.Plane003_1.geometry}
                        material={materials.glass_transparent}
                        material-opacity={0.9}
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
                        geometry={nodes.Torus002.geometry}
                        material={materials["MAT_Glassess.002_glass"]}
                        skeleton={nodes.Torus002.skeleton}
                        material-opacity={0}
                    />
                    <skinnedMesh
                        name="Torus002_1"
                        geometry={nodes.Torus002_1.geometry}
                        material={materials["MAT_Glassess.002_plastic"]}
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
                        geometry={nodes.Torus002.geometry}
                        material={materials["MAT_Glassess.002_glass"]}
                        skeleton={nodes.Torus002.skeleton}
                        material-metalness={-3}
                        material-opacity={0.9}
                    />
                    <skinnedMesh
                        name="Torus002_1"
                        geometry={nodes.Torus002_1.geometry}
                        material={materials["MAT_Glassess.002_plastic"]}
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
        materials.logo.map = logo
        materials.logo.map.flipY = false

        const Logo = () => {
            if (selected.logo === "logo_1") {
                return (
                    <skinnedMesh
                        name="t_shirt_1"
                        geometry={nodes.t_shirt_1.geometry}
                        material={materials.logo}
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
                        geometry={nodes.t_shirt_1.geometry}
                        material={materials.logo}
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
                    geometry={nodes.t_shirt.geometry}
                    material={materials.Shirt_main}
                    skeleton={nodes.t_shirt.skeleton}
                    material-color={colors[3].color}
                />
                <Logo />
                <skinnedMesh
                    name="t_shirt_2"
                    geometry={nodes.t_shirt_2.geometry}
                    material={materials.Shirt_main_cuffs}
                    skeleton={nodes.t_shirt_2.skeleton}
                    material-color={colors[2].color}
                />
            </group>
        )
    }

    const Watch = () => {
        return <group name="GEO_Watch">
            <skinnedMesh
                name="body001"
                geometry={nodes.body001.geometry}
                material={materials.MAT_Watch_Belt}
                skeleton={nodes.body001.skeleton}
                material-color={colors[10].color}
            />
            <skinnedMesh
                name="body001_1"
                geometry={nodes.body001_1.geometry}
                material={materials.MAT_Watch_Plastic}
                skeleton={nodes.body001_1.skeleton}
            />
            <skinnedMesh
                name="body001_2"
                geometry={nodes.body001_2.geometry}
                material={materials.MAT_Watch_Screen}
                material-metalness={0.5}
                material-roughness={0.1}
                skeleton={nodes.body001_2.skeleton}
            />
        </group>
    }

    const Pants = () => {
        return (
            <group name="GEO_CC_Pants_Baked">
                <skinnedMesh
                    name="pants002"
                    geometry={nodes.pants002.geometry}
                    material={materials.Pants_main}
                    skeleton={nodes.pants002.skeleton}
                    material-color={colors[4].color}
                />
                <skinnedMesh
                    name="pants002_1"
                    geometry={nodes.pants002_1.geometry}
                    material={materials.Pants_belt}
                    skeleton={nodes.pants002_1.skeleton}
                    material-color={colors[6].color}
                />
                <skinnedMesh
                    name="pants002_2"
                    geometry={nodes.pants002_2.geometry}
                    material={materials.Pants_belt_buckle}
                    skeleton={nodes.pants002_2.skeleton}
                />
                <skinnedMesh
                    name="pants002_3"
                    geometry={nodes.pants002_3.geometry}
                    material={materials.Pants_bottom}
                    skeleton={nodes.pants002_3.skeleton}
                    material-color={colors[5].color}
                />
            </group>
        )
    }

    const Hat = () => {
        if (selected.hats === "hat_1") {
            return (
                <skinnedMesh
                    name="GEO_Hat"
                    geometry={nodes.GEO_Hat.geometry}
                    material={materials.MAT_Cap}
                    skeleton={nodes.GEO_Hat.skeleton}
                    material-color={colors[11].color}
                />
            )
        }

        return <></>
    }

    return (
        <group ref={characterRef || internalRef} dispose={null}>
            <group name="Scene">
                <group name="DP-Character_RIG">
                    <group name="GEO_Body">
                        <skinnedMesh
                            name="body"
                            geometry={nodes.body.geometry}
                            material={materials.MAT_Skin}
                            skeleton={nodes.body.skeleton}
                            morphTargetDictionary={nodes.body.morphTargetDictionary}
                            morphTargetInfluences={nodes.body.morphTargetInfluences}
                        />
                        <skinnedMesh
                            name="body_1"
                            geometry={nodes.body_1.geometry}
                            material={materials.MAT_Teeth}
                            skeleton={nodes.body_1.skeleton}
                            morphTargetDictionary={nodes.body_1.morphTargetDictionary}
                            morphTargetInfluences={nodes.body_1.morphTargetInfluences}
                        />
                        <skinnedMesh
                            name="body_2"
                            geometry={nodes.body_2.geometry}
                            material={materials.MAT_Eyes}
                            skeleton={nodes.body_2.skeleton}
                            morphTargetDictionary={nodes.body_2.morphTargetDictionary}
                            morphTargetInfluences={nodes.body_2.morphTargetInfluences}
                        />
                    </group>
                    <primitive object={nodes["DEF-pelvisL"]} />
                    <primitive object={nodes["DEF-pelvisR"]} />
                    <primitive object={nodes["DEF-thighL"]} />
                    <primitive object={nodes["DEF-thighR"]} />
                    <primitive object={nodes["DEF-shoulderL"]} />
                    <primitive object={nodes["DEF-upper_armL"]} />
                    <primitive object={nodes["DEF-shoulderR"]} />
                    <primitive object={nodes["DEF-upper_armR"]} />
                    <primitive object={nodes["DEF-breastL"]} />
                    <primitive object={nodes["DEF-breastR"]} />
                    <primitive object={nodes["DEF-spine"]} />
                </group>
                <skinnedMesh
                    name="tongue_GEO"
                    geometry={nodes.tongue_GEO.geometry}
                    material={materials.Tongue}
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

useGLTF.preload("/dev7_compress.glb");
