import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { useMultiplayer } from '../contexts/MultiplayerContext';
import { useMediaQuery } from 'react-responsive';

// Add TypeScript declaration for the global window property
declare global {
  interface Window {
    chatboxFocused: boolean;
    setCharacterPose?: (pose: string) => void;
    showMessage?: (message: string) => void;
    hideGameMessaging: boolean;
    gameChatConfig: any;
    forceHideGameChat: boolean;
    chatboxOpen: boolean;
  }
}

// List of available poses with their display names
const AVAILABLE_POSES = [
  { id: "CrossedArm", display: "Crossed Arm" },
  { id: "Confident", display: "Confident" },
  { id: "Confused", display: "Confused" },
  { id: "PointingDown", display: "Pointing Down" },
  { id: "PointingLeft", display: "Pointing Left" },
  { id: "PointingRight", display: "Pointing Right" },
  { id: "PointingUp", display: "Pointing Up" },
  { id: "SittingHappy", display: "Sitting Happy" },
  { id: "SittingSad", display: "Sitting Sad" },
  { id: "StandingSad", display: "Standing Sad" },
  { id: "Waving", display: "Waving" },
  { id: "Welcome", display: "Welcome" }
];

const Chatbox = () => {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<typeof AVAILABLE_POSES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useStore((state) => state.theme);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendChatMessage } = useMultiplayer();
  
  // Add this line to detect mobile view
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Get position and style from gameChatConfig if available
  const getChatPosition = () => {
    if (window.gameChatConfig) {
      return isMobile 
        ? window.gameChatConfig.position.mobile 
        : window.gameChatConfig.position.desktop;
    }
    
    // Fallback if config not available
    return isMobile 
      ? { bottom: '20px', left: '50%' } 
      : { bottom: '20px', left: '50%' };
  };
  
  // Get width from gameChatConfig if available
  const getChatWidth = () => {
    if (window.gameChatConfig?.size?.width) {
      const widthValue = isMobile 
        ? window.gameChatConfig.size.width.mobile 
        : window.gameChatConfig.size.width.desktop;
      
      // Handle special 'fullWidth' value for mobile responsive sizing
      if (widthValue === 'fullWidth' && isMobile) {
        return window.innerWidth - 40; // 20px margin on each side
      }
      
      return widthValue;
    }
    
    // Fallback if config not available
    return isMobile ? 300 : 380;
  };
  
  // Determine if messaging should be hidden
  const isMessagingHidden = () => {
    // Check for force hide flag first (highest priority)
    if (window.forceHideGameChat) {
      console.log("Chat hidden: forceHideGameChat=true");
      return true;
    }
    
    // Check if helper character chatbox is open
    if (window.chatboxOpen) {
      console.log("Chat hidden: Helper character chatbox is open");
      return true;
    }
    
    // Then check for shop/character interaction flag
    if (window.hideGameMessaging) {
      console.log("Chat hidden: hideGameMessaging=true");
      return true;
    }
    
    // Then check for the gameChatConfig visibility (lowest priority)
    if (window.gameChatConfig?.visible === false) {
      console.log("Chat hidden: gameChatConfig.visible=false");
      return true;
    }
    
    return false;
  };

  // Extract pose and actual message from a message string
  const extractPoseAndMessage = (fullMessage: string): { pose: string | null, message: string } => {
    // Default return values
    let pose: string | null = null;
    let message = fullMessage;
    
    // Find any @pose tag in the message
    const poseMatch = fullMessage.match(/@([A-Za-z]+)/);
    
    if (poseMatch) {
      // Get the pose name without the @ symbol
      const poseName = poseMatch[1];
      
      // Check if the pose exists in our available poses
      const selectedPose = AVAILABLE_POSES.find(pose => 
        pose.id.toLowerCase() === poseName.toLowerCase()
      );
      
      if (selectedPose) {
        pose = selectedPose.id;
        
        // Remove the pose tag from the message
        message = fullMessage.replace(poseMatch[0], '').trim();
      }
    }
    
    // Limit message to 12 words
    message = message.split(' ').slice(0, 12).join(' ');
    
    return { pose, message };
  };

  // Process the message - handle pose command and extract actual message
  const processMessage = (fullMessage: string) => {
    // Extract pose and actual message
    const { pose, message } = extractPoseAndMessage(fullMessage);
    
    // Apply pose if found
    if (pose && window.setCharacterPose) {
      window.setCharacterPose(pose);
    }
    
    // Show message above character if there's actual content
    if (message) {
      // Show message locally above character
      if (window.showMessage) {
        window.showMessage(message);
      }
      
      // Construct message content for server
      // For the remote player, send both the message and pose info
      const messageToSend = pose ? `@${pose} ${message}` : message;
      
      // Send message to all connected players
      sendChatMessage(messageToSend);
    }
  };

  // Update suggestions when message changes - check for @ anywhere in text
  useEffect(() => {
    // Find the position of the last @ symbol
    const lastAtIndex = message.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Get the text after the @ symbol up to the next space or end of string
      const afterAt = message.substring(lastAtIndex + 1);
      const nextSpaceIndex = afterAt.indexOf(' ');
      const searchTerm = nextSpaceIndex === -1 ? afterAt : afterAt.substring(0, nextSpaceIndex);
      
      // If we're still typing the pose (no space yet after @)
      if (nextSpaceIndex === -1) {
        const filteredPoses = AVAILABLE_POSES.filter(pose => 
          pose.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          pose.display.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSuggestions(filteredPoses);
        setShowSuggestions(filteredPoses.length > 0);
        setSelectedIndex(0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [message]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle suggestions navigation
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            const selectedPose = suggestions[selectedIndex];
            
            // Find the last @ position
            const lastAtIndex = message.lastIndexOf('@');
            
            // Replace the partial pose with the complete one
            const beforeAt = message.substring(0, lastAtIndex);
            const afterAt = message.substring(lastAtIndex + 1);
            const nextSpaceIndex = afterAt.indexOf(' ');
            
            let newMessage;
            if (nextSpaceIndex === -1) {
              // No space yet, replace everything after @
              newMessage = beforeAt + '@' + selectedPose.id + ' ';
            } else {
              // Replace just the word after @
              newMessage = beforeAt + '@' + selectedPose.id + afterAt.substring(nextSpaceIndex);
            }
            
            setMessage(newMessage);
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
        case 'Tab':
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            const selectedPose = suggestions[selectedIndex];
            
            // Find the last @ position
            const lastAtIndex = message.lastIndexOf('@');
            
            // Replace the partial pose with the complete one
            const beforeAt = message.substring(0, lastAtIndex);
            const afterAt = message.substring(lastAtIndex + 1);
            const nextSpaceIndex = afterAt.indexOf(' ');
            
            let newMessage;
            if (nextSpaceIndex === -1) {
              // No space yet, replace everything after @
              newMessage = beforeAt + '@' + selectedPose.id + ' ';
            } else {
              // Replace just the word after @
              newMessage = beforeAt + '@' + selectedPose.id + afterAt.substring(nextSpaceIndex);
            }
            
            setMessage(newMessage);
            setShowSuggestions(false);
          }
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      // If Enter is pressed and we're not navigating suggestions
      e.preventDefault();
      processMessage(message);
      setMessage('');
      
      // Blur the input on mobile to hide keyboard
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      processMessage(message);
    }
    
    // Clear the message and suggestions
    setMessage('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Blur the input on mobile to hide keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleFocus = () => {
    window.chatboxFocused = true;
  };

  const handleBlur = () => {
    window.chatboxFocused = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.chatboxFocused = false;
    };
  }, []);

  // Force re-render when visibility changes
  useEffect(() => {
    const checkVisibility = () => {
      // Force component re-render on visibility change
      setMessage(prev => prev); // This is a trick to force re-render
    };
    
    // Check immediately and set up interval for changes
    const interval = setInterval(checkVisibility, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      id="game-chat-container"
      className="fixed z-10"
      style={{
        // Use dynamic position from config
        bottom: getChatPosition().bottom,
        left: getChatPosition().left,
        transform: 'translateX(-50%)', // Center horizontally
        width: `${getChatWidth()}px`,
        // Hide if in special zones (helper, clothing shop, etc)
        display: isMessagingHidden() ? 'none' : 'block',
        opacity: window.gameChatConfig?.opacity || 0.9
      }}
    >
      {/* Main chat form - always visible */}
      <form 
        onSubmit={handleSubmit} 
        className={`rounded-lg border-opacity-0 space-y-1`}
      >
        <div className="relative p-1"> {/* Added padding container */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type message... (@pose)"
            className={`w-full px-3 py-3 rounded-2xl text-white placeholder-gray-400 
              ${theme === 'light' 
                ? 'bg-[#2A2B32] border border-gray-600' 
                : 'bg-[#2A2B32] border border-gray-600'
              } 
              focus:outline-none focus:ring-2 focus:ring-[#22aa22] focus:border-transparent
              shadow-lg transition-all duration-200
              text-sm sm:text-base pr-16`} // Added right padding for button
          />
          <button
            type="submit"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 
              px-4 py-2 rounded-xl text-white font-medium
              ${theme === 'light'
                ? 'bg-[#22aa22] hover:bg-[#1a8a1a]'
                : 'bg-[#22aa22] hover:bg-[#1a8a1a]'
              }
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[#22aa22] focus:ring-offset-2 focus:ring-offset-[#2A2B32]
              text-xs sm:text-sm`}
          >
            Send
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={`absolute bottom-full left-4 right-4 mb-2 rounded-xl shadow-lg overflow-hidden
            ${theme === 'light' ? 'bg-[#2A2B32]' : 'bg-[#2A2B32]'}
            max-h-[40vh] overflow-y-auto z-20`}
        >
          {suggestions.map((pose, index) => (
            <div
              key={pose.id}
              className={`px-4 py-3 cursor-pointer transition-colors duration-200
                ${index === selectedIndex 
                  ? 'bg-[#22aa22] text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
                }
                text-base sm:text-lg`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                // Insert the pose into the message and add a space
                setMessage(`@${pose.id} `);
                setShowSuggestions(false);
                
                // Focus back on the input field
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              {pose.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chatbox; 