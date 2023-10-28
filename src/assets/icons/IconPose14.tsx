import React, { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const IconPose14: React.FC<Props> = ({ fill = "#4B50EC", ...rest }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="16 16 70 70" fill={fill} {...rest}>
      <circle className="cls-1" cx="51.365" cy="40.491" r="5.224" transform="translate(-7.929 12.884) rotate(-13.282)" />
      <path className="cls-1" d="M45.312,52.513v9.715l-10.287,2.34a3,3,0,0,0-.084,5.83l14.992,3.865a3.038,3.038,0,0,0,.751.095,3,3,0,0,0,2.9-2.252c.025-.1.03-.195.045-.293a2.94,2.94,0,0,0,.112.5,3,3,0,0,0,3.8,1.892l13.9-4.648a3,3,0,0,0-.5-5.81L59.515,61.98V51.608L71.679,30.12a3,3,0,1,0-5.221-2.956L54.706,47.924H49.224L31.677,29.666a3,3,0,0,0-4.326,4.157Zm8.934,15.405,0,0,8.476-2.858a.5.5,0,0,1,.319.948l-5.987,2.018h.026l-1.447.485a2.986,2.986,0,0,0-2,2.367,3,3,0,0,0-2.21-2.428l-1.344-.346-7.615-1.523a.5.5,0,1,1,.2-.98Z" />
    </svg >

  );
};

export default IconPose14;
