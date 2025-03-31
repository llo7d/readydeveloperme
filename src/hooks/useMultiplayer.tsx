// Existing listeners...
socket.on('userMoved', (data: { id: string; position: any; rotation: number; moving: boolean }) => {
    setRemotePlayers(prev => (
        prev.map(p => p.id === data.id ? { ...p, position: data.position, rotation: data.rotation, moving: data.moving } : p)
    ));
});

// --- NEW LISTENER --- 
socket.on('userAppearanceChanged', (data: { id: string; colors: any[]; selected: any }) => {
    console.log(`[Socket] Appearance update received for ${data.id.slice(0,6)}`);
    setRemotePlayers(prev => (
        prev.map(p => 
            p.id === data.id 
            ? { ...p, colors: data.colors, selected: data.selected } 
            : p
        )
    ));
});
// --- END NEW LISTENER --- 

socket.on('userLeft', (id: string) => {
    console.log('[Socket] User left:', id);
    setRemotePlayers(prev => prev.filter(p => p.id !== id));
}); 