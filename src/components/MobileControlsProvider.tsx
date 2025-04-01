import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';

// Redefine MovementState to match CharacterControls
interface MovementState {
  forward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  running: boolean;
}

// Add global declaration for TypeScript
declare global {
  interface Window {
    setCharacterMovement?: React.Dispatch<React.SetStateAction<MovementState>>;
    hideJoystick?: boolean;
  }
}

// Container styles
const mobileControlsStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1000,
  pointerEvents: 'none',
  height: '180px',
  padding: '0 20px 20px 20px',
};

// Joystick styles
const joystickContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'auto',
  touchAction: 'none',
};

const joystickStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.7)',
  position: 'absolute',
  transition: 'transform 0.1s ease-out',
};

const MobileControlsProvider: React.FC = () => {
  const isMobileScreen = useMediaQuery({ query: '(max-width: 768px)' });
  const isTabletScreen = useMediaQuery({ query: '(max-width: 1024px)' });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [joystickHidden, setJoystickHidden] = useState(false);
  
  // Joystick state
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [initialTouchPos, setInitialTouchPos] = useState({ x: 0, y: 0 });
  const joystickBounds = useRef({ radius: 35 });

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

  // Check if joystick should be hidden (when in chatbox, etc.)
  useEffect(() => {
    const checkJoystickVisibility = () => {
      setJoystickHidden(window.hideJoystick === true);
    };
    
    // Check immediately and set up interval
    checkJoystickVisibility();
    const interval = setInterval(checkJoystickVisibility, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Movement handlers - updates the window.setCharacterMovement function
  const updateMovement = (newState: Partial<MovementState>) => {
    if (window.setCharacterMovement && typeof window.setCharacterMovement === 'function') {
      window.setCharacterMovement(prevState => ({
        ...prevState,
        ...newState
      }));
    }
  };

  // Handle joystick touch/drag start
  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setJoystickActive(true);

    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
      
      // Add window listeners for mouse events
      window.addEventListener('mousemove', handleJoystickMove as any);
      window.addEventListener('mouseup', handleJoystickEnd as any);
    }

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setInitialTouchPos({ x: centerX, y: centerY });
      setJoystickPosition({ x: 0, y: 0 }); // Reset position
    }
  };

  // Handle joystick movement
  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return;

    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate the distance from the initial position
    const deltaX = clientX - initialTouchPos.x;
    const deltaY = clientY - initialTouchPos.y;
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Limit the joystick movement to the container bounds
    const maxDistance = joystickBounds.current.radius;
    const limitedDistance = Math.min(distance, maxDistance);
    
    // Calculate the angle
    const angle = Math.atan2(deltaY, deltaX);
    
    // Calculate the limited position
    const limitedX = limitedDistance * Math.cos(angle);
    const limitedY = limitedDistance * Math.sin(angle);
    
    setJoystickPosition({ x: limitedX, y: limitedY });
    
    // Determine movement direction
    // - Forward/backward based on Y position
    // - Turn left/right based on X position
    const forward = limitedY < -10;
    const turnLeft = limitedX < -10;
    const turnRight = limitedX > 10;
    
    updateMovement({
      forward,
      turnLeft,
      turnRight
    });
  };

  // Handle joystick release
  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    
    // Reset all movement states
    updateMovement({
      forward: false,
      turnLeft: false,
      turnRight: false
    });
    
    // Remove window listeners for mouse events
    window.removeEventListener('mousemove', handleJoystickMove as any);
    window.removeEventListener('mouseup', handleJoystickEnd as any);
  };

  // Don't render anything if we don't need to show controls or if joystick is hidden
  if (!showControls || joystickHidden) return null;

  return (
    <div style={mobileControlsStyle}>
      {/* Virtual joystick */}
      <div 
        ref={joystickRef}
        style={joystickContainerStyle}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onMouseDown={handleJoystickStart}
      >
        <div 
          ref={knobRef}
          style={{
            ...joystickStyle,
            transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
          }}
        />
      </div>
    </div>
  );
};

export default MobileControlsProvider; 