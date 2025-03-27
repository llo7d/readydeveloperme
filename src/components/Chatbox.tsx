import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/store';

// Add TypeScript declaration for the global window property
declare global {
  interface Window {
    chatboxFocused: boolean;
    setCharacterPose?: (pose: string) => void;
    showMessage?: (message: string) => void;
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

  // Extract actual message from a pose command message and limit to 12 words
  const extractActualMessage = (fullMessage: string): string => {
    if (!fullMessage.startsWith('@')) {
      // If no pose command, just limit to 12 words
      return fullMessage.split(' ').slice(0, 12).join(' ');
    }
    
    // Find the first space after @
    const spaceIndex = fullMessage.indexOf(' ');
    if (spaceIndex === -1) return ''; // No actual message, just a pose command
    
    // Return everything after the space, limited to 12 words
    return fullMessage.substring(spaceIndex + 1).trim().split(' ').slice(0, 12).join(' ');
  };

  // Process the message - handle pose command and extract actual message
  const processMessage = (fullMessage: string) => {
    // Extract actual message
    const actualMessage = extractActualMessage(fullMessage);
    
    // Check if message starts with @
    if (fullMessage.startsWith('@')) {
      const posePart = fullMessage.slice(1).split(' ')[0]; // Get the pose part
      
      // Check if the pose exists in our available poses
      const selectedPose = AVAILABLE_POSES.find(pose => pose.id === posePart);
      if (selectedPose) {
        // Set the character pose immediately
        if (window.setCharacterPose) {
          window.setCharacterPose(selectedPose.id);
        }
      }
    }
    
    // Show message above character if there's actual content
    if (actualMessage && window.showMessage) {
      window.showMessage(actualMessage);
    }
  };

  // Update suggestions when message changes
  useEffect(() => {
    if (message.startsWith('@')) {
      // If there's no space yet, we're still selecting a pose
      if (!message.includes(' ')) {
        const searchTerm = message.slice(1).toLowerCase();
        const filteredPoses = AVAILABLE_POSES.filter(pose => 
          pose.display.toLowerCase().includes(searchTerm)
        );
        setSuggestions(filteredPoses);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        // If we already have a space, hide suggestions
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
            // Insert the pose into the message and add a space
            setMessage(`@${selectedPose.id} `);
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
            // Insert the pose into the message and add a space
            setMessage(`@${selectedPose.id} `);
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

  return (
    <div className="fixed bottom-32 sm:bottom-36 md:bottom-16 left-1/2 transform -translate-x-1/2 w-full sm:w-[80%] md:w-[70%] max-w-md px-4 z-10">
      {/* Main chat form - always visible */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type message... (@pose)"
          className={`w-full px-3 py-2 rounded-2xl text-white placeholder-gray-400 
            ${theme === 'light' 
              ? 'bg-[#2A2B32] border border-gray-600' 
              : 'bg-[#2A2B32] border border-gray-600'
            } 
            focus:outline-none focus:ring-2 focus:ring-[#22aa22] focus:border-transparent
            shadow-lg transition-all duration-200
            text-sm sm:text-base`}
        />
        <button
          type="submit"
          className={`absolute right-1 top-1/2 transform -translate-y-1/2 
            px-2 py-1 rounded-xl text-white font-medium
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