import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconBeard3: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path className="cls-1" d="M68.336,33.12a9.924,9.924,0,0,0-5.349-1.566H37.013a9.924,9.924,0,0,0-5.349,1.566l-8.64,5.534A1.85,1.85,0,0,0,24.115,42h51.77a1.849,1.849,0,0,0,1.091-3.343Z" />
      <path className="cls-1" d="M41.828,55.163c1.238,4.7,4.227,9.453,6.226,12.276a2.384,2.384,0,0,0,3.892,0c2-2.823,4.988-7.577,6.226-12.276C60.135,47.718,39.865,47.718,41.828,55.163Z" /></svg>
  );
};

export default IconBeard3;
