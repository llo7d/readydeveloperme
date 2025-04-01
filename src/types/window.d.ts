import * as THREE from 'three';
import React from 'react';
import { MovementState } from '../components/CharacterControls'; // Assuming MovementState is exported

// Define a comprehensive interface for all custom window properties
interface CustomWindow {
  // Chat visibility functions
  forceHideGameChat?: boolean;
  hideGameMessaging?: boolean;
  hideJoystick?: boolean;
  gameChatConfig?: any;
  chatboxOpen?: boolean;
  inChatTransition?: boolean;
  directlyHideChatUI?: (hide: boolean) => void;
  
  // Camera and UI config
  cameraConfig?: any; 
  helperUIConfig?: any; 
  isColorPickerDragging?: boolean;

  // Helper character interaction functions
  startHelperInteraction?: () => void;
  startClothingShopInteraction?: () => void;
  startBarberShopInteraction?: () => void;
  endCharacterInteraction?: () => void;
  helperAnimations?: { idle: any; talk: any };
  animationTransitionTimeout?: number;

  // Customization state
  isCustomizingClothing?: boolean;

  // Character control functions
  setCharacterPose?: (pose: string) => void;
  setCharacterMovement?: React.Dispatch<React.SetStateAction<MovementState>>;
  chatboxFocused?: boolean;
  characterRef?: React.MutableRefObject<THREE.Group | null>;

  // Responsive sizing functions
  calculateResponsivePositions?: () => void;
  helperUIPositionListenerAdded?: boolean;
  chatResizeListenerAdded?: boolean;

  // Debugging
  logAnimStates?: () => string;
}

// Extend the global Window interface
declare global {
  interface Window extends CustomWindow {}
}

// Export an empty object to make this a module (avoids isolatedModules error)
export {}; 