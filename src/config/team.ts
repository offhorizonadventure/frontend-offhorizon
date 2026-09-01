import type { StaticImageData } from "next/image";

import bcMeghna from "../../public/team/bc-meghna.jpg";
import bcRhythm from "../../public/team/bc-rhythm.jpg";
import bcSaurabh from "../../public/team/bc-saurabh.jpg";
import bcVishal from "../../public/team/bc-vishal.jpg";
import boShreyush from "../../public/team/bo-shreyush.jpg";
import hobSurya from "../../public/team/hob-st.jpg";
import mctAjay from "../../public/team/mct-ajy.jpg";
import mctHishe from "../../public/team/mct-hb.jpg";
import mctMonu from "../../public/team/mct-ms.jpg";
import mctRajender from "../../public/team/mct-rt.jpg";
import mctSonu from "../../public/team/mct-sn.jpg";
import medAnchal from "../../public/team/med-anchal.jpg";
import medShalni from "../../public/team/med-shalni.jpg";
import medShalu from "../../public/team/med-shalu.jpg";
import octMahinder from "../../public/team/oct-mat.jpg";
import octMuskan from "../../public/team/oct-mt.jpg";
import octTaniya from "../../public/team/oct-tan.jpg";
import octTushar from "../../public/team/oct-tr.jpg";
import ohAditya from "../../public/team/oh-at.jpg";
import ohKrishan from "../../public/team/oh-kri.jpg";
import ohRahul from "../../public/team/oh-rt.jpg";
import ohUjjwal from "../../public/team/oh-ujj.jpg";
import orscNikhil from "../../public/team/orsc-nt.jpg";
import orscRajesh from "../../public/team/orsc-rt.jpg";
import wtsPiyush from "../../public/team/wts-piyush.png";

/** What somebody does. Written once here, translated in the message files. */
export type RoleKey =
  | "director"
  | "motorcycleHead"
  | "selfDriveHead"
  | "webDeveloper"
  | "brandManager"
  | "contentWriter"
  | "contentCamera"
  | "camera"
  | "fpv"
  | "lineProduction"
  | "videoEditor"
  | "techManager"
  | "mechanic"
  | "onRoad"
  | "groundManager"
  | "guide"
  | "backOffice"
  | "targetologist"
  | "manager"
  | "backendSupport"
  | "medical";

export type Member = {
  name: string;
  role: RoleKey;
  /** Missing until somebody sends a photograph, and drawn as a silhouette. */
  photo?: StaticImageData;
  links?: { linkedin?: string; instagram?: string };
};

export type GroupKey =
  "lead" | "leadership" | "website" | "brand" | "technical" | "ground" | "office" | "medical";

export type TeamGroup = { key: GroupKey; members: Member[] };

export const team: TeamGroup[] = [
  {
    key: "lead",
    members: [{ name: "Surya Thakur", role: "director", photo: hobSurya }],
  },
  {
    key: "leadership",
    members: [
      { name: "Krishan Dev", role: "director", photo: ohKrishan },
      { name: "Rahul Thakur", role: "motorcycleHead", photo: ohRahul },
      { name: "Aditya", role: "selfDriveHead", photo: ohAditya },
    ],
  },
  {
    key: "website",
    members: [
      {
        name: "Piyush Manna",
        role: "webDeveloper",
        photo: wtsPiyush,
        links: {
          linkedin: "https://www.linkedin.com/in/pcodesdaily/",
          instagram: "https://www.instagram.com/piyushiitm/",
        },
      },
    ],
  },
  {
    key: "brand",
    members: [
      { name: "Sam Mehta", role: "brandManager" },
      { name: "Meghna Mehta", role: "contentWriter", photo: bcMeghna },
      { name: "Tushar Ranta", role: "contentCamera", photo: octTushar },
      { name: "Shubhan", role: "camera" },
      { name: "Nitin", role: "camera" },
      { name: "Gavy Sekhon", role: "fpv" },
      { name: "Abhishek", role: "lineProduction" },
      { name: "Rhythm Sinha", role: "videoEditor", photo: bcRhythm },
      { name: "Saurabh Negi", role: "videoEditor", photo: bcSaurabh },
      { name: "Vishal Singh Manhas", role: "videoEditor", photo: bcVishal },
    ],
  },
  {
    key: "technical",
    members: [
      { name: "Monu Sager", role: "techManager", photo: mctMonu },
      { name: "Rajender Thakur", role: "mechanic", photo: mctRajender },
      { name: "Hishe Bodh", role: "mechanic", photo: mctHishe },
      { name: "Ajay", role: "mechanic", photo: mctAjay },
      { name: "Sonu", role: "mechanic", photo: mctSonu },
      { name: "Nikhil Thakur", role: "onRoad", photo: orscNikhil },
      { name: "Rajesh Thakur", role: "onRoad", photo: orscRajesh },
      { name: "Nitesh", role: "onRoad" },
    ],
  },
  {
    key: "ground",
    members: [
      { name: "Ujjwal (Oggi)", role: "groundManager", photo: ohUjjwal },
      { name: "Manaish Thakur", role: "guide" },
      { name: "Amir Dai", role: "guide" },
      { name: "Sudeep Dai", role: "guide" },
      { name: "Pawan Thakur", role: "guide" },
      { name: "Harsh", role: "guide" },
    ],
  },
  {
    key: "office",
    members: [
      { name: "Mahinder Thakur", role: "manager", photo: octMahinder },
      { name: "Muskan Thakur", role: "backOffice", photo: octMuskan },
      { name: "Taniya", role: "targetologist", photo: octTaniya },
      { name: "Shreyush Sharma", role: "backendSupport", photo: boShreyush },
    ],
  },
  {
    key: "medical",
    members: [
      { name: "Shalu", role: "medical", photo: medShalu },
      { name: "Anchal Thakur", role: "medical", photo: medAnchal },
      { name: "Shalni Thakur", role: "medical", photo: medShalni },
    ],
  },
];

export const crewCount = team.reduce((total, group) => total + group.members.length, 0);
