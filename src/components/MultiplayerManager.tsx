import React, { useEffect, useState } from 'react';
import { useMultiplayer } from '../contexts/MultiplayerContext';

interface MultiplayerManagerProps {
  visible?: boolean;
}

const MultiplayerManager: React.FC<MultiplayerManagerProps> = ({ visible = true }) => {
  const { 
    isConnected, 
    connectionStatus, 
    lastConnectionEvent, 
    playerCount, 
    remotePlayersMap,
    positionUpdateCount,
    appearanceUpdateCount
  } = useMultiplayer();

  // Track appearance update changes for visual feedback
  const [lastAppearanceCount, setLastAppearanceCount] = useState(0);
  const [showAppearanceUpdate, setShowAppearanceUpdate] = useState(false);
  
  // Add state for button clicks
  const [showColorClicked, setShowColorClicked] = useState(false);
  const [showItemClicked, setShowItemClicked] = useState(false);
  
  // Listen for color and item change events
  useEffect(() => {
    // Create event listeners for our custom events
    const handleColorClick = () => {
      setShowColorClicked(true);
      setTimeout(() => setShowColorClicked(false), 800);
    };
    
    const handleItemClick = () => {
      setShowItemClicked(true);
      setTimeout(() => setShowItemClicked(false), 800);
    };
    
    // Add event listeners
    window.addEventListener('mp:colorChange', handleColorClick);
    window.addEventListener('mp:itemChange', handleItemClick);
    
    // Clean up
    return () => {
      window.removeEventListener('mp:colorChange', handleColorClick);
      window.removeEventListener('mp:itemChange', handleItemClick);
    };
  }, []);
  
  // Flash an indicator when appearance updates come in
  useEffect(() => {
    if (appearanceUpdateCount > lastAppearanceCount) {
      setLastAppearanceCount(appearanceUpdateCount);
      setShowAppearanceUpdate(true);
      
      // Clear the highlight after 2 seconds
      const timer = setTimeout(() => {
        setShowAppearanceUpdate(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [appearanceUpdateCount, lastAppearanceCount]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px',
        display: visible ? 'block' : 'none', // Hide the entire component when not visible
      }}
    >
      {/* Multiplayer Status UI - Temporarily commented out
      <div style={{ marginBottom: '5px' }}>
        <strong>Multiplayer Status:</strong>{' '}
        <span style={{ 
          color: connectionStatus === 'connected' ? '#4CAF50' : 
                 connectionStatus === 'connecting' ? '#FFC107' : '#F44336'
        }}>
          {connectionStatus}
        </span>
      </div>

      {lastConnectionEvent && (
        <div style={{ marginBottom: '5px' }}>
          <strong>Last Event:</strong> {lastConnectionEvent}
        </div>
      )}

      <div style={{ marginBottom: '5px' }}>
        <strong>Players Online:</strong> {playerCount}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Position Updates:</strong> {positionUpdateCount}
      </div>

      <div 
        style={{ 
          marginBottom: '5px',
          background: showAppearanceUpdate ? 'rgba(75, 181, 67, 0.4)' : 'transparent',
          padding: showAppearanceUpdate ? '3px 5px' : '0',
          borderRadius: '3px',
          transition: 'background-color 0.3s ease'
        }}
      >
        <strong>Appearance Updates:</strong> {appearanceUpdateCount} 
        {showAppearanceUpdate && <span style={{ marginLeft: '5px', color: '#4CAF50' }}>✓ New</span>}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
        <div style={{ 
          padding: '2px 5px', 
          borderRadius: '3px',
          fontSize: '10px',
          background: showColorClicked ? 'rgba(255, 193, 7, 0.4)' : 'transparent',
          transition: 'background-color 0.3s ease'
        }}>
          <strong>Color Changed</strong>
        </div>
        <div style={{ 
          padding: '2px 5px', 
          borderRadius: '3px',
          fontSize: '10px',
          background: showItemClicked ? 'rgba(33, 150, 243, 0.4)' : 'transparent',
          transition: 'background-color 0.3s ease'
        }}>
          <strong>Item Changed</strong>
        </div>
      </div>

      {remotePlayersMap.size > 0 && (
        <div style={{ marginBottom: '5px' }}>
          <strong>Remote Players:</strong>
          <ul style={{ 
            margin: '5px 0 0 0', 
            padding: '0 0 0 15px', 
            fontSize: '10px', 
            maxHeight: '80px', 
            overflowY: 'auto'
          }}>
            {Array.from(remotePlayersMap.entries()).map(([id, player]) => (
              <li key={id} style={{ marginBottom: '3px' }}>
                <div>{id.slice(0, 6)}... 
                  <span style={{ opacity: 0.7 }}> - Pos: ({player.position.x.toFixed(1)}, {player.position.z.toFixed(1)})</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {player.moving && 
                    <span style={{ color: '#64B5F6' }}>Moving</span>
                  }
                  {player.colors && 
                    <span style={{ 
                      color: '#81C784',
                      fontWeight: 'bold' 
                    }}>
                      Customized
                    </span>
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
        {isConnected ? 'Connected to websocket server' : 'Not connected'}
      </div>
      */}
    </div>
  );
};

export default MultiplayerManager; 