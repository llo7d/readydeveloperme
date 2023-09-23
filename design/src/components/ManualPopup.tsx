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
          className={classNames("fixed top-0 left-0 w-full h-screen", {
            "bg-neutral-30": theme === "light",
            "bg-neutral-100": theme === "dark",
          })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="text-2xl text-primary w-11 h-11 flex items-center justify-center bg-neutral-20 rounded-full ml-4 absolute top-8 right-8 z-10"
            type="button"
            onClick={onClickClose}
          >
            &#x2715;
          </button>

          <div
            className={classNames(
              "w-1/2 h-screen absolute right-0 top-0 p-40 overflow-auto",
              {
                "bg-neutral-10": theme === "light",
                "bg-[#2A2B2F]": theme === "dark",
              }
            )}
          >
            <h1
              className={classNames("font-bold text-5xl mb-12", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              How to use this feature?
            </h1>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              sapiente quos hic maiores eius. Itaque nisi error veritatis,
              tempore maiores ipsa facilis nobis? Impedit, praesentium quia
              tenetur non consequatur rerum.
            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              sapiente quos hic maiores eius. Itaque nisi error veritatis,
              tempore maiores ipsa facilis nobis? Impedit, praesentium quia
              tenetur non consequatur rerum.
            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              sapiente quos hic maiores eius. Itaque nisi error veritatis,
              tempore maiores ipsa facilis nobis? Impedit, praesentium quia
              tenetur non consequatur rerum.
            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              sapiente quos hic maiores eius. Itaque nisi error veritatis,
              tempore maiores ipsa facilis nobis? Impedit, praesentium quia
              tenetur non consequatur rerum.
            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              sapiente quos hic maiores eius. Itaque nisi error veritatis,
              tempore maiores ipsa facilis nobis? Impedit, praesentium quia
              tenetur non consequatur rerum.
            </p>

            <div className="flex items-center justify-between">
              <p
                className={classNames("text-xl", {
                  "text-[#121F3E]": theme === "light",
                  "text-white": theme === "dark",
                })}
              >
                Created by llo7d
              </p>

              <p
                className={classNames("text-xl", {
                  "text-[#121F3E]": theme === "light",
                  "text-white": theme === "dark",
                })}
              >
                <a className="text-primary hover:underline" href="#">
                  Terms
                </a>{" "}
                &{" "}
                <a className="text-primary hover:underline" href="#">
                  Licensing
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualPopup;
