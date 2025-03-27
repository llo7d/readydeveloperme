import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterMessageProps {
  characterRef: React.RefObject<THREE.Group>;
}

const CharacterMessage = ({ characterRef }: CharacterMessageProps) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  // Setup message handler on window
  useEffect(() => {
    window.showMessage = (newMessage: string) => {
      setMessage(newMessage);
      setVisible(true);
      
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };
    
    return () => {
      window.showMessage = undefined;
    };
  }, []);
  
  // Update message position to follow character on each frame
  useFrame(() => {
    if (visible && groupRef.current && characterRef.current) {
      // Copy the character position to the message group
      groupRef.current.position.copy(characterRef.current.position);
    }
  });
  
  if (!visible || !message) return null;
  
  return (
    <group ref={groupRef}>
      <Html
        position={[0, 2.4, 0]}
        center
        as="div"
        className="pointer-events-none"
        distanceFactor={10}
      >
        <div className="bg-white text-black px-4 py-2 rounded-xl shadow-lg text-center whitespace-normal"
             style={{ 
               minWidth: message.length < 10 ? '100px' : '160px',
               maxWidth: '300px',
               width: 'auto',
               wordSpacing: '0.05em',
               lineHeight: '1.3',
               whiteSpace: 'normal',
               wordWrap: 'break-word'
             }}>
          <p className="text-base font-medium">{message}</p>
        </div>
      </Html>
    </group>
  );
};

export default CharacterMessage; 