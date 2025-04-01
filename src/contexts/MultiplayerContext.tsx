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
  sendPositionUpdate: () => {} // Default no-op function
});

// Socket.io server URL
const SOCKET_SERVER_URL = 'https://ws.readydeveloper.me';

// Default values for appearance
const DEFAULT_COLORS = [
  { subToolId: "tool_2_item_1", color: "#131313" }, // Pants main
  { subToolId: "tool_2_item_2", color: "#131313" }, // Beard
  { subToolId: "tool_2_item_3", color: "#d8d8d8" }, // Hat
  { subToolId: "tool_2_item_4", color: "#ffffff" }, // Hair
  { subToolId: "tool_2_item_5", color: "#aabef9" }, // Shirt
  { subToolId: "tool_2_item_6", color: "#768bca" }, // Shoes
  { subToolId: "tool_2_item_8", color: "#ffffff" }, 
  { subToolId: "tool_2_item_9", color: "#4e5a87" },
  { subToolId: "tool_2_item_10", color: "#3a4673" },
  { subToolId: "tool_2_item_11", color: "#ffffff" },
  { subToolId: "tool_2_item_12", color: "#3a4673" }
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

      // Send initial player data when joining
      const initialPosition = new THREE.Vector3(0, 0, 30); // Default starting position
      newSocket.emit('join', {
        position: { x: initialPosition.x, y: initialPosition.y, z: initialPosition.z },
        rotation: Math.PI, // Default facing toward the shop
        // Use default appearance values instead of null
        colors: DEFAULT_COLORS,
        selected: DEFAULT_SELECTED
      });
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
      console.log('Multiplayer: Received existing users:', users);
      setLastConnectionEvent(`Received info about ${users.length} existing players`);
      
      const newRemotePlayers = new Map<string, RemotePlayer>();
      users.forEach(user => {
        // Log the username received for each existing user
        console.log(` -> Existing user: ${user.id.slice(0,6)}, Received username: ${user.username}`);
        if (user.id !== newSocket.id) { // Don't add self to remote players
            newRemotePlayers.set(user.id, {
              id: user.id,
              // Use fallback if username is missing
              username: user.username || `Player_${user.id.slice(0,4)}`,
              position: new THREE.Vector3(
                user.position?.x || 0,
                user.position?.y || 0,
                user.position?.z || 0
              ),
              rotation: user.rotation || 0,
              moving: user.moving || false,
              colors: user.colors || DEFAULT_COLORS,
              selected: user.selected || DEFAULT_SELECTED
            });
        }
      });
      setRemotePlayersMap(newRemotePlayers);
      setPlayerCount(newRemotePlayers.size + 1); // Update count based on map size + self
    });

    newSocket.on('userJoined', (user) => {
      if (user.id === newSocket.id) return; // Ignore self join event
      // Log the username received for a joining user
      console.log(`Multiplayer: User joined: ID=${user.id.slice(0,6)}, Received username: ${user.username}`);
      setLastConnectionEvent(`Player joined: ${user.username || user.id}`);
      
      // Add the new player to our map
      setRemotePlayersMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(user.id, {
          id: user.id,
          username: user.username || `Player_${user.id.slice(0,4)}`,
          position: new THREE.Vector3(
            user.position?.x || 0,
            user.position?.y || 0,
            user.position?.z || 0
          ),
          rotation: user.rotation || 0,
          moving: user.moving || false,
          colors: user.colors || DEFAULT_COLORS,
          selected: user.selected || DEFAULT_SELECTED
        });
        setPlayerCount(newMap.size + 1); // Update count based on new map size + self
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
          // Create new player if doesn't exist
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
            colors: DEFAULT_COLORS,
            selected: DEFAULT_SELECTED
          });
        }
        
        return newMap;
      });
      
      // Increment position update counter for testing
      setPositionUpdateCount(prev => prev + 1);
    });

    // Phase 2: Handle appearance updates
    newSocket.on('userAppearanceChanged', (appearanceData) => {
      console.log('Multiplayer: User appearance changed:', appearanceData.id);
      
      // Update the player's appearance in our map
      setRemotePlayersMap(prevMap => {
        const newMap = new Map(prevMap);
        const existingPlayer = newMap.get(appearanceData.id);
        
        if (existingPlayer) {
          // Update existing player
          newMap.set(appearanceData.id, {
            ...existingPlayer,
            colors: appearanceData.colors,
            selected: appearanceData.selected
          });
        } else {
          // Create new player if doesn't exist
          newMap.set(appearanceData.id, {
            id: appearanceData.id,
            username: `Player_${appearanceData.id.slice(0,4)}`,
            position: new THREE.Vector3(0, 0, 0),
            rotation: 0,
            moving: false,
            colors: appearanceData.colors,
            selected: appearanceData.selected
          });
        }
        
        return newMap;
      });
      
      // Increment appearance update counter for testing
      setAppearanceUpdateCount(prev => prev + 1);
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
    sendPositionUpdate
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
};

// Custom hook to use the multiplayer context
export const useMultiplayer = () => useContext(MultiplayerContext); 