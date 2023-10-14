import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";



export default function Character({ selected, colors, }, props) {


    const group = useRef();
    const { nodes, materials, animations } = useGLTF("/dev4_compress.glb");

    const { actions, mixer, ref } = useAnimations(animations, group);

    console.log(nodes);


    // Change Poses 
    useEffect(() => {
        // Reset and fade in animation after an index has been changed
        actions[selected.pose].reset().fadeIn(0.5).play()
        // In the clean-up phase, fade it out
        return () => actions[selected.pose].fadeOut(0.5)
    }, [actions[selected.pose]])


    const Phone = () => {
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
    }

    const Hair = () => {

        // props.selected.hair

        const GEO_Hair_01 =
            <skinnedMesh
                name="GEO_Hair_01"
                geometry={nodes.GEO_Hair_01.geometry}
                material={materials.MAT_Hair}
                skeleton={nodes.GEO_Hair_01.skeleton}
                material-color={colors[0].color}
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
                {/* Return hair based on snap.selected.hair with a one of code*/}
                {selected.hair === "GEO_Hair_01" && GEO_Hair_01}
                {selected.hair === "GEO_Hair_02" && GEO_Hair_02}
                {selected.hair === "GEO_Hair_03" && GEO_Hair_03}
                {selected.hair === "GEO_Hair_04" && GEO_Hair_04}
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

                {/* Return hair based on snap.selected.hair with a one of code*/}
                {selected.beard === "GEO_Beard_01" && GEO_Beard_01}
                {selected.beard === "GEO_Beard_02" && GEO_Beard_02}
                {selected.beard === "GEO_Beard_03" && GEO_Beard_03}
                {selected.beard === "GEO_Beard_04" && GEO_Beard_04}
            </>
        )
    }

    const Desktop = () => {

        console.log(selected.pose);

        // if seleceted.pose is SittingHappy or SittingSad return else null
        if (selected.pose === "PC01" || selected.pose === "PC02") {
            return (
                <>
                    <primitive object={nodes.desktop_bone} visible={true} />
                </>
            )
        } else {
            return <><primitive object={nodes.desktop_bone} visible={false} />
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
                />
                <skinnedMesh
                    name="main_clothes002_1"
                    geometry={nodes.main_clothes002_1.geometry}
                    material={materials.shoes_main_2}
                    skeleton={nodes.main_clothes002_1.skeleton}
                />
                <skinnedMesh
                    name="main_clothes002_2"
                    geometry={nodes.main_clothes002_2.geometry}
                    material={materials.shoes_main_1}
                    skeleton={nodes.main_clothes002_2.skeleton}
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
            />
        )
    }

    const Glasses = () => {
        return (

            <group name="GEO_Glassess_01">
                <skinnedMesh
                    name="Plane003"
                    geometry={nodes.Plane003.geometry}
                    material={materials.glass_plastic}
                    skeleton={nodes.Plane003.skeleton}
                />
                <skinnedMesh
                    name="Plane003_1"
                    geometry={nodes.Plane003_1.geometry}
                    material={materials.glass_transparent}
                    skeleton={nodes.Plane003_1.skeleton}
                />
            </group>
        )
    }

    const Tshirt = () => {
        return (
            <group name="GEO_CC_Tshirt">
                <skinnedMesh
                    name="t_shirt"
                    geometry={nodes.t_shirt.geometry}
                    material={materials.Shirt_main}
                    skeleton={nodes.t_shirt.skeleton}
                />
                <skinnedMesh
                    name="t_shirt_1"
                    geometry={nodes.t_shirt_1.geometry}
                    material={materials.logo}
                    skeleton={nodes.t_shirt_1.skeleton}
                />
                <skinnedMesh
                    name="t_shirt_2"
                    geometry={nodes.t_shirt_2.geometry}
                    material={materials.Shirt_main_cuffs}
                    skeleton={nodes.t_shirt_2.skeleton}
                />
            </group>

        )
    }

    const Watch = () => {
        return (<group name="GEO_Watch">
            <skinnedMesh
                name="body001"
                geometry={nodes.body001.geometry}
                material={materials.MAT_Watch_Belt}
                skeleton={nodes.body001.skeleton}
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
                skeleton={nodes.body001_2.skeleton}
            />
        </group>

        )
    }

    const Pants = () => {
        return (
            <group name="GEO_CC_Pants_Baked">
                <skinnedMesh
                    name="pants002"
                    geometry={nodes.pants002.geometry}
                    material={materials.Pants_main}
                    skeleton={nodes.pants002.skeleton}
                />
                <skinnedMesh
                    name="pants002_1"
                    geometry={nodes.pants002_1.geometry}
                    material={materials.Pants_belt}
                    skeleton={nodes.pants002_1.skeleton}
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
                />
            </group>
        )
    }


    console.log("material", materials);


    return (
        <group ref={group} {...props} dispose={null}>
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

                {/*  Create a group thats position is [0,1.87,0] and rotated 90 degrees  */}


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


            </group>
        </group>
    );
}

useGLTF.preload("/dev4_compress.glb");
