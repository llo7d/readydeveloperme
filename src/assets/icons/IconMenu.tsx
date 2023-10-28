import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconMenu: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M2.5 10H17.5M2.5 5H17.5M2.5 15H12.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconMenu;
