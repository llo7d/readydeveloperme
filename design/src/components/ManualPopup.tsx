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
              Ready Developer Me
              <h1 className="text-primary">.</h1>
            </h1>
            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              The easiest way to your Developer Avatar

              <ol >
                <li>1. Customize the appearance </li>
                <li>2. Choose from the 23 avaialble poses.</li>
                <li>3. Click export.</li>
              </ol>
              <br></br>
              Recommended logo size is 2000x2000px.
              <br></br>
              You can use the renders for your website, blog, social media, or anything
              else. It's free to use, and you can use it for both personal and business purposes.

            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              The renders work great with a  {" "}
              <a className="text-primary hover:underline" href="
              https://3d-portfolio-beryl.vercel.app/" target="_blank">
                Porfolio Template {" "}
              </a>
              I made.
              {<br></br>}
              <a className="text-primary hover:underline" href="
            https://github.com/llo7d/PortfolioWebsite" target="_blank">
                Grab the code {" "}
              </a>
              and make your own Portfolio Website in minutes.
            </p>

            <p
              className={classNames("text-xl mb-10", {
                "text-[#121F3E]": theme === "light",
                "text-white": theme === "dark",
              })}
            >
              <a className="text-primary hover:underline" href="
              https://github.com/llo7d/readydeveloperme" target="_blank">
                See the source code of Ready Developer {" "}
              </a>

            </p>


            <div className="flex items-center justify-between">
              <p
                className={classNames("text-xl", {
                  "text-[#121F3E]": theme === "light",
                  "text-white": theme === "dark",
                })}
              >
                created by {" "}
                <a className="text-primary hover:underline" href="
              https://github.com/llo7d" target="_blank">
                  llo7d{" "}
                </a>
              </p>

              <p
                className={classNames("text-xl", {
                  "text-[#121F3E]": theme === "light",
                  "text-white": theme === "dark",
                })}
              >
                {/* <a className="text-primary hover:underline" href="#">
                  Terms
                </a>{" "}
                &{" "}
                <a className="text-primary hover:underline" href="#">
                  Licensing
                </a> */}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualPopup;
