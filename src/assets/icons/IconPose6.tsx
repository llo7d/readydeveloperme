import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose6: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <circle className="cls-1" cx="50.673" cy="28.085" r="5.224" />
      <path className="cls-1" d="M26.469,26.178,44.5,40.647l3.069,17.378-1.806,26.35a3,3,0,0,0,2.788,3.2c.069,0,.14.007.208.007a3,3,0,0,0,2.99-2.8L53.409,60.5l4.575-.633,11.238,20.3a3,3,0,0,0,5.25-2.907L62.554,55.736,61.168,37.6l9.264-18.933a3,3,0,1,0-5.389-2.637L55.809,34.9l-7.228,1.329L30.225,21.5a3,3,0,1,0-3.756,4.679Z" />
    </svg>

  );
};

export default IconPose6;
