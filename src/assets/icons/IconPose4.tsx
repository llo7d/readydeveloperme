import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose4: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <circle className="cls-1" cx="50" cy="21.821" r="5.224" />
      <path className="cls-1" d="M33.477,41.3c.3-.1.592-.192,8.192-4.47V83.4a3,3,0,0,0,6,0V57.548h2.3V83.4a3,3,0,0,0,6,0V34.938a2.521,2.521,0,0,1,1.456,2.277V51.574a3,3,0,0,0,6,0V37.215A8.532,8.532,0,0,0,54.9,28.693H44.669a2.981,2.981,0,0,0-.7.091c-.063.015-.122.038-.184.057a2.933,2.933,0,0,0-.485.2c-.035.018-.074.025-.108.044-1.167.659-2.545,1.437-3.943,2.224,1.266-2.543,2.7-5.4,4.089-8.126a3,3,0,0,0-5.35-2.718C28.757,38.635,28.757,38.635,30.261,40.4A3.017,3.017,0,0,0,33.477,41.3Z" />
    </svg>

  );
};

export default IconPose4;
