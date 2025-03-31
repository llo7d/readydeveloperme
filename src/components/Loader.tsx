import { useProgress } from "@react-three/drei";
import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import { useStore } from "../store/store";

interface LoaderProps {
  // Callback function when loading is finished and username is submitted
  onLoadedSubmit?: (username: string) => void;
}

const Loader: React.FC<LoaderProps> = ({ onLoadedSubmit }) => {
  const theme = useStore((state) => state.theme);
  const [isActive, setIsActive] = useState(true);
  const [dummyProgress, setDummyProgress] = useState(0);
  const { progress, total } = useProgress();
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const value = dummyProgress || Math.ceil(progress);
  const isProgressFinished = value >= 100;

  useEffect(() => {
    let timeout: number | null = null;
    if (total === 0) {
      timeout = setTimeout(() => {
        setDummyProgress(100);
      }, 500);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [total]);

  useEffect(() => {
    if (isProgressFinished && !isLoadComplete) {
      const timer = setTimeout(() => {
        setIsLoadComplete(true);
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isProgressFinished, isLoadComplete]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedUsername = username.trim();
    if (onLoadedSubmit && isLoadComplete && trimmedUsername) {
      console.log("Loader submitting username:", trimmedUsername);
      onLoadedSubmit(trimmedUsername);
      setIsActive(false);
    } else if (!onLoadedSubmit && isLoadComplete) {
      setIsActive(false);
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={classNames(
            "absolute top-0 left-0 w-full h-screen z-20 flex flex-col justify-center items-center",
            {
              "bg-white": theme === "light",
              "bg-neutral-100": theme === "dark",
            }
          )}
          style={{ backgroundColor: 'rgba(28, 29, 34, 0.95)' }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              delay: 0.2,
              duration: 0.6,
            },
          }}
        >
          <motion.div 
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: isLoadComplete ? 0.8 : 1,
              opacity: isLoadComplete ? 0.7 : 1,
            }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '40px' }}
          >
            <motion.svg
              width="112"
              height="112"
              viewBox="0 0 112 112"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath id="cut">
                  <motion.rect
                    x="0"
                    y="112"
                    width="112"
                    height="0"
                    initial={{
                      attrY: 112,
                      height: 0,
                    }}
                    animate={{
                      attrY: 112 - 1.12 * value,
                      height: 1.12 * value,
                    }}
                  />
                </clipPath>
              </defs>

              <rect
                width="111"
                height="111"
                x="0.5"
                y="0.5"
                rx="50"
                fill="white"
              />
              <rect
                width="112"
                height="112"
                rx="50"
                fill="#4B50EC"
                clipPath="url(#cut)"
              />
              <path
                d="M25.4517 67.8693C24.5142 67.8693 23.7093 67.5379 23.0369 66.875C22.3741 66.2027 22.0426 65.3977 22.0426 64.4602C22.0426 63.5322 22.3741 62.7367 23.0369 62.0739C23.7093 61.411 24.5142 61.0795 25.4517 61.0795C26.3608 61.0795 27.1563 61.411 27.8381 62.0739C28.5199 62.7367 28.8608 63.5322 28.8608 64.4602C28.8608 65.0852 28.6998 65.6581 28.3778 66.179C28.0653 66.6903 27.6534 67.1023 27.142 67.4148C26.6307 67.7178 26.0672 67.8693 25.4517 67.8693ZM33.8288 67.5V45.6818H39.5959V49.5312H39.8516C40.3061 48.2528 41.0637 47.2443 42.1243 46.5057C43.1849 45.767 44.4538 45.3977 45.9311 45.3977C47.4273 45.3977 48.701 45.7718 49.7521 46.5199C50.8033 47.2585 51.504 48.2623 51.8544 49.5312H52.0817C52.5268 48.2812 53.3317 47.2822 54.4964 46.5341C55.6707 45.7765 57.058 45.3977 58.6584 45.3977C60.6944 45.3977 62.3468 46.0464 63.6158 47.3438C64.8942 48.6316 65.5334 50.4593 65.5334 52.8267V67.5H59.4964V54.0199C59.4964 52.8078 59.1745 51.8987 58.5305 51.2926C57.8866 50.6866 57.0817 50.3835 56.1158 50.3835C55.0173 50.3835 54.1603 50.7339 53.5447 51.4347C52.9292 52.1259 52.6214 53.0398 52.6214 54.1761V67.5H46.755V53.892C46.755 52.822 46.4472 51.9697 45.8317 51.3352C45.2256 50.7008 44.4254 50.3835 43.4311 50.3835C42.7588 50.3835 42.1527 50.554 41.6129 50.8949C41.0826 51.2263 40.6612 51.6951 40.3487 52.3011C40.0362 52.8977 39.88 53.5985 39.88 54.4034V67.5H33.8288ZM80.2564 67.9261C78.0121 67.9261 76.0803 67.4716 74.4609 66.5625C72.8511 65.6439 71.6106 64.3466 70.7393 62.6705C69.8681 60.9848 69.4325 58.9915 69.4325 56.6903C69.4325 54.446 69.8681 52.4763 70.7393 50.7812C71.6106 49.0862 72.8369 47.7652 74.4183 46.8182C76.0092 45.8712 77.8748 45.3977 80.0149 45.3977C81.4543 45.3977 82.7943 45.6297 84.0348 46.0938C85.2848 46.5483 86.3738 47.2348 87.3018 48.1534C88.2393 49.072 88.9685 50.2273 89.4893 51.6193C90.0102 53.0019 90.2706 54.6212 90.2706 56.4773V58.1392H71.8473V54.3892H84.5746C84.5746 53.518 84.3852 52.7462 84.0064 52.0739C83.6276 51.4015 83.102 50.8759 82.4297 50.4972C81.7668 50.1089 80.995 49.9148 80.1143 49.9148C79.1958 49.9148 78.3814 50.1278 77.6712 50.554C76.9704 50.9706 76.4212 51.5341 76.0234 52.2443C75.6257 52.9451 75.4221 53.7263 75.4126 54.5881V58.1534C75.4126 59.233 75.6115 60.1657 76.0092 60.9517C76.4164 61.7377 76.9893 62.3438 77.728 62.7699C78.4666 63.196 79.3426 63.4091 80.3558 63.4091C81.0282 63.4091 81.6437 63.3144 82.2024 63.125C82.7611 62.9356 83.2393 62.6515 83.6371 62.2727C84.0348 61.8939 84.3378 61.4299 84.5462 60.8807L90.1428 61.25C89.8587 62.5947 89.2763 63.7689 88.3956 64.7727C87.5244 65.767 86.3975 66.5436 85.0149 67.1023C83.6418 67.6515 82.0556 67.9261 80.2564 67.9261Z"
                fill="white"
              />
            </motion.svg>
          </motion.div>

          {onLoadedSubmit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isLoadComplete ? 1 : 0,
                y: isLoadComplete ? 0 : 20,
              }}
              transition={{ delay: isLoadComplete ? 0.3 : 0, duration: 0.5 }}
              style={{
                textAlign: 'center',
                color: 'white',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              <form onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>Choose Your Developer Name</h2>
                <input 
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 16))}
                  maxLength={16}
                  placeholder="Enter username..."
                  disabled={!isLoadComplete}
                  style={{
                    padding: '10px 15px',
                    fontSize: '1em',
                    border: 'none',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    width: '250px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    opacity: isLoadComplete ? 1 : 0.5,
                    cursor: isLoadComplete ? 'text' : 'not-allowed'
                  }}
                  required
                />
                <button 
                  type="submit"
                  disabled={!isLoadComplete || !username.trim()}
                  style={{
                    padding: '10px 25px',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#4B50EC', 
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (isLoadComplete && username.trim()) ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s ease, opacity 0.3s ease',
                    opacity: (isLoadComplete && username.trim()) ? 1 : 0.5,
                  }}
                  onMouseOver={(e) => { if (isLoadComplete && username.trim()) e.currentTarget.style.backgroundColor = '#3a4673'; }}
                  onMouseOut={(e) => { if (isLoadComplete && username.trim()) e.currentTarget.style.backgroundColor = '#4B50EC'; }}
                >
                  Go talk with developers
                </button>
              </form>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
