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


  // create tool1 type, which is id string, icon React.FC<SVGProps<SVGSVGElement>>
  // const tool1: SubTool[] = [
  //   {  
  //     id: "tool_1_item_1",

  const tool1 = [
    {
      id: "tool_1_item_1",
      icon: IconPose,
    },
    {
      id: "tool_1_item_2",
      icon: IconCamera,
    },
    {
      id: "tool_1_item_3",
      icon: IconColor,
    },
    {
      id: "tool_1_item_4",
      icon: IconAirpod,
    },
    {
      id: "tool_1_item_5",
      icon: IconPose,
    },
    {
      id: "tool_1_item_6",
      icon: IconPose,
    },
    {
      id: "tool_1_item_7",
      icon: IconPose,
    },
    {
      id: "tool_1_item_8",
      icon: IconPose,
    },
    {
      id: "tool_1_item_9",
      icon: IconPose,
    },
    {
      id: "tool_1_item_10",
      icon: IconPose,
    },
    {
      id: "tool_1_item_11",
      icon: IconPose,
    },
    {
      id: "tool_1_item_12",
      icon: IconPose,
    },
  ]

  return [
    {
      id: "Poses",
      label: "Poses",
      icon: IconPose,
      items: tool1,
      // items: tool1.map((_, index) => ({
      //   id: id,
      //   icon: icon,
      // })),
    },
    {
      id: "tool_2",
      label: "Tool 2",
      icon: IconColor,
      items: [...Array(5)].map((_, index) => ({
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
