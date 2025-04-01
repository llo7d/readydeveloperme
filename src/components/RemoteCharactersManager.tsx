import React, { useEffect } from 'react';
import { useMultiplayer } from '../contexts/MultiplayerContext';
import RemoteCharacter from './RemoteCharacter';
import * as THREE from 'three';

const RemoteCharactersManager: React.FC = () => {
  const { remotePlayersMap, socket } = useMultiplayer();
  
  // Function to fix shared references by forcing deep copies
  const fixSharedReferences = (map: Map<string, any>) => {
    console.log('*** ATTEMPTING TO FIX SHARED REFERENCES ***');
    
    // Create a completely new map with fresh deep copies
    const fixedMap = new Map<string, any>();
    
    Array.from(map.entries()).forEach(([id, player]: [string, any]) => {
      // Create completely new deep copies of all data
      const newColors = player.colors ? JSON.parse(JSON.stringify(player.colors)) : null;
      const newSelected = player.selected ? JSON.parse(JSON.stringify(player.selected)) : null;
      
      // Create new position vector
      const newPosition = new THREE.Vector3(
        player.position.x,
        player.position.y, 
        player.position.z
      );
      
      // Create completely fresh player object
      const newPlayer = {
        id,
        username: player.username,
        position: newPosition,
        rotation: player.rotation,
        moving: player.moving || false,
        colors: newColors,
        selected: newSelected,
        message: player.message ? {...player.message} : undefined
      };
      
      fixedMap.set(id, newPlayer);
      console.log(`Fixed player ${id.slice(0,6)} with new color reference`);
    });
    
    return fixedMap;
  };
  
  // Log when remote players change to help with debugging
  useEffect(() => {
    console.log(`Remote players updated: ${remotePlayersMap.size} players found`);
    
    if (remotePlayersMap.size > 0) {
      console.log('Remote player IDs:', Array.from(remotePlayersMap.keys()));
      
      // Enhanced debugging: Log each player's colors to check for uniqueness
      const players = Array.from(remotePlayersMap.entries());
      console.log('Appearance data dump for debugging:');
      
      // Create an object to track all colors for comparison
      const colorObjects = new Map();
      
      players.forEach(([id, player]) => {
        console.log(`Player ${id.slice(0,6)} colors reference: ${player.colors ? JSON.stringify(player.colors.slice(0, 2)) : 'undefined'}`);
        
        // Track colors array object identity
        if (player.colors) {
          colorObjects.set(id, player.colors);
        }
      });
      
      // Check for shared references across different players (which would cause the issue)
      let sharedReferencesDetected = false;
      
      if (colorObjects.size > 1) {
        console.log('Checking for shared color object references (would indicate a bug):');
        const entries = Array.from(colorObjects.entries());
        
        for (let i = 0; i < entries.length; i++) {
          for (let j = i + 1; j < entries.length; j++) {
            const [id1, colors1] = entries[i];
            const [id2, colors2] = entries[j];
            
            const isSharedReference = colors1 === colors2; // Object identity check
            console.log(`${id1.slice(0,6)} and ${id2.slice(0,6)} share color reference: ${isSharedReference}`);
            
            if (isSharedReference) {
              sharedReferencesDetected = true;
              console.warn('WARNING: Multiple players sharing same color object reference. This will cause color synchronization issues!');
            }
          }
        }
      }
      
      // If we detect shared references, we could force a refresh of appearances from the server
      // This is a last resort fix if our other changes don't work
      if (sharedReferencesDetected && socket) {
        console.error('CRITICAL: Shared references detected - sending appearance refresh request');
        socket.emit('requestAppearanceRefresh');
      }
    }
  }, [remotePlayersMap, socket]);
  
  // Only render if we have remote players
  if (remotePlayersMap.size === 0) return null;
  
  return (
    <>
      {Array.from(remotePlayersMap.entries()).map(([id, player]) => (
        <RemoteCharacter
          key={id}
          id={id}
          username={player.username}
          position={player.position}
          rotation={player.rotation}
          moving={player.moving}
          colors={player.colors}
          selected={player.selected}
          message={player.message}
        />
      ))}
    </>
  );
};

export default RemoteCharactersManager; 