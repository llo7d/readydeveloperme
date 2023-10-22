import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose5: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <circle className="cls-1" cx="52.631" cy="26.412" r="5.224" transform="translate(-3.261 44.952) rotate(-45)" />
      <path className="cls-1" d="M28.426,24.506,46.454,38.975l3.114,17.636,1,9.45-6.614,9.532a3,3,0,1,0,4.929,3.421l7.25-10.448a3,3,0,0,0,.518-2.024l-.818-7.776,3.119-.431,3.08,26.336a3,3,0,0,0,5.959-.7L64.558,54.655,63.126,35.93,72.391,17A3,3,0,0,0,67,14.359L57.767,33.231,50.539,34.56,32.182,19.826a3,3,0,1,0-3.756,4.68Z" />
    </svg>

  );
};

export default IconPose5;
