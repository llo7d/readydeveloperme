import { SVGProps } from "react";

import IconCamera from "../assets/icons/IconCamera";
import IconPose from "../assets/icons/IconPose";
import IconColor from "../assets/icons/IconColor";
import IconAirpod from "../assets/icons/IconAirpod";
import IconFace from "../assets/icons/IconFace";
import IconImage from "../assets/icons/IconImage";
import IconContrast from "../assets/icons/IconContrast";
import IconHair from "../assets/icons/IconHair";
import IconNo from "../assets/icons/IconNo";
import IconBeard from "../assets/icons/IconBeard";
import IconGlasses from "../assets/icons/IconGlasses";
import IconPose1 from "../assets/icons/IconPose1";

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
    {
      id: "pose",
      label: "Poses",
      icon: IconPose,
      items: [
        {
          id: `pose_crossed_arm`,
          name: "CrossedArm",
          icon: IconPose1,
        },
        {
          id: `pose_confident`,
          name: "Confident",
          icon: IconPose,
        },
        {
          id: `pose_character_stop`,
          name: "CharacterStop",
          icon: IconPose,
        },
        {
          id: `pose_confused`,
          name: "Confused",
          icon: IconPose,
        },

        {
          id: `pose_happy_open_arm`,
          name: "HappyOpenArm",
          icon: IconPose,
        },
        {
          id: `pose_jump_happy`,
          name: "JumpHappy",
          icon: IconPose,
        },
        {
          id: `pose_on_phone`,
          name: "OnPhone",
          icon: IconPose,
        },
        {
          id: `pose_pc01`,
          name: "PC01",
          icon: IconPose,
        },
        {
          id: `pose_pc02`,
          name: "PC02",
          icon: IconPose,
        },
        {
          id: `pose_crossed_arm_1`,
          name: "CrossedArm",
          icon: IconPose,
        },
        {
          id: `pose_pointing_down`,
          name: "PointingDown",
          icon: IconPose,
        },
        {
          id: `pose_pointing_left`,
          name: "PointingLeft",
          icon: IconPose,
        },
        {
          id: `pose_pointing_right`,
          name: "PointingRight",
          icon: IconPose,
        },
        {
          id: `pose_pointing_up`,
          name: "PointingUp",
          icon: IconPose,
        },
        {
          id: `pose_sitting_happy`,
          name: "SittingHappy",
          icon: IconPose,
        },
        {
          id: `pose_sitting_sad`,
          name: "SittingSad",
          icon: IconPose,
        },
        {
          id: `pose_standing1`,
          name: "Standing1",
          icon: IconPose,
        },
        {
          id: `pose_standing_sad`,
          name: "StandingSad",
          icon: IconPose,
        },
        {
          id: `pose_standing_thinking`,
          name: "StandingThinking",
          icon: IconPose,
        },
        {
          id: `pose_waving`,
          name: "Waving",
          icon: IconPose,
        },
        {
          id: `pose_welcome`,
          name: "Welcome",
          icon: IconPose,
        },
      ]
    },

    {
      id: "tool_2",
      label: "Colors",
      icon: IconColor,
      items: [
        {
          id: `tool_2_item_1`,
          icon: IconHair,
          color: "red",
        },
        {
          id: `tool_2_item_2`,
          icon: IconBeard,
          color: "green",
        },
        {
          id: `tool_2_item_3`,
          icon: IconColor,
          color: "green",
        },
        {
          id: `tool_2_item_4`,
          icon: IconColor,
          color: "green",
        },
        {
          id: `tool_2_item_5`,
          icon: IconColor,
          color: "green",
        },
        {
          id: `tool_2_item_6`,
          icon: IconColor,
          color: "green",
        },
      ]
    },


    {
      id: "hair",
      label: "Hair",
      icon: IconHair,
      items: [
        {
          id: `hair_none`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {
          id: `hair_1`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_01"
        },
        {
          id: `hair_2`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_02"
        },
        {
          id: `hair_3`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_03"
        },
        {
          id: `hair_4`,
          icon: IconHair,
          color: "green",
          name: "GEO_Hair_04"
        },
      ],
    },

    {
      id: "beard",
      label: "Beard",
      icon: IconBeard,
      items: [
        {

          id: `beard_none`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {

          id: `beard_1`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_01"
        },
        {
          id: `beard_2`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_02"
        },
        {
          id: `beard_3`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_03"
        },
        {
          id: `beard_4`,
          icon: IconBeard,
          color: "green",
          name: "GEO_Beard_04"
        },
      ],
    },

    {
      id: "face",
      label: "Face",
      icon: IconFace,
      items: [
        {
          id: `default`,
          icon: IconFace,
          name: "default"
        },
        {
          id: `round`,
          icon: IconFace,
          name: "round"
        },
        {
          id: `square`,
          icon: IconFace,
          name: "square"
        },

      ]
    },
    {
      id: "glasses",
      label: "Glasses",
      icon: IconGlasses,
      items:
        [{
          id: `glasses_none`,
          icon: IconNo,
          color: "black",
          name: "glasses_none"
        },
        {
          id: `glasses_1`,
          icon: IconGlasses,
          color: "black",
          name: "glasses_1"
        },
        ]
    },
    {
      id: "tool_7",
      label: "Tool 7",
      icon: IconImage,
      items: [...Array(2)].map((_, index) => ({
        id: `tool_7_item_${index + 1}`,
        icon: IconImage,
      })),
    },
  ];
};
