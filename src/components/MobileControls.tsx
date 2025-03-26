import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

interface MobileControlsProps {
  onMove: (direction: 'forward' | 'none') => void;
  onTurn: (direction: 'left' | 'right' | 'none') => void;
  onRun: (isRunning: boolean) => void;
}

const mobileControlsStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '20px',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  pointerEvents: 'none',
};

const controlButtonStyle: React.CSSProperties = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(4px)',
  border: '2px solid rgba(255, 255, 255, 0.5)',
  color: 'white',
  margin: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  transition: 'transform 0.1s ease-out, background 0.1s ease-out',
  cursor: 'pointer',
  outline: 'none',
};

const activeButtonStyle: React.CSSProperties = {
  ...controlButtonStyle,
  background: 'rgba(255, 255, 255, 0.4)',
  transform: 'scale(1.1)',
};

const forwardButtonStyle: React.CSSProperties = {
  ...controlButtonStyle,
  position: 'absolute',
  bottom: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
};

const activeForwardButtonStyle: React.CSSProperties = {
  ...forwardButtonStyle,
  background: 'rgba(255, 255, 255, 0.4)',
  transform: 'translateX(-50%) scale(1.1)',
};

const leftButtonStyle: React.CSSProperties = {
  ...controlButtonStyle,
  position: 'absolute',
  bottom: '20px',
  left: 'calc(50% - 80px)',
};

const activeLeftButtonStyle: React.CSSProperties = {
  ...leftButtonStyle,
  background: 'rgba(255, 255, 255, 0.4)',
  transform: 'scale(1.1)',
};

const rightButtonStyle: React.CSSProperties = {
  ...controlButtonStyle,
  position: 'absolute',
  bottom: '20px',
  right: 'calc(50% - 80px)',
};

const activeRightButtonStyle: React.CSSProperties = {
  ...rightButtonStyle,
  background: 'rgba(255, 255, 255, 0.4)',
  transform: 'scale(1.1)',
};

const runButtonStyle: React.CSSProperties = {
  ...controlButtonStyle,
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  background: 'rgba(52, 152, 219, 0.4)',
};

const activeRunButtonStyle: React.CSSProperties = {
  ...runButtonStyle,
  background: 'rgba(52, 152, 219, 0.7)',
  transform: 'scale(1.1)',
};

const svgStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
};

const MobileControls: React.FC<MobileControlsProps> = ({ onMove, onTurn, onRun }) => {
  const isMobileScreen = useMediaQuery({ query: '(max-width: 768px)' });
  const isTabletScreen = useMediaQuery({ query: '(max-width: 1024px)' });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Button active states
  const [forwardActive, setForwardActive] = useState(false);
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [runActive, setRunActive] = useState(false);

  // Detect if device has touch capability
  useEffect(() => {
    const detectTouch = () => {
      const hasTouchScreen = (
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
      setIsTouchDevice(hasTouchScreen);
    };
    
    detectTouch();
    
    // Also listen for touch events to detect mid-session
    const touchHandler = () => {
      if (!isTouchDevice) {
        setIsTouchDevice(true);
        window.removeEventListener('touchstart', touchHandler);
      }
    };
    
    window.addEventListener('touchstart', touchHandler);
    
    return () => {
      window.removeEventListener('touchstart', touchHandler);
    };
  }, [isTouchDevice]);
  
  // Show controls on mobile devices or touch devices
  useEffect(() => {
    setShowControls(isMobileScreen || isTabletScreen || isTouchDevice);
  }, [isMobileScreen, isTabletScreen, isTouchDevice]);

  // Don't render anything if we don't need to show controls
  if (!showControls) return null;

  return (
    <div style={mobileControlsStyle}>
      {/* Forward button */}
      <button
        style={forwardActive ? activeForwardButtonStyle : forwardButtonStyle}
        onTouchStart={() => {
          setForwardActive(true);
          onMove('forward');
        }}
        onTouchEnd={() => {
          setForwardActive(false);
          onMove('none');
        }}
        onMouseDown={() => {
          setForwardActive(true);
          onMove('forward');
        }}
        onMouseUp={() => {
          setForwardActive(false);
          onMove('none');
        }}
        onMouseLeave={() => {
          setForwardActive(false);
          onMove('none');
        }}
      >
        <svg style={svgStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
      </button>

      {/* Turn left button */}
      <button
        style={leftActive ? activeLeftButtonStyle : leftButtonStyle}
        onTouchStart={() => {
          setLeftActive(true);
          onTurn('left');
        }}
        onTouchEnd={() => {
          setLeftActive(false);
          onTurn('none');
        }}
        onMouseDown={() => {
          setLeftActive(true);
          onTurn('left');
        }}
        onMouseUp={() => {
          setLeftActive(false);
          onTurn('none');
        }}
        onMouseLeave={() => {
          setLeftActive(false);
          onTurn('none');
        }}
      >
        <svg style={svgStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 7l-5 5 5 5V7z" />
        </svg>
      </button>

      {/* Turn right button */}
      <button
        style={rightActive ? activeRightButtonStyle : rightButtonStyle}
        onTouchStart={() => {
          setRightActive(true);
          onTurn('right');
        }}
        onTouchEnd={() => {
          setRightActive(false);
          onTurn('none');
        }}
        onMouseDown={() => {
          setRightActive(true);
          onTurn('right');
        }}
        onMouseUp={() => {
          setRightActive(false);
          onTurn('none');
        }}
        onMouseLeave={() => {
          setRightActive(false);
          onTurn('none');
        }}
      >
        <svg style={svgStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 7l5 5-5 5V7z" />
        </svg>
      </button>

      {/* Run button */}
      <button
        style={runActive ? activeRunButtonStyle : runButtonStyle}
        onTouchStart={() => {
          setRunActive(true);
          onRun(true);
        }}
        onTouchEnd={() => {
          setRunActive(false);
          onRun(false);
        }}
        onMouseDown={() => {
          setRunActive(true);
          onRun(true);
        }}
        onMouseUp={() => {
          setRunActive(false);
          onRun(false);
        }}
        onMouseLeave={() => {
          setRunActive(false);
          onRun(false);
        }}
      >
        <svg style={svgStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
        </svg>
      </button>
    </div>
  );
};

export default MobileControls; 