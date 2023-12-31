import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose7: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <circle className="cls-1" cx="47.886" cy="21.821" r="5.224" transform="translate(-1.405 40.252) rotate(-45)" />
      <path className="cls-1" d="M34.147,39.791c.283-.092.555-.181,5.188-2.808l-.843,20.441c0,.083,0,.165,0,.247l1.066,25.855a3,3,0,0,0,3,2.877l.125,0a3,3,0,0,0,2.874-3.121L44.492,57.548h2.839a3.087,3.087,0,0,0,.031.49l4.281,25.855A3,3,0,0,0,54.6,86.4a2.964,2.964,0,0,0,.493-.041,3,3,0,0,0,2.47-3.449l-4.23-25.55.915-22.2a2.515,2.515,0,0,1,1.063,2.049v9.373a3,3,0,0,0,4.75,2.437l8.488-6.093a3,3,0,0,0-3.5-4.874L61.31,40.742V37.215a8.532,8.532,0,0,0-8.522-8.522H42.556c-.048,0-.093.016-.141.019a2.857,2.857,0,0,0-.519.068c-.073.016-.144.035-.216.057a2.93,2.93,0,0,0-.5.205c-.038.019-.08.027-.117.048l-2.543,1.452c.867-2.382,1.87-5.094,2.836-7.666a3,3,0,1,0-5.616-2.11C29.5,37.389,29.5,37.389,31.04,39.006A3.022,3.022,0,0,0,34.147,39.791Z" />
    </svg>

  );
};

export default IconPose7;
