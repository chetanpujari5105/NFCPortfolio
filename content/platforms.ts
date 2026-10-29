import type { Platforms } from "./schema";

export const platforms = {
  primary: [
    { name: "Udemy", url: "https://www.udemy.com/user/chetan-pujari-3/", handle: "udemy.com/user/chetan-pujari-3", logo: "U" },
    { name: "Skillshare", url: "https://www.skillshare.com/en/profile/Chetan-Pujari/2609232", handle: "skillshare.com", logo: "S" },
    { name: "TutorialsPoint", url: "https://market.tutorialspoint.com/profile/chetan-pujari", handle: "market.tutorialspoint.com", logo: "T" },
    { name: "Starweaver", url: "https://do.starweaver.com/channels/chetan-pujari/about-me", handle: "do.starweaver.com", logo: "S" },
    { name: "Packt", url: null, logo: "P", note: "Distributed to Coursera, O’Reilly & more" },
    { name: "YouTube", url: "https://www.youtube.com/@ImaginaryProgrammer", handle: "@ImaginaryProgrammer", logo: "Y" },
  ],
  distribution: [
    "ACI Learning",
    "Edflex",
    "HowNow",
    "Odilo",
    "OpenSesame",
    "Go1",
    "Calibr",
    "Coursera",
    "Cornerstone",
    "IIHT",
    "Packt B2B",
    "Packt Academic",
    "NIIT",
    "O’Reilly",
  ],
} satisfies Platforms;
