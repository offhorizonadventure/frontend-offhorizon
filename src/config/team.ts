import type { StaticImageData } from "next/image";

import mctAjay from "../../public/team/mct-ajy.jpg";
import mctHishe from "../../public/team/mct-hb.jpg";
import mctMonu from "../../public/team/mct-ms.jpg";
import mctRajender from "../../public/team/mct-rt.jpg";
import mctSonu from "../../public/team/mct-sn.jpg";
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
import hobSurya from "../../public/team/hob-st.jpg";

export type Member = { name: string; photo: StaticImageData };

/** Crew grouped by function. */
export type TeamGroup = {
  key: "lead" | "operations" | "creative" | "technical" | "support";
  members: Member[];
};

export const team: TeamGroup[] = [
  {
    key: "lead",
    members: [{ name: "Surya Thakur", photo: hobSurya }],
  },
  {
    key: "operations",
    members: [
      { name: "Rahul Thakur", photo: ohRahul },
      { name: "Aditya Thakur", photo: ohAditya },
      { name: "Krishan", photo: ohKrishan },
      { name: "Ujjwal", photo: ohUjjwal },
    ],
  },
  {
    key: "creative",
    members: [
      { name: "Muskan Thakur", photo: octMuskan },
      { name: "Taniya", photo: octTaniya },
      { name: "Tushar Ranta", photo: octTushar },
      { name: "Mahinder Thakur", photo: octMahinder },
    ],
  },
  {
    key: "technical",
    members: [
      { name: "Monu Sagar", photo: mctMonu },
      { name: "Rajender Thakur", photo: mctRajender },
      { name: "Hishe Bodh", photo: mctHishe },
      { name: "Ajay", photo: mctAjay },
      { name: "Sonu", photo: mctSonu },
    ],
  },
  {
    key: "support",
    members: [
      { name: "Nikhil Thakur", photo: orscNikhil },
      { name: "Rajesh Thakur", photo: orscRajesh },
    ],
  },
];

export const crewCount = team.reduce((total, group) => total + group.members.length, 0);
