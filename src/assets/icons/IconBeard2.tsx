import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconBeard2: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path className="cls-1" d="M76.784,27.191S74.167,51.05,65.7,54.745s-9.573-.075-11.391-1.693L54.249,53a6.507,6.507,0,0,0-8.5,0l-.061.055c-1.818,1.618-2.925,5.387-11.391,1.693S23.216,27.191,23.216,27.191c-1.078-1.386-3.233,11.852,3.232,28.939S50,72.909,50,72.909s17.087.308,23.552-16.779S77.862,25.805,76.784,27.191Z" />
    </svg>
  );
};

export default IconBeard2;
