import { SVGProps } from "react";

import IconCamera from "../assets/images/IconCamera";
import IconPose from "../assets/images/IconPose";
import IconColor from "../assets/images/IconColor";
import IconAirpod from "../assets/images/IconAirpod";
import IconFace from "../assets/images/IconFace";
import IconImage from "../assets/images/IconImage";
import IconContrast from "../assets/images/IconContrast";
import IconHair from "../assets/images/IconHair";
import IconNo from "../assets/images/IconNo";
import IconBeard from "../assets/images/IconBeard";

type SubTool = {
  id: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  name?: string;
  color?: string;
};

type Tool = {
  id: string;
  label: string;
  icon: React.FC<SVGProps<SVGSVGElement>>;
  items: SubTool[];
};

export const getToolbarData = (): Tool[] => {
  return [
    // {
    //   id: "tool_1",
    //   label: "Poses",
    //   icon: IconPose,
    //   items: [...Array(12)].map((_, index) => ({
    //     id: `tool_1_item_${index + 1}`,
    //     icon: IconPose,
    //   })),
    // },
    {
      id: "tool_1",
      label: "Poses",
      icon: IconPose,
      items: [
        {
          id: `tool_1_item_1`,
          name: "CharacterStop",
          icon: IconPose,
        },
        {
          id: `tool_1_item_2`,
          name: "Confident",
          icon: IconPose,
        },
        {
          id: `tool_1_item_3`,
          name: "Confused",
          icon: IconPose,
        },
        {
          id: `tool_1_item_4`,
          name: "CrossedArm",
          icon: IconPose,
        },
        {
          id: `tool_1_item_5`,
          name: "HappyOpenArm",
          icon: IconPose,
        },
        {
          id: `tool_1_item_6`,
          name: "JumpHappy",
          icon: IconPose,
        },
        {
          id: `tool_1_item_7`,
          name: "OnPhone",
          icon: IconPose,
        },
        {
          id: `tool_1_item_8`,
          name: "PC01",
          icon: IconPose,
        },
        {
          id: `tool_1_item_9`,
          name: "PC02",
          icon: IconPose,
        },
        {
          id: `tool_1_item_10`,
          name: "CrossedArm",
          icon: IconPose,
        },
        {
          id: `tool_1_item_11`,
          name: "PointingDown",
          icon: IconPose,
        },
        {
          id: `tool_1_item_12`,
          name: "PointingLeft",
          icon: IconPose,
        },
        {
          id: `tool_1_item_13`,
          name: "PointingRight",
          icon: IconPose,
        },
        {
          id: `tool_1_item_14`,
          name: "PointingUp",
          icon: IconPose,
        },
        {
          id: `tool_1_item_15`,
          name: "SittingHappy",
          icon: IconPose,
        },
        {
          id: `tool_1_item_16`,
          name: "SittingSad",
          icon: IconPose,
        },
        {
          id: `tool_1_item_17`,
          name: "Standing1",
          icon: IconPose,
        },
        {
          id: `tool_1_item_18`,
          name: "StandingSad",
          icon: IconPose,
        },
        {
          id: `tool_1_item_19`,
          name: "StandingThinking",
          icon: IconPose,
        },
        {
          id: `tool_1_item_20`,
          name: "Waving",
          icon: IconPose,
        },
        {
          id: `tool_1_item_21`,
          name: "Welcome",
          icon: IconPose,
        },
      ]
    },
    // {
    //   id: "tool_2",
    //   label: "Colors",
    //   icon: IconColor,
    //   items: [...Array(12)].map((_, index) => ({
    //     id: `tool_2_item_${index + 1}`,
    //     icon: IconColor,
    //   })),
    // },
    {
      id: "tool_2",
      label: "Colors",
      icon: IconColor,
      items: [
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_1`,
          icon: IconColor,
          color: "red",
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_2`,
          icon: IconColor,
          color: "green",
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_3`,
          icon: IconColor,
          color: "green",
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_4`,
          icon: IconColor,
          color: "green",
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_5`,
          icon: IconColor,
          color: "green",
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_2_item_6`,
          icon: IconColor,
          color: "green",
        },
      ]
    },


    // {
    //   id: "tool_3",
    //   label: "Tool 3",
    //   icon: IconHair,
    //   items: [...Array(8)].map((_, index) => ({
    //     id: `tool_3_item_${index + 1}`,
    //     icon: IconHair,
    //   })),
    // },

    {
      id: "tool_3",
      label: "Tool 3",
      icon: IconHair,
      items: [
        {

          // id: `tool_2_item_1`,
          id: `tool_3_item_0`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {

          // id: `tool_2_item_1`,
          id: `tool_3_item_1`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_01"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_3_item_2`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_02"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_3_item_3`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_03"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_3_item_4`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_04"
        },
      ],
    },


    // {
    //   id: "tool_4",
    //   label: "Tool 4",
    //   icon: IconCamera,
    //   items: [...Array(3)].map((_, index) => ({
    //     id: `tool_4_item_${index + 1}`,
    //     icon: IconCamera,
    //   })),
    // },

    {
      id: "tool_4",
      label: "Tool 4",
      icon: IconBeard,
      items: [
        {

          // id: `tool_2_item_1`,
          id: `tool_4_item_0`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {

          // id: `tool_2_item_1`,
          id: `tool_4_item_1`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_01"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_4_item_2`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_02"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_4_item_3`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_03"
        },
        {
          // id: `tool_2_item_1`,
          id: `tool_4_item_4`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_04"
        },
      ],
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
