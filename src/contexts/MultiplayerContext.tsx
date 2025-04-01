import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as THREE from 'three';

// Define the shape of a remote player
interface RemotePlayer {
  id: string;
  username: string;
  position: THREE.Vector3;
  rotation: number;
  moving?: boolean;
  colors?: any; // Will match the color structure in the app
  selected?: Record<string, string>; // Will match the selected items structure
  message?: {
    text: string;
    timestamp: number;
    messageId: string;
  };
}

// Define the context value type
interface MultiplayerContextType {
  socket: Socket | null;
  isConnected: boolean;
  localUsername: string | null;
  remotePlayersMap: Map<string, RemotePlayer>;
  playerCount: number;
  // Debug flags to verify phase 1 completion
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  lastConnectionEvent: string;
  // Phase 2 data
  positionUpdateCount: number;
  appearanceUpdateCount: number;
  // New function for appearance updates
  sendAppearanceUpdate: (colors: any[], selected: Record<string, string>) => void;
  // Phase 3 chat functions
  sendChatMessage: (message: string) => void;
  // Position update function
  sendPositionUpdate: (position: {x: number, z: number, r: number}) => void;
  // Add joinGame function type
  joinGame: (initialAppearance: { colors: any[], selected: Record<string, string> }) => void;
}

// Define props for the Provider, including initialUsername
interface MultiplayerProviderProps {
  children: React.ReactNode;
  initialUsername: string; // Add prop for initial username
}

// Create the context with default values
const MultiplayerContext = createContext<MultiplayerContextType>({
  socket: null,
  isConnected: false,
  localUsername: null,
  remotePlayersMap: new Map(),
  playerCount: 0,
  connectionStatus: 'disconnected',
  lastConnectionEvent: '',
  positionUpdateCount: 0,
  appearanceUpdateCount: 0,
  sendAppearanceUpdate: () => {}, // Default no-op function
  sendChatMessage: () => {}, // Default no-op function
  sendPositionUpdate: () => {}, // Default no-op function
  joinGame: () => {} // Default no-op function for joinGame
});

// Socket.io server URL
const SOCKET_SERVER_URL = 'https://ws.readydeveloper.me';

// Default values for appearance - ensuring 12 items for indices 0-11
export const DEFAULT_COLORS = [
  { subToolId: "tool_2_item_4", color: "#131313" },   // Index 0: Hair -> Set default to black
  { subToolId: "tool_2_item_2", color: "#131313" },   // Index 1: Beard (Based on Character.tsx Beard() using lookup)
  { subToolId: "tool_2_item_3", color: "#d8d8d8" },   // Index 2: Shirt Cuffs (Based on Character.tsx Tshirt() using colors[2])
  { subToolId: "tool_2_item_5", color: "#aabef9" },   // Index 3: Shirt Main (Based on Character.tsx Tshirt() using colors[3])
  { subToolId: "tool_2_item_1", color: "#131313" },   // Index 4: Pants Main (Based on Character.tsx Pants() using colors[4])
  { subToolId: "tool_2_item_6", color: "#768bca" },   // Index 5: Pants Bottom (Based on Character.tsx Pants() using colors[5])
  { subToolId: "tool_2_item_8", color: "#ffffff" },   // Index 6: Pants Belt (Based on Character.tsx Pants() using colors[6])
  { subToolId: "tool_2_item_7", color: "#ffffff" },   // Index 7: Shoes Sole (Based on Character.tsx Shoes() using colors[7]) - Added white default
  { subToolId: "tool_2_item_10", color: "#3a4673" },  // Index 8: Shoes Main 2 (Based on Character.tsx Shoes() using colors[8])
  { subToolId: "tool_2_item_9", color: "#4e5a87" },  // Index 9: Shoes Main 1 (Based on Character.tsx Shoes() using colors[9])
  { subToolId: "tool_2_item_12", color: "#3a4673" }, // Index 10: Watch Belt (Based on Character.tsx Watch() using colors[10])
  { subToolId: "tool_2_item_11", color: "#ffffff" }  // Index 11: Hat (Based on Character.tsx Hat() using colors[11])
];

