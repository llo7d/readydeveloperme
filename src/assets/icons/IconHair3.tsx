import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconHair3: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path className="cls-1" d="M71.746,45.484c-2.721-23.976-27.771-15.226-39.122-7.1S23.078,57.605,24.239,60.7s1.29,5.417,3.1,7.739,3.1,1.548,3.1,1.548c0-.9-2.064-7.094,0-11.222S52.1,49.994,56.746,48.7c4.013-1.115,5.619-.111,7.563.015.252,2.442,2.088,5,2.9,6A30.272,30.272,0,0,1,69.7,58.766c2.064,4.128,0,10.319,0,11.222,0,0,1.29.774,3.1-1.548s2.3-4.53,3.1-7.739C78.891,48.565,71.746,45.484,71.746,45.484Z" />
    </svg >
  );
};

export default IconHair3;
