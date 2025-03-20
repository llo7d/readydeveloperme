import { Html } from "@react-three/drei";
import React from "react";
import Character from "./Character";

export default function StaticCharacterModel() {
    const defaultColors = [
        { color: '#1F2937' },  // Hair
        { color: '#1F2937' },  // Beard
        { color: '#15803d' },  // Shirt cuffs - darker green
        { color: '#22c55e' },  // Shirt main - bright green
        { color: '#1F2937' },  // Pants main
        { color: '#374151' },  // Pants bottom
        { color: '#111827' },  // Belt
        { color: '#111827' },  // Shoes
        { color: '#1F2937' },  // Shoes accent
        { color: '#000000' },  // Shoes sole
        { color: '#000000' },  // Watch
        { color: '#000000' }   // Hat
    ];

    const staticSelected = {
        pose: "pose_pc02",
        hair: "hair_1",
        face: "default",
        glasses: "glasses_1",
        logo: null,
        hats: null
    };

    return (
        <group position={[-6, 0, 15]} rotation={[0, Math.PI / 4, 0]}>
            <Character 
                selected={staticSelected}
                colors={defaultColors}
                logo={null}
                modelPath="/dev8_compress.glb"
            />
            <Html
                position={[0, 3, 0]}
                center
                style={{
                    background: '#2563EB',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                Supabase AI Helper
            </Html>
        </group>
    );
}
