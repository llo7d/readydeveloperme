import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconBeard4: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path className="cls-1" d="M51.415,42.751a5.33,5.33,0,0,0-2.83,0c-3.658,1-13.127,4.044-12.859,8.6.251,4.256,8.244,5.586,12.157,5.982a20.947,20.947,0,0,0,4.234,0c3.913-.4,11.906-1.726,12.157-5.982C64.542,46.8,55.073,43.754,51.415,42.751Z" />

    </svg>
  );
};

export default IconBeard4;
