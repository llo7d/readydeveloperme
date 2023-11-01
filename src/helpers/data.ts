import { SVGProps } from "react";

import IconPose from "../assets/icons/IconPose";
import IconColor from "../assets/icons/IconColor";
import IconFace from "../assets/icons/IconFace";
import IconImage from "../assets/icons/IconImage";
import IconNo from "../assets/icons/IconNo";
import IconBeard from "../assets/icons/IconBeard";
import IconGlasses from "../assets/icons/IconGlasses";
import IconPose1 from "../assets/icons/IconPose1";
import IconHair1 from "../assets/icons/IconHair1";
import IconHair2 from "../assets/icons/IconHair2";
import IconHair3 from "../assets/icons/IconHair3";
import IconHair4 from "../assets/icons/IconHair4";
import IconBeard1 from "../assets/icons/IconBeard1";
import IconBeard2 from "../assets/icons/IconBeard2";
import IconBeard3 from "../assets/icons/IconBeard3";
import IconBeard4 from "../assets/icons/IconBeard4";
import IconLight from "../assets/icons/IconLight";
import IconAddImage from "../assets/icons/IconAddImage";
import IconPose2 from "../assets/icons/IconPose2";
import IconPose3 from "../assets/icons/IconPose3";
import IconPose4 from "../assets/icons/IconPose4";
import IconPose5 from "../assets/icons/IconPose5";
import IconPose6 from "../assets/icons/IconPose6";
import IconPose7 from "../assets/icons/IconPose7";
import IconPose8 from "../assets/icons/IconPose8";
import IconPose9 from "../assets/icons/IconPose9";
import IconPose10 from "../assets/icons/IconPose10";
import IconPose11 from "../assets/icons/IconPose11";
import IconPose12 from "../assets/icons/IconPose12";
import IconPose13 from "../assets/icons/IconPose13";
import IconPose14 from "../assets/icons/IconPose14";
import IconPose15 from "../assets/icons/IconPose15";
import IconPose16 from "../assets/icons/IconPose16";
import IconPose17 from "../assets/icons/IconPose17";
import IconPose18 from "../assets/icons/IconPose18";
import IconPose19 from "../assets/icons/IconPose19";
import IconPose20 from "../assets/icons/IconPose20";
import IconT1 from "../assets/icons/IconT1";
import IconT2 from "../assets/icons/IconT2";
import IconPants1 from "../assets/icons/IconPants1";
import IconPants2 from "../assets/icons/IconPants2";
import IconPants3 from "../assets/icons/IconPants3";
import IconShoes1 from "../assets/icons/IconShoes1";
import IconShoes2 from "../assets/icons/IconShoes2";
import IconShoes3 from "../assets/icons/IconShoes3";
import IconWatch from "../assets/icons/IconWatch";
import IconHats from "../assets/icons/IconHats";
import IconPose0 from "../assets/icons/IconPose0";
import IconGlasses1 from "../assets/icons/IconGlasses2";


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
          id: `Default`,
          name: "Default",
          icon: IconPose0,
        },
        {
          id: `pose_crossed_arm`,
          name: "CrossedArm",
          icon: IconPose1,
        },
        {
          id: `pose_confident`,
          name: "Confident",
          icon: IconPose2,
        },
        {
          id: `pose_character_stop`,
          name: "CharacterStop",
          icon: IconPose3,
        },
        {
          id: `pose_confused`,
          name: "Confused",
          icon: IconPose4,
        },

        {
          id: `pose_happy_open_arm`,
          name: "HappyOpenArm",
          icon: IconPose6,
        },
        {
          id: `pose_jump_happy`,
          name: "JumpHappy",
          icon: IconPose5,
        },
        {
          id: `pose_on_phone`,
          name: "OnPhone",
          icon: IconPose7,
        },
        {
          id: `pose_pc01`,
          name: "PC01",
          icon: IconPose8,
        },
        {
          id: `pose_pc02`,
          name: "PC02",
          icon: IconPose9,
        },
        {
          id: `pose_pointing_down`,
          name: "PointingDown",
          icon: IconPose10,
        },
        {
          id: `pose_pointing_left`,
          name: "PointingLeft",
          icon: IconPose11,
        },
        {
          id: `pose_pointing_right`,
          name: "PointingRight",
          icon: IconPose12,
        },
        {
          id: `pose_pointing_up`,
          name: "PointingUp",
          icon: IconPose13,
        },
        {
          id: `pose_sitting_happy`,
          name: "SittingHappy",
          icon: IconPose14,
        },
        {
          id: `pose_sitting_sad`,
          name: "SittingSad",
          icon: IconPose15,
        },
        {
          id: `pose_standing1`,
          name: "Standing1",
          icon: IconPose16,
        },
        {
          id: `pose_standing_sad`,
          name: "StandingSad",
          icon: IconPose17,
        },
        {
          id: `pose_standing_thinking`,
          name: "StandingThinking",
          icon: IconPose18,
        },
        {
          id: `pose_waving`,
          name: "Waving",
          icon: IconPose19,
        },
        {
          id: `pose_welcome`,
          name: "Welcome",
          icon: IconPose20,
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
          icon: IconHair1,
        },
        {
          id: `tool_2_item_2`,
          icon: IconBeard,
        },
        {
          id: `tool_2_item_3`,
          icon: IconT1,
        },
        {
          id: `tool_2_item_4`,
          icon: IconT2,
        },
        {
          id: `tool_2_item_5`,
          icon: IconPants1,
        },
        {
          id: `tool_2_item_6`,
          icon: IconPants2,
        },
        {
          id: `tool_2_item_7`,
          icon: IconPants3,
        },
        {
          id: `tool_2_item_8`,
          icon: IconShoes1,
        },
        {
          id: `tool_2_item_9`,
          icon: IconShoes2,
        },
        {
          id: `tool_2_item_10`,
          icon: IconShoes3,
        },
        {
          id: `tool_2_item_11`,
          icon: IconWatch,
        },
        {
          id: `tool_2_item_12`,
          icon: IconHats,
        },
      ]
    },


    {
      id: "hair",
      label: "Hair",
      icon: IconHair1,
      items: [
        {
          id: `hair_none`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {
          id: `hair_1`,
          icon: IconHair1,
          color: "green",
          name: "GEO_Hair_01"
        },
        {
          id: `hair_2`,
          icon: IconHair2,
          color: "green",
          name: "GEO_Hair_02"
        },
        {
          id: `hair_3`,
          icon: IconHair3,
          color: "green",
          name: "GEO_Hair_03"
        },
        {
          id: `hair_4`,
          icon: IconHair4,
          color: "green",
          name: "GEO_Hair_04"
        },
      ],
    },

    {
      id: "beard",
      label: "Beard",
      icon: IconBeard1,
      items: [
        {

          id: `beard_none`,
          icon: IconNo,
          color: "green",
          name: "None"
        },
        {

          id: `beard_1`,
          icon: IconBeard1,
          color: "green",
          name: "GEO_Beard_01"
        },
        {
          id: `beard_2`,
          icon: IconBeard2,
          color: "green",
          name: "GEO_Beard_02"
        },
        {
          id: `beard_3`,
          icon: IconBeard3,
          color: "green",
          name: "GEO_Beard_03"
        },
        {
          id: `beard_4`,
          icon: IconBeard4,
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
          name: "glasses_none"
        },
        {
          id: "glasses_1",
          icon: IconGlasses,
          name: "glasses_1"
        },
        {
          id: "glasses_2",
          icon: IconGlasses,
          name: "glasses_2"
        },
        {
          id: "glasses_3",
          icon: IconGlasses1,
          name: "glasses_3"
        },
        {
          id: "glasses_4",
          icon: IconGlasses1,
          name: "glasses_4"
        },
        ]
    },
    {
      id: "lights",
      label: "Lights",
      icon: IconLight,
      items:
        [
          {

            id: "lights_0",
            icon: IconNo,
            name: "none",
          },
          {

            id: "lights_1",
            icon: IconLight,
            name: "lights_1",
          },
          {
            id: "lights_2",
            icon: IconLight,
            name: "lights_2",
          },
        ]
    },
    {
      id: "hats",
      label: "Hats",
      icon: IconHats,
      items:
        [{
          id: "hat_none",
          icon: IconNo,
          name: "logo_none"
        },
        {
          id: "hat_1",
          icon: IconHats,
          name: "logo_1",
        },

        ]
    },
    {
      id: "logo",
      label: "Logo",
      icon: IconImage,
      items:
        [{
          id: "logo_none",
          icon: IconNo,
          name: "logo_none"
        },
        {
          id: "logo_1",
          icon: IconImage,
          name: "logo_1",
        },
        {
          id: "logo_upload",
          icon: IconAddImage,
          name: "logo_upload",
        },
        ]
    },
  ];
};
