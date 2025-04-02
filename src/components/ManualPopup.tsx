import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import { useStore } from "../store/store";

type Props = {
  isOpen: boolean;
  onClickClose: () => void;
};

const ManualPopup: React.FC<Props> = ({ isOpen, onClickClose }) => {
  const theme = useStore((state) => state.theme);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={classNames(
            "fixed top-0 left-0 w-full h-screen z-[19999]",
            {
              "bg-neutral-30/80": theme === "light",
              "bg-neutral-100/80": theme === "dark",
            }
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClickClose}
        >
          <motion.div
            className={classNames(
              "fixed top-0 right-0 h-screen overflow-auto z-[20000]",
              "w-full p-8 md:w-1/2 md:p-20 lg:p-40",
              {
                "bg-neutral-10": theme === "light",
                "bg-[#2A2B2F]": theme === "dark",
              }
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 md:top-8 md:right-8 text-2xl text-primary w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-neutral-20/80 hover:bg-neutral-30/90 rounded-full z-10 transition-colors"
              type="button"
              onClick={onClickClose}
              aria-label="Close Panel"
            >
              &#x2715;
            </button>

            <div className="max-w-3xl mx-auto md:mx-0">
              <h1
                className={classNames(
                  "font-bold text-3xl md:text-5xl mb-8 md:mb-12",
                  {
                    "text-[#121F3E]": theme === "light",
                    "text-white": theme === "dark",
                  }
                )}
              >
                Ready Developer Me
                <span className="text-primary">.</span>
              </h1>
              <div className={classNames(
                  "space-y-6 md:space-y-10 text-base md:text-xl",
                  {
                    "text-[#121F3E]": theme === "light",
                    "text-white": theme === "dark",
                  }
              )}>
                <p>
                  The easiest way to get talk to other Developers.
                  <ol className="list-decimal list-inside space-y-1 mt-3 pl-2">
                    <li>Customize the appearance.</li>
                    <li>Chat and Choose poses while talking</li>
                    <li>Profit?</li>
                  </ol>
                </p>

                <p>
                  The renders work great with the{" "}
                  <a
                    className="text-primary hover:underline"
                    href="https://3d-portfolio-beryl.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    3D Portfolio Template
                  </a>{" "}
                  I made. Grab the code from{" "}
                  <a
                    className="text-primary hover:underline"
                    href="https://github.com/llo7d/PortfolioWebsite"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>{" "}
                  and make your own Portfolio Website in minutes.
                </p>

                <p>
                  <a
                    className="text-primary hover:underline"
                    href="https://github.com/llo7d/readydeveloperme"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See the source code for Ready Developer Me.
                  </a>
                </p>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-500/30">
                  <p className="mb-2 md:mb-0">
                    Created by{" "}
                    <a
                      className="text-primary hover:underline"
                      href="https://github.com/llo7d"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      llo7d
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualPopup;
