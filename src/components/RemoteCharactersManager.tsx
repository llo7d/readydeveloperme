import React, { useEffect } from 'react';
import { useMultiplayer } from '../contexts/MultiplayerContext';
import RemoteCharacter from './RemoteCharacter';

const RemoteCharactersManager: React.FC = () => {
  const { remotePlayersMap } = useMultiplayer();
  
  // Log when remote players change to help with debugging
  useEffect(() => {
    console.log(`Remote players updated: ${remotePlayersMap.size} players found`);
    if (remotePlayersMap.size > 0) {
      console.log('Remote player IDs:', Array.from(remotePlayersMap.keys()));
    }
  }, [remotePlayersMap.size]);
  
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
        />
      ))}
    </>
  );
};

export default RemoteCharactersManager; 