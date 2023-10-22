import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose10: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <path className="cls-1" d="M59.487,83.4V47.794a3.766,3.766,0,0,1-4.78,1.654l-9.519-4V83.4a3,3,0,0,0,6,0V57.548h2.3V83.4a3,3,0,0,0,6,0Z" />
      <path className="cls-1" d="M41,37.255v3.388A3,3,0,0,0,42.427,43.2L55.1,48.527a2.8,2.8,0,0,0,3.674-1.5,2.811,2.811,0,0,0-1.5-3.675L46.42,38.79a.5.5,0,0,1-.306-.461v-2.85a.5.5,0,0,1,1,0V38l10.545,4.436a3.763,3.763,0,0,1,1.828,1.655V35.059H59.7a5.584,5.584,0,0,1,4.959,3l5.126,9.768a3,3,0,0,0,5.313-2.788L69.967,35.27A11.568,11.568,0,0,0,59.7,29.059h-11A7.969,7.969,0,0,0,41,37.255Z" />
      <circle className="cls-1" cx="53.519" cy="22.354" r="5.224" transform="translate(-2.89 8.862) rotate(-9.217)" />
    </svg>

  );
};

export default IconPose10;
