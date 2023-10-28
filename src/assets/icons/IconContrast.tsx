import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconContrast: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        opacity="0.12"
        d="M2.66669 16C2.66669 23.3638 8.63622 29.3333 16 29.3333V2.66666C8.63622 2.66666 2.66669 8.63619 2.66669 16Z"
        fill={fill}
      />
      <path
        d="M16 2.66666C16.7889 2.66666 17.5618 2.73517 18.3131 2.86657M16 2.66666C8.63622 2.66666 2.66669 8.63619 2.66669 16C2.66669 23.3638 8.63622 29.3333 16 29.3333M16 2.66666V29.3333M23.6507 5.07866C24.923 5.97158 26.0321 7.08118 26.9245 8.35386M29.1335 13.6875C29.2649 14.4386 29.3334 15.2113 29.3334 16C29.3334 16.7887 29.2649 17.5614 29.1335 18.3125M26.9189 23.6541C26.0271 24.9239 24.9195 26.0311 23.6493 26.9223M18.3104 29.1339C17.56 29.265 16.788 29.3333 16 29.3333"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconContrast;
