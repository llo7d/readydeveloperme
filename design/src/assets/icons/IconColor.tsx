import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconColor: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
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
        d="M18.1064 18.3865C17.4353 18.5692 16.729 18.6667 16 18.6667C12.6224 18.6667 9.73365 16.5736 8.56024 13.6136C5.16391 14.5382 2.66666 17.6442 2.66666 21.3334C2.66666 25.7517 6.24839 29.3334 10.6667 29.3334C15.0849 29.3334 18.6667 25.7517 18.6667 21.3334C18.6667 20.2927 18.468 19.2985 18.1064 18.3865Z"
        fill={fill}
      />
      <path
        d="M16 27.2963C17.4153 28.5631 19.2844 29.3333 21.3333 29.3333C25.7516 29.3333 29.3333 25.7516 29.3333 21.3333C29.3333 17.6441 26.8361 14.5381 23.4398 13.6136M8.56024 13.6135C5.16391 14.5381 2.66666 17.6441 2.66666 21.3333C2.66666 25.7516 6.24839 29.3333 10.6667 29.3333C15.0849 29.3333 18.6667 25.7516 18.6667 21.3333C18.6667 20.2927 18.468 19.2984 18.1064 18.3864M24 10.6667C24 15.0849 20.4183 18.6667 16 18.6667C11.5817 18.6667 8 15.0849 8 10.6667C8 6.24838 11.5817 2.66666 16 2.66666C20.4183 2.66666 24 6.24838 24 10.6667Z"
        stroke={fill}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default IconColor;