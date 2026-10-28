import type { Profile } from "./schema";

export const profile = {
  name: "Chetan Pujari",
  firstName: "Chetan",
  lastName: "Pujari",
  tagline: "I make Tech, AI & Design simple.",
  headline: "I Make Tech, AI & Design Simple — So You Can Do More.",
  typingLine: "I teach AI to 400K+ students 🤖",
  subHeadline:
    "Bestselling Instructor on 21+ Platforms · 400,000+ Students Worldwide · Workshop Speaker at Top NITs",
  role: "AI Educator",
  shortBio:
    "AI educator and bestselling online instructor. 400K+ students in 190+ countries across 21+ platforms.",
  intro:
    "What if learning AI, design, and automation felt as simple as scrolling through your favorite feed? That's exactly what I do. I'm Chetan — and I've helped 400,000+ students across 190+ countries turn confusing tech into real-world skills they actually use. No jargon. No fluff. Just clear, practical knowledge that gets you results — whether you're picking up your first skill or leveling up your career.",
  footerTagline: "Making Tech Simple, One Course at a Time.",
  location: "Pune, India",
  education: "Sinhgad College of Engineering (SIT Lonavala)",
  email: "chetanpujari92@gmail.com",
  responseTime: "I usually respond within 24 hours.",
  status: "Available for projects",
  avatar: "/content/profile-pic-2.webp",
  badges: ["Bestselling Instructor", "21+ Platforms", "NIT Workshop Speaker"],
  highlight: {
    title: "NIT Surat (SVNIT) · MINDBEND",
    text: "Led a hands-on Prompt Engineering workshop during SVNIT's MINDBEND tech fest — students reverse-engineered AI outputs like pros.",
  },
  socials: [
    { id: "linkedin", label: "LinkedIn", handle: "chetan-pujari-ai", url: "https://www.linkedin.com/in/chetan-pujari-ai" },
    { id: "x", label: "X", handle: "@Chetanpujari51", url: "https://x.com/Chetanpujari51" },
    { id: "instagram", label: "Instagram", handle: "@_chetan_pujari", url: "https://www.instagram.com/_chetan_pujari/" },
    { id: "ai-instagram", label: "AI Instagram", handle: "@_chetan_pujari_", url: "https://www.instagram.com/_chetan_pujari_/" },
    { id: "substack", label: "Substack", handle: "chetanpujari", url: "https://chetanpujari.substack.com/" },
    { id: "udemy", label: "Udemy", handle: "chetan-pujari-3", url: "https://www.udemy.com/user/chetan-pujari-3/" },
    { id: "youtube", label: "YouTube", handle: "@ImaginaryProgrammer", url: "https://www.youtube.com/@ImaginaryProgrammer" },
    { id: "github", label: "GitHub", handle: "chetanpujari5105", url: "https://github.com/chetanpujari5105" },
  ],
  udemyProfile: "https://www.udemy.com/user/chetan-pujari-3/",
  youtube: "https://www.youtube.com/@ImaginaryProgrammer",
  substack: "https://chetanpujari.substack.com/",
  github: "chetanpujari5105",
  stats: {
    students: 400000,
    courses: 21,
    platforms: 21,
    countries: 190,
    yearsTeaching: 6,
    linkedinImpressions2025: 539000,
  },
} satisfies Profile;
