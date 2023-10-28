import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconImage: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
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
        d="M7.99943 26.6672L19.8248 14.8418C20.3528 14.3138 20.6169 14.0498 20.9213 13.9509C21.1891 13.8639 21.4776 13.8639 21.7453 13.9509C22.0498 14.0498 22.3138 14.3138 22.8418 14.8418L28.5403 20.5403M14 11.3333C14 12.8061 12.8061 14 11.3333 14C9.86056 14 8.66666 12.8061 8.66666 11.3333C8.66666 9.86056 9.86056 8.66666 11.3333 8.66666C12.8061 8.66666 14 9.86056 14 11.3333ZM29.3333 16C29.3333 23.3638 23.3638 29.3333 16 29.3333C8.63619 29.3333 2.66666 23.3638 2.66666 16C2.66666 8.63619 8.63619 2.66666 16 2.66666C23.3638 2.66666 29.3333 8.63619 29.3333 16Z"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconImage;