const DEFAULT_SELECTED = {
  hair: "hair_1",
  beard: "beard_1",
  glasses: "glasses_1",
  logo: "logo_1",
  pose: "pose_character_stop"
};

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children, initialUsername }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remotePlayersMap, setRemotePlayersMap] = useState<Map<string, RemotePlayer>>(new Map());
  const [playerCount, setPlayerCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastConnectionEvent, setLastConnectionEvent] = useState('');
  // Position update counter for Phase 2
  const [positionUpdateCount, setPositionUpdateCount] = useState(0);
  // Appearance update counter for Phase 2
  const [appearanceUpdateCount, setAppearanceUpdateCount] = useState(0);
  const [localUsername, setLocalUsername] = useState<string | null>(null);

  useEffect(() => {
    console.log('Multiplayer: Initializing Socket.IO connection...');
    setConnectionStatus('connecting');

    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: false // Avoid CORS preflight issues
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Multiplayer: Connected to server');
      setIsConnected(true);
      setConnectionStatus('connected');
      setLastConnectionEvent('Connected to server');
      
      // Set the local username state from the prop ON INITIAL CONNECT
      setLocalUsername(initialUsername);
      // Emit the username to the server ON INITIAL CONNECT
      newSocket.emit('setUsername', initialUsername);
      console.log(`Multiplayer: Set initial local username to "${initialUsername}" and emitted to server.`);

      // ---- REMOVE 'join' EMISSION FROM HERE ----
      // const initialPosition = new THREE.Vector3(0, 0, 30); 
      // newSocket.emit('join', { ... }); 
      // ---- END REMOVAL ----
    });

    newSocket.on('connect_error', (error) => {
      console.error('Multiplayer: Connection error:', error.message);
      setConnectionStatus('disconnected');
      setLastConnectionEvent(`Connection error: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Multiplayer: Disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setLastConnectionEvent(`Disconnected: ${reason}`);
    });

    // Remote player events (to be fully implemented in Phase 3)
    newSocket.on('existingUsers', (users: any[]) => {
      console.log('=== PROCESSING EXISTING USERS ===');
      console.log('Multiplayer: Received existing users:', users);
      setLastConnectionEvent(`Received info about ${users.length} existing players`);
      
      // Helper function to ensure unique player objects
      const createUniquePlayerObject = (userData: any) => {
        // Deep copy all state to ensure no reference sharing
        const playerColors = userData.colors 
          ? JSON.parse(JSON.stringify(userData.colors)) 
          : JSON.parse(JSON.stringify(DEFAULT_COLORS));
          
        const playerSelected = userData.selected 
          ? JSON.parse(JSON.stringify(userData.selected)) 
          : JSON.parse(JSON.stringify(DEFAULT_SELECTED));
        
        // Create a new position vector
        const playerPosition = new THREE.Vector3(
          userData.position?.x || 0,
          userData.position?.y || 0,
          userData.position?.z || 0
        );
        
        // Return completely new object with no shared references
        return {
          id: userData.id,
          username: userData.username || `Player_${userData.id.slice(0,4)}`,
          position: playerPosition,
          rotation: userData.rotation || 0,
          moving: userData.moving || false,
          colors: playerColors,
          selected: playerSelected
        };
      };
      
      const newRemotePlayers = new Map<string, RemotePlayer>();
      
      users.forEach(user => {
        console.log(`Processing existing user: ${user.id.slice(0,6)}, Username: ${user.username}`);
        
        if (user.id !== newSocket.id) {
          // Create a completely unique player object with no shared references
          const uniquePlayer = createUniquePlayerObject(user);
          
          // Log the first couple colors to verify
          console.log(`Created player with unique colors: ${JSON.stringify(uniquePlayer.colors.slice(0,2))}`);
          
          // Add to map
          newRemotePlayers.set(user.id, uniquePlayer);
        }
      });
      
      // Verify uniqueness across all players
      if (newRemotePlayers.size > 1) {
        console.log('Verifying uniqueness of all player objects...');
        const players = Array.from(newRemotePlayers.entries());
        
        for (let i = 0; i < players.length; i++) {
          for (let j = i + 1; j < players.length; j++) {
            const [id1, player1] = players[i];
            const [id2, player2] = players[j];
            
            const sharingColorsReference = player1.colors === player2.colors;
            
            if (sharingColorsReference) {
              console.error(`CRITICAL ERROR: Players ${id1.slice(0,6)} and ${id2.slice(0,6)} are sharing colors reference`);
            }
          }
        }
      }
      
      setRemotePlayersMap(newRemotePlayers);
      setPlayerCount(newRemotePlayers.size + 1); // Update count based on map size + self
      console.log(`Finished processing ${newRemotePlayers.size} existing users`);
    });

    newSocket.on('userJoined', (user) => {
      if (user.id === newSocket.id) return; // Ignore self join event
      
      // Enhanced logging for debugging color issues
      console.log(`=== NEW PLAYER JOINED (${user.id.slice(0,6)}) ===`);
      console.log(`Received user data:`, {
        id: user.id.slice(0,6),
        username: user.username,
        hasColors: !!user.colors,
        hasSelected: !!user.selected,
        colorSample: user.colors ? JSON.stringify(user.colors.slice(0, 2)) : 'undefined'
      });
      
      // Log the username received for a joining user
      console.log(`Multiplayer: User joined: ID=${user.id.slice(0,6)}, Received username: ${user.username}`);
      setLastConnectionEvent(`Player joined: ${user.username || user.id}`);
      
      // Add the new player to our map
      setRemotePlayersMap(prevMap => {
        console.log(`Creating map entry for new player ${user.id.slice(0,6)}`);
        console.log(`Current map has ${prevMap.size} players`);
        
        const newMap = new Map(prevMap);
        
        // Helper function to ensure unique player objects
        const createUniquePlayerObject = (userData: any) => {
          // Deep copy all state to ensure no reference sharing
          const playerColors = userData.colors 
            ? JSON.parse(JSON.stringify(userData.colors)) 
            : JSON.parse(JSON.stringify(DEFAULT_COLORS));
            
          const playerSelected = userData.selected 
            ? JSON.parse(JSON.stringify(userData.selected)) 
            : JSON.parse(JSON.stringify(DEFAULT_SELECTED));
          
          // Create a new position vector
          const playerPosition = new THREE.Vector3(
            userData.position?.x || 0,
            userData.position?.y || 0,
            userData.position?.z || 0
          );
          
          // Return completely new object with no shared references
          return {
            id: userData.id,
            username: userData.username || `Player_${userData.id.slice(0,4)}`,
            position: playerPosition,
            rotation: userData.rotation || 0,
            moving: userData.moving || false,
            colors: playerColors,
            selected: playerSelected
          };
        };
        
        // Create a completely unique player object with no shared references
        const uniquePlayer = createUniquePlayerObject(user);
        
        // Log the first couple colors to verify
        console.log(`Created player with unique colors: ${JSON.stringify(uniquePlayer.colors.slice(0,2))}`);
        
        // Add to map
        newMap.set(user.id, uniquePlayer);
        
        setPlayerCount(newMap.size + 1); // Update count based on new map size + self
        console.log(`Updated map now has ${newMap.size} players`);
        
        // Debug: Verify all players in map have unique color references
        if (newMap.size > 1) {
          console.log(`Verifying color uniqueness for ${newMap.size} players...`);
          const players = Array.from(newMap.entries());
          for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
              const [id1, player1] = players[i];
              const [id2, player2] = players[j];
              const sharingReference = player1.colors === player2.colors;
              if (sharingReference) {
                console.error(`!!! CRITICAL: Players ${id1.slice(0,6)} and ${id2.slice(0,6)} are sharing the same colors reference !!!`);
              }
            }
          }
        }
        
        return newMap;
      });
    });

    // Listener for username changes (if using setUsername event)
    newSocket.on('usernameUpdated', (data: { id: string, username: string }) => {
        // Log the username update received from the server
        console.log(`Multiplayer: Received username update for ${data.id.slice(0,6)}: New username="${data.username}"`);
        setRemotePlayersMap(prevMap => {
            const newMap = new Map(prevMap);
            const player = newMap.get(data.id);
            if (player) {
                newMap.set(data.id, { ...player, username: data.username });
            }
            return newMap;
        });
        // Also update local username if it's our own ID
        if (data.id === newSocket.id) {
            setLocalUsername(data.username);
        }
    });

    // Phase 2: Handle position updates
    newSocket.on('userMoved', (positionData) => {
      console.log('Multiplayer: User moved:', positionData.id, {
        x: parseFloat(positionData.position.x.toFixed(2)),
        z: parseFloat(positionData.position.z.toFixed(2)),
        r: parseFloat(positionData.rotation.toFixed(2))
      });
      
      // Update the player's position in our map
      setRemotePlayersMap(prevMap => {
        const newMap = new Map(prevMap);
        const existingPlayer = newMap.get(positionData.id);
        
        if (existingPlayer) {
          // Update existing player
          newMap.set(positionData.id, {
            ...existingPlayer,
            position: new THREE.Vector3(
              positionData.position.x,
              positionData.position.y,
              positionData.position.z
            ),
            rotation: positionData.rotation,
            moving: positionData.moving
          });
        } else {
          // Create new player if doesn't exist - IMPORTANT: Always use deep copied default values
          console.log(`Creating new player from position update (ID: ${positionData.id.slice(0,6)})`);
          
          // Deep copy defaults to ensure uniqueness
          const defaultColors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
          const defaultSelected = JSON.parse(JSON.stringify(DEFAULT_SELECTED));
          
          console.log(`Created unique default colors for new player: ${JSON.stringify(defaultColors.slice(0,2))}`);
          
          newMap.set(positionData.id, {
            id: positionData.id,
            username: `Player_${positionData.id.slice(0,4)}`,
            position: new THREE.Vector3(
              positionData.position.x,
              positionData.position.y,
              positionData.position.z
            ),
            rotation: positionData.rotation,
            moving: positionData.moving,
            colors: defaultColors,  // Use deep copied default colors
            selected: defaultSelected // Use deep copied default selected
          });
        }
        
        return newMap;
      });
      
      // Increment position update counter for testing
      setPositionUpdateCount(prev => prev + 1);
    });

    // Phase 2: Handle appearance updates
    newSocket.on('userAppearanceChanged', (appearanceData) => {
      console.log(`=== APPEARANCE CHANGED (${appearanceData.id.slice(0,6)}) ===`);
      console.log('Multiplayer: User appearance changed:', appearanceData.id);
      
      // Update the player's appearance in our map
      setRemotePlayersMap((prevMap) => {
        console.log(`Updating appearance for player ${appearanceData.id.slice(0,6)}`);
        
        const newMap = new Map(prevMap);
        const player = newMap.get(appearanceData.id);
        
        // Create deep copies of the incoming appearance data
        const updatedColors = appearanceData.colors ? JSON.parse(JSON.stringify(appearanceData.colors)) : null;
        const updatedSelected = appearanceData.selected ? JSON.parse(JSON.stringify(appearanceData.selected)) : null;
        
        console.log(`Created unique appearance for update:`, {
          colorSample: updatedColors ? JSON.stringify(updatedColors.slice(0, 2)) : 'null'
        });
        
        if (player) {
          if (!updatedColors || !updatedSelected) {
            console.warn(`Multiplayer: Received invalid appearance data for ${appearanceData.id.slice(0,6)}`);
            return prevMap; // No change
          }
          
          // Update the specific player's appearance
          const updatedPlayer = {
            ...player,
            colors: updatedColors,
            selected: updatedSelected
          };
          
          newMap.set(appearanceData.id, updatedPlayer);
          setAppearanceUpdateCount(c => c + 1); // Increment counter
          console.log(`Multiplayer: Updated appearance for user ${appearanceData.id.slice(0,6)}`, JSON.stringify(updatedColors.slice(0, 2)));
          
          // Verify this update isn't somehow affecting other players' colors
          const otherPlayers = Array.from(newMap.entries()).filter(([id]) => id !== appearanceData.id);
          
          for (const [otherId, otherPlayer] of otherPlayers) {
            const sharingReference = updatedPlayer.colors === otherPlayer.colors;
            if (sharingReference) {
              console.error(`!!! CRITICAL: After appearance update, player ${appearanceData.id.slice(0,6)} and ${otherId.slice(0,6)} are sharing the same colors reference !!!`);
            }
          }
        } else {
          // Handle unlikely case of appearance update for unknown player
          console.warn(`Multiplayer: Received appearance update for unknown player ${appearanceData.id.slice(0,6)}`);
          
          if (!updatedColors || !updatedSelected) {
            return prevMap; // No change
          }
          
          // Create new player with the received appearance
          newMap.set(appearanceData.id, {
            id: appearanceData.id,
            username: `Player_${appearanceData.id.slice(0,4)}`,
            position: new THREE.Vector3(0, 0, 0),
            rotation: 0,
            moving: false,
            colors: updatedColors,
            selected: updatedSelected
          });
        }
        
        return newMap;
      });
    });

    newSocket.on('userLeft', (userId) => {
      console.log('Multiplayer: User left:', userId);
      setLastConnectionEvent(`Player left: ${userId}`);
      setPlayerCount(prev => Math.max(0, prev - 1));
      
      // Remove the player from our map
      setRemotePlayersMap(prevMap => {
        const newMap = new Map(prevMap);
        const deleted = newMap.delete(userId);
        if (deleted) {
            setPlayerCount(newMap.size + 1); // Update count after deletion
        }
        return newMap;
      });
    });

    // Phase 3: Handle chat messages
    newSocket.on('chatMessage', (messageData) => {
      console.log('Multiplayer: Chat message received:', messageData.id, messageData.message.text);
      
      // Extract pose from message if present
      const poseMatch = messageData.message.text.match(/^@([A-Za-z]+)\s+(.*)$/);
      let pose: string | null = null;
      let messageText = messageData.message.text;
      
      if (poseMatch) {
        // The message contains a pose
        pose = poseMatch[1]; // The pose name (e.g., "Waving")
        messageText = poseMatch[2]; // The clean message without the pose tag
        
        console.log('Multiplayer: Message contains pose:', pose);
      }
      
      // Update the player with the message
      setRemotePlayersMap(prevMap => {
        const newMap = new Map(prevMap);
        const existingPlayer = newMap.get(messageData.id);
        
        if (existingPlayer) {
          // If the message has a pose, also update the player's selected pose
          if (pose) {
            // Convert pose name to pose_name format (e.g., "Waving" -> "pose_waving")
            const formattedPose = `pose_${pose.toLowerCase()}`;
            
            // Update existing player with new message and pose
            newMap.set(messageData.id, {
              ...existingPlayer,
              message: {
                ...messageData.message,
                text: messageText // Use the clean message text without the pose tag
              },
              // Also update the selected pose
              selected: {
                ...existingPlayer.selected,
                pose: formattedPose
              }
            });
            
            // Set a timeout to revert the pose after 5 seconds
            setTimeout(() => {
              setRemotePlayersMap(currentMap => {
                const updatedMap = new Map(currentMap);
                const player = updatedMap.get(messageData.id);
                
                if (player && player.selected?.pose === formattedPose) {
                  // Only revert if the pose hasn't been changed by another message
                  updatedMap.set(messageData.id, {
                    ...player,
                    selected: {
                      ...player.selected,
                      pose: "pose_crossed_arm" // Default pose
                    }
                  });
                }
                
                return updatedMap;
              });
            }, 5000);
          } else {
            // Just update the message without changing the pose
            newMap.set(messageData.id, {
              ...existingPlayer,
              message: messageData.message
            });
          }
        }
        
        return newMap;
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Multiplayer: Disconnecting socket');
      newSocket.off('usernameUpdated');
      newSocket.disconnect();
    };
  }, []);

  // NEW useEffect: Specifically handle updates to initialUsername *after* connection
  useEffect(() => {
    if (socket && isConnected && initialUsername && initialUsername !== localUsername) {
      console.log(`Multiplayer: initialUsername prop changed to "${initialUsername}" after connection. Updating server.`);
      setLocalUsername(initialUsername);
      socket.emit('setUsername', initialUsername);
    }
    // This effect runs when initialUsername changes *after* the socket is connected
  }, [initialUsername, socket, isConnected, localUsername]);

  // Function to send appearance updates to the server
  const sendAppearanceUpdate = useCallback((colors: any[], selected: Record<string, string>) => {
    if (socket && isConnected) {
      console.log('Multiplayer: Sending appearance update', { colors, selected });
      socket.emit('updateAppearance', { colors, selected });
    } else {
      console.warn('Multiplayer: Cannot send appearance update - not connected');
    }
  }, [socket, isConnected]);

  // Function to send chat messages
  const sendChatMessage = useCallback((message: string) => {
    if (socket && isConnected && message.trim()) {
      console.log('Multiplayer: Sending chat message:', message);
      socket.emit('sendMessage', message);
    } else {
      console.warn('Multiplayer: Cannot send chat message - not connected or empty message');
    }
  }, [socket, isConnected]);

  // Function to send position updates to the server
  const sendPositionUpdate = useCallback((position: {x: number, z: number, r: number}) => {
    if (socket && isConnected) {
      console.log('Multiplayer: Sending position update', position);
      socket.emit('updatePosition', {
        position: {
          x: position.x,
          y: 0, // Y is always 0 in this application
          z: position.z
        },
        rotation: position.r,
        moving: false // We're not moving when manually setting position
      });
    } else {
      console.warn('Multiplayer: Cannot send position update - not connected');
    }
  }, [socket, isConnected]);

  // Function to emit the join event with actual appearance data
  const joinGame = useCallback((initialAppearance: { colors: any[], selected: Record<string, string> }) => {
    if (socket && isConnected) {
      // Deep copy the appearance data to prevent reference sharing
      const colorsCopy = JSON.parse(JSON.stringify(initialAppearance.colors)); 
      const selectedCopy = JSON.parse(JSON.stringify(initialAppearance.selected));
      
      console.log('Multiplayer: Emitting join event with appearance:', {
        colors: colorsCopy.slice(0, 2), // Log first two colors for brevity
        selected: selectedCopy
      });
      
      const initialPosition = new THREE.Vector3(0, 0, 30); // Use default starting position for now
      socket.emit('join', {
        position: { x: initialPosition.x, y: initialPosition.y, z: initialPosition.z },
        rotation: Math.PI, // Default facing toward the shop
        colors: colorsCopy, // Send deep copied colors
        selected: selectedCopy // Send deep copied selected
      });
    } else {
      console.warn('Multiplayer: Cannot join game - socket not connected.');
    }
  }, [socket, isConnected]);

  // The context value to be provided
  const contextValue = {
    socket,
    isConnected,
    localUsername,
    remotePlayersMap,
    playerCount,
    connectionStatus,
    lastConnectionEvent,
    positionUpdateCount,
    appearanceUpdateCount,
    sendAppearanceUpdate,
    sendChatMessage,
    sendPositionUpdate,
    joinGame
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
};

// Custom hook to use the multiplayer context
export const useMultiplayer = () => useContext(MultiplayerContext); 