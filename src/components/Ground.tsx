import React from 'react';
import { Grid } from "@react-three/drei";

export default function Ground({ theme, visible }: { theme: string, visible: boolean }) {

    // const { cellColor, sectionColor } = useControls('Grid', { cellColor: '#DFAD06', sectionColor: '#C19400' })

    // Dark mode, c: #484848 ,s: #4e4e4e // Light c:#1922ad s:#4737ad
    if (visible === false) return null

    if (theme === "light") {
        const gridConfig = {
            cellSize: 0, // 0,5
            cellThickness: 0.5,
            cellColor: "#1922ad",
            sectionSize: 1, // 3
            sectionThickness: 1,
            sectionColor: "#4737ad",
            fadeDistance: 45,
            fadeStrength: 0.8,
            followCamera: false,
            infiniteGrid: true
        }
        return <Grid position={[0, -0.01, 0]} args={[15, 15]} {...gridConfig} />
    }

    else {
        const gridConfig = {
            cellSize: 0, // 0,5
            cellThickness: 0.5,
            cellColor: "#484848",
            sectionSize: 1, // 3
            sectionThickness: 1,
            sectionColor: "#4e4e4e",
            fadeDistance: 45,
            fadeStrength: 0.8,
            followCamera: false,
            infiniteGrid: true
        }
        return <Grid position={[0, -0.01, 0]} args={[15, 15]} {...gridConfig} />
    }


}

