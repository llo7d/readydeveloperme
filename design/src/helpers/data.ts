import { SVGProps } from "react";

import IconCamera from "../assets/images/IconCamera";
import IconPose from "../assets/images/IconPose";
import IconColor from "../assets/images/IconColor";
import IconAirpod from "../assets/images/IconAirpod";
import IconFace from "../assets/images/IconFace";
import IconImage from "../assets/images/IconImage";
import IconContrast from "../assets/images/IconContrast";

type SubTool = {
  id: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
};

type Tool = {
  id: string;
  label: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  items: SubTool[];
};

export const getToolbarData = (): Tool[] => {
  return [
    {
      id: "tool_1",
      label: "Tool 1",
      icon: IconPose,
      items: [...Array(12)].map((_, index) => ({
        id: `tool_1_item_${index + 1}`,
        icon: IconPose,
      })),
    },
    {
      id: "tool_2",
      label: "Tool 2",
      icon: IconColor,
      items: [...Array(12)].map((_, index) => ({
        id: `tool_2_item_${index + 1}`,
        icon: IconColor,
      })),
    },
    {
      id: "tool_3",
      label: "Tool 3",
      icon: IconAirpod,
      items: [...Array(8)].map((_, index) => ({
        id: `tool_3_item_${index + 1}`,
        icon: IconAirpod,
      })),
    },
    {
      id: "tool_4",
      label: "Tool 4",
      icon: IconCamera,
      items: [...Array(3)].map((_, index) => ({
        id: `tool_4_item_${index + 1}`,
        icon: IconCamera,
      })),
    },
    {
      id: "tool_5",
      label: "Tool 5",
      icon: IconFace,
      items: [...Array(3)].map((_, index) => ({
        id: `tool_5_item_${index + 1}`,
        icon: IconFace,
      })),
    },
    {
      id: "tool_6",
      label: "Tool 6",
      icon: IconCamera,
      items: [...Array(7)].map((_, index) => ({
        id: `tool_6_item_${index + 1}`,
        icon: IconCamera,
      })),
    },
    {
      id: "tool_7",
      label: "Tool 7",
      icon: IconImage,
      items: [...Array(16)].map((_, index) => ({
        id: `tool_7_item_${index + 1}`,
        icon: IconImage,
      })),
    },
    {
      id: "tool_8",
      label: "Tool 8",
      icon: IconContrast,
      items: [...Array(10)].map((_, index) => ({
        id: `tool_8_item_${index + 1}`,
        icon: IconContrast,
      })),
    },
  ];
};
