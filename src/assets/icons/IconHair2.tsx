import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconHair2: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path xmlns="http://www.w3.org/2000/svg" className="cls-1" d="M69.6,73.049h1.616a54.319,54.319,0,0,1,3.545-9.892,24.222,24.222,0,0,0,2.611-6.792c.825-4.092.661-9.294-4.6-11.292,2.585-20.36-33.58-22-43.275-12.631S21.64,54.963,24.779,61.877c1.523,3.356,4.363,11.172,4.363,11.172h1.616c1.454-.97-.808-12.626,0-16.665s2.908-4.363,17.289-4.363A48.441,48.441,0,0,0,65.276,48.75,15.325,15.325,0,0,1,69.6,56.384C70.561,60.388,68.141,72.079,69.6,73.049Z" />    </svg >
  );
};

export default IconHair2;
