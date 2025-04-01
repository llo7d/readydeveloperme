import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import RotatingCube from './RotatingCube';

const RotatingCubePage: React.FC = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#888888',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 1, 1]} intensity={0.5} />
        <RotatingCube />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100
      }}>
        <Link to="/" style={{
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontFamily: 'Arial, sans-serif'
        }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default RotatingCubePage; 