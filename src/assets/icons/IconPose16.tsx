import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose16: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 72 72" fill={fill} {...rest}>
      <circle className="cls-1" cx="52.065" cy="20.835" r="5.224" transform="translate(12.892 60.964) rotate(-67.5)" />
      <path className="cls-1" d="M39.152,21.87A3,3,0,0,0,35.485,24L32.3,36.048a3,3,0,0,0,4.531,3.285l6.886-4.46L42.187,52.387a2.991,2.991,0,0,0-.011.354l.98,31.741a3,3,0,0,0,3,2.908h.095A3,3,0,0,0,49.154,84.3l-.863-27.916h2.275l.868,28.1a3,3,0,0,0,3,2.908h.094A3,3,0,0,0,57.432,84.3l-.976-31.564.5-5.685a2.989,2.989,0,0,0,4.693-.424c1.989-3.069,4.439-6.723,5.12-7.563a3.048,3.048,0,0,0,.985-1.744c.371-2.094-.591-2.859-6.85-7.836a8.158,8.158,0,0,0-4.676-1.772l-5.161-.274h-.009l-3.76-.2a8.183,8.183,0,0,0-5.509,1.741l-1.7,1.1,1.2-4.54A3,3,0,0,0,39.152,21.87ZM57.379,42.177l.64-7.318c1.171.939,2.079,1.683,2.746,2.243C59.955,38.26,58.871,39.887,57.379,42.177Z" />

    </svg >

  );
};

export default IconPose16;
