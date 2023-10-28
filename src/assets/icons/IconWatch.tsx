import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconWatch: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="0 0 32 32" fill={fill} {...rest}>
      <path d="M21.9,8.1l-0.6-3.6C21,3.1,19.8,2,18.3,2h-4.6c-1.5,0-2.7,1.1-3,2.5l-0.6,3.6C8.9,8.5,8,9.7,8,11v10c0,1.3,0.9,2.5,2.1,2.9
	l0.6,3.6c0.2,1.5,1.5,2.5,3,2.5h4.6c1.5,0,2.7-1.1,3-2.5l0.6-3.6c1.2-0.4,2.1-1.5,2.1-2.9V11C24,9.7,23.1,8.5,21.9,8.1z M22,21
	c0,0.6-0.4,1-1,1H11c-0.6,0-1-0.4-1-1V11c0-0.6,0.4-1,1-1h10c0.6,0,1,0.4,1,1V21z" /></svg>
  );
};

export default IconWatch;
