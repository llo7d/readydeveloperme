/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 helper.glb --transform 
Files: helper.glb [41.96MB] > D:\Code\readydeveloperme\public\helper-transformed.glb [10.2MB] (76%)
*/

import React, { useEffect, useState, useRef, forwardRef } from 'react'
import { useGraph, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

// TypeScript declarations for global variables
/** @typedef {Object} HelperUIConfig
 * @property {Object} badge - Badge configuration
 * @property {Object} badge.position - Badge position values
 * @property {number} badge.position.x - Left/right position
 * @property {number} badge.position.y - Up/down position (height)
 * @property {number} badge.position.z - Forward/back position
 * @property {number} badge.scale - Scale when active
 * @property {Object} chatbox - Chatbox configuration
 * @property {Object} chatbox.position - Position values
 * @property {number} chatbox.position.x - Left/right position
 * @property {number} chatbox.position.y - Up/down position
 * @property {number} chatbox.position.z - Forward/back position
 * @property {number} chatbox.scale - Size scale
 * @property {number} chatbox.width - Width in pixels
 * @property {number} chatbox.height - Height in pixels
 */

// Add global styles to ensure HTML overlays work properly
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  .helper-badge-wrapper {
    pointer-events: auto !important;
    cursor: pointer;
    z-index: 1001 !important;
  }
  
  .helper-badge {
    cursor: pointer !important;
  }
  
  .helper-chatbox-wrapper {
    pointer-events: auto !important;
    z-index: 999 !important;
  }
`;
document.head.appendChild(styleElement);

// Create a global movement control state that can be accessed by the movement controller
window.chatboxOpen = false

// Configurable settings for UI positioning
/** @type {HelperUIConfig} */
window.helperUIConfig = {
  badge: {
    position: {
      x: 0,      // Left/right position
      y: 17,     // Up/down position (height)
      z: 0       // Forward/back position
    },
    scale: 1.1,  // Scale when active
    colors: {
      default: '#666',    // Default color when not near
      near: '#37BA7E',    // Green color when near
      active: '#e74c3c'   // Red color when chatbox is open
    }
  },
  chatbox: {
    position: {
      x: 5,      // Right of character
      y: 15,     // Middle of character
      z: 0       // Same depth as character
    },
    scale: 1.0,  // Size scale
    width: 390,  // Width in pixels
    height: 510  // Height in pixels
  }
}

// Add console helpers for adjusting the UI
console.log("=== Helper UI Configuration Guide ===");
console.log("Badge Position: window.helperUIConfig.badge.position");
console.log("Example: window.helperUIConfig.badge.position.x += 2");
console.log("Example: window.helperUIConfig.badge.position.y -= 1");
console.log("Example: window.helperUIConfig.badge.scale = 1.2");
console.log("Example: window.helperUIConfig.badge.colors.active = '#ff0000'");
console.log("");
console.log("Chatbox Position: window.helperUIConfig.chatbox.position");
console.log("Example: window.helperUIConfig.chatbox.position.y += 1");
console.log("");
console.log("Camera Focus: window.cameraConfig.helperFocus.offset");
console.log("Example: window.cameraConfig.helperFocus.offset.y -= 0.5");
console.log("Example: window.cameraConfig.helperFocus.offset.angle += 0.1");
console.log("Example: window.cameraConfig.helperFocus.distance = 3.0");
console.log("================================");

const HelperCharacter = forwardRef(({ characterRef }, ref) => {
  const group = React.useRef()
  const [isNear, setIsNear] = useState(false)
  const [showChatbox, setShowChatbox] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState([])
  const chatContainerRef = useRef(null)
  const { scene, animations } = useGLTF('/helperCharacter.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)
  
  // Connect the forwarded ref to our group
  React.useImperativeHandle(ref, () => group.current)

  // Set global flag when chatbox state changes
  useEffect(() => {
    console.log("Chatbox state changed:", showChatbox);
    window.chatboxOpen = showChatbox;
    if (showChatbox) {
      console.log("Global chatboxOpen flag set to TRUE");
    } else {
      console.log("Global chatboxOpen flag set to FALSE");
    }
    
    return () => {
      window.chatboxOpen = false;
      console.log("Component unmounted: Global chatboxOpen flag set to FALSE");
    }
  }, [showChatbox])

  // Set up the initial pose (4th pose) and stop animation
  useEffect(() => {
    if (!actions) return;
    
    const animationNames = Object.keys(actions)
    if (animationNames.length >= 4) {
      const fourthAnimation = animationNames[3]
      if (actions[fourthAnimation]) {
        const action = actions[fourthAnimation]
        action.reset()
        action.setEffectiveTimeScale(0)
        action.play()
        action.time = 0.5
      }
    }
  }, [actions])

  // Handle proximity detection
  useEffect(() => {
    if (!characterRef?.current || !group.current) return;
    
    const checkProximity = () => {
      const distance = characterRef.current.position.distanceTo(group.current.position)
      const newIsNear = distance < 5
      setIsNear(newIsNear)
      
      // If user walks away while chatbox is open, close it
      if (showChatbox && !newIsNear) {
        setShowChatbox(false)
        setMessage('')
        setReply([])
      }
    }
    
    // Check proximity every 100ms
    const interval = setInterval(checkProximity, 100)
    return () => clearInterval(interval)
  }, [characterRef, showChatbox])
  
  // Set initial welcome message when chatbox opens
  useEffect(() => {
    if (showChatbox && reply.length === 0) {
      // Add welcome message when chatbox is opened for the first time
      setReply([
        { sender: 'ai', text: "Hi, I'm an AI assistant, how can I help?" }
      ])
    }
  }, [showChatbox, reply.length])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [reply])
  
  // Handle chat submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      // Store user message and AI response
      const userMessage = message
      
      // Add user message immediately
      setReply(prev => [
        ...prev,
        { sender: 'user', text: userMessage }
      ])
      
      // Clear input field
      setMessage('')
      
      // Generate AI response based on user message
      let aiResponse = "Hi, I'm an AI assistant, how can I help?"
      
      // Simple response patterns for a more interactive feel
      const lowerMessage = userMessage.toLowerCase()
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        aiResponse = "Hello there! How can I assist you today?"
      } else if (lowerMessage.includes('how are you')) {
        aiResponse = "I'm doing well, thanks for asking! How can I help you?"
      } else if (lowerMessage.includes('help')) {
        aiResponse = "I'd be happy to help! What do you need assistance with?"
      } else if (lowerMessage.includes('thank')) {
        aiResponse = "You're welcome! Is there anything else you'd like to know?"
      } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        aiResponse = "Goodbye! Feel free to chat again if you need anything."
      }
      
      // Add AI response with a slight delay to simulate thinking
      setTimeout(() => {
        setReply(prev => [
          ...prev,
          { sender: 'ai', text: aiResponse }
        ])
      }, 500)
    }
  }

  // Function to safely close the chatbox
  const closeChatbox = () => {
    console.log("Closing chatbox from shared function");
    // First update state
    setShowChatbox(false);
    setMessage('');
    setReply([]);
    
    // Ensure the global flag is updated immediately
    window.chatboxOpen = false;
    
    // Force camera transition to complete by manipulating camera config temporarily
    if (window.cameraConfig) {
      // Store original values
      const originalDistance = window.cameraConfig.distance;
      const originalTransitionSpeed = window.cameraConfig.helperFocus.transitionSpeed;
      const originalReturnSpeed = window.cameraConfig.returnSpeed;
      
      // Temporarily boost transition speeds for immediate effect
      window.cameraConfig.helperFocus.transitionSpeed = 10;
      window.cameraConfig.returnSpeed = 0.5;
      
      // Temporarily increase distance for more zoom out
      window.cameraConfig.distance = 12.0; // Extra zoom out
      
      // Restore original values after transition completes
      setTimeout(() => {
        window.cameraConfig.helperFocus.transitionSpeed = originalTransitionSpeed;
        window.cameraConfig.returnSpeed = originalReturnSpeed;
        window.cameraConfig.distance = originalDistance;
      }, 500); // Increased from 300ms to 500ms for a longer transition
    }
  }
  
  // Function to safely open the chatbox
  const openChatbox = () => {
    console.log("Opening chatbox from shared function");
    setShowChatbox(true);
    // Ensure the global flag is updated immediately
    window.chatboxOpen = true;
  }

  return (
    <group 
      ref={group} 
      dispose={null} 
      scale={0.14} 
      position={[-5.6, 0, 15]} 
      rotation={[0, Math.PI / 4, 0]}
    >
      {/* Badge above character - only show when not in chat mode */}
      {!showChatbox && (
        <Html
          position={[
            window.helperUIConfig.badge.position.x,
            window.helperUIConfig.badge.position.y,
            window.helperUIConfig.badge.position.z
          ]}
          center
          wrapperClass="helper-badge-wrapper"
          distanceFactor={15}
          onClick={(e) => {
            console.log("HTML Badge wrapper clicked");
            e.stopPropagation();
            if (isNear) {
              console.log("HTML Badge wrapper: Opening chatbox...");
              openChatbox();
            }
          }}
        >
          <button
            className="helper-badge"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Button Badge clicked directly");
              
              if (isNear) {
                console.log("Badge Button: Opening chatbox...");
                openChatbox();
              }
            }}
            style={{
              background: isNear ? window.helperUIConfig.badge.colors.near : window.helperUIConfig.badge.colors.default,
              padding: '7px 12px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: isNear ? `scale(${window.helperUIConfig.badge.scale})` : 'scale(1)',
              cursor: isNear ? 'pointer' : 'default',
              pointerEvents: 'auto',
              zIndex: 1000,
              border: 'none',
              outline: 'none',
            }}
          >
            {isNear ? "Click me to talk" : "AI Helper"}
          </button>
        </Html>
      )}
      
      {/* Stop talking button - only shown when in chat mode */}
      {showChatbox && (
        <Html
          position={[
            window.helperUIConfig.badge.position.x,
            window.helperUIConfig.badge.position.y,
            window.helperUIConfig.badge.position.z
          ]}
          center
          wrapperClass="helper-badge-wrapper"
          distanceFactor={15}
        >
          <button
            className="helper-badge"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Stop Talking button clicked");
              closeChatbox();
            }}
            style={{
              background: window.helperUIConfig.badge.colors.active,
              padding: '7px 12px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              zIndex: 1010,
            }}
          >
            Stop talking
          </button>
        </Html>
      )}
      
      {/* Chatbox popup */}
      {showChatbox && (
        <Html
          position={[
            window.helperUIConfig.chatbox.position.x, 
            window.helperUIConfig.chatbox.position.y, 
            window.helperUIConfig.chatbox.position.z
          ]} 
          wrapperClass="helper-chatbox-wrapper"
          style={{
            width: `${window.helperUIConfig.chatbox.width}px`,
            background: '#2a2a2a',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            padding: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            pointerEvents: 'auto',
            color: 'white',
            zIndex: 999,
          }}
        >
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event propagation
                console.log("X button: Closing chatbox...");
                closeChatbox();
              }}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: window.helperUIConfig.badge.colors.active,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              ✕
            </button>
            
            <div 
              ref={chatContainerRef}
              style={{ 
                height: `${window.helperUIConfig.chatbox.height}px`,
                marginBottom: '10px', 
                padding: '10px',
                background: '#333',
                borderRadius: '8px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {reply.length > 0 ? (
                reply.map((msg, index) => (
                  <div 
                    key={index}
                    style={{ 
                      background: msg.sender === 'ai' ? '#37BA7E' : '#555',
                      padding: '8px 12px', 
                      borderRadius: '12px',
                      marginBottom: '8px',
                      marginLeft: msg.sender === 'ai' ? '0' : 'auto',
                      marginRight: msg.sender === 'ai' ? 'auto' : '0',
                      maxWidth: '80%',
                      color: 'white',
                      alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                      textAlign: msg.sender === 'ai' ? 'left' : 'right',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.text}
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  fontSize: '14px'
                }}>
                  Type a message to start chatting
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #444',
                  outline: 'none',
                  background: '#333',
                  color: 'white',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#37BA7E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Send
              </button>
            </form>
          </div>
        </Html>
      )}
      
      {/* Character model */}
      <group name="Main" onClick={(e) => {
        console.log("Character model clicked, chatbox state:", showChatbox);
        if (isNear && !showChatbox) {
          // Only open the chatbox if it's not already open
          console.log("Character model: Opening chatbox...");
          openChatbox();
        }
      }}>
        {/* Invisible clickable area around character to make clicking easier */}
        <mesh 
          visible={false} 
          position={[0, 10, 0]}
          onClick={(e) => {
            console.log("Invisible click area triggered");
            e.stopPropagation();
            if (isNear && !showChatbox) {
              console.log("Invisible area: Opening chatbox...");
              openChatbox();
            }
          }}
        >
          <boxGeometry args={[15, 20, 15]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        <group name="root">
          <primitive object={nodes.rootx} />
          <primitive object={nodes.HeadphoneRoot} />
          <primitive object={nodes.MacbookRoot} />
          {Object.entries(nodes).map(([key, node]) => {
            if (node.type === 'SkinnedMesh') {
              return (
                <skinnedMesh
                  key={key}
                  name={key}
                  geometry={node.geometry}
                  material={materials[node.material.name]}
                  skeleton={node.skeleton}
                  morphTargetDictionary={node.morphTargetDictionary}
                  morphTargetInfluences={node.morphTargetInfluences}
                  castShadow
                  receiveShadow
                  material-color={
                    (key === 'james_shirt_geo' || key === 'james_cap') 
                      ? isNear ? window.helperUIConfig.badge.colors.near : window.helperUIConfig.badge.colors.default
                      : undefined
                  }
                />
              )
            }
            return null
          })}
        </group>
      </group>
    </group>
  )
})

export default HelperCharacter

useGLTF.preload('/helperCharacter.glb')
