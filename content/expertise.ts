import type { Expertise } from "./schema";

// relatedCourses / relatedServices cross-link to ids in courses.ts and services.ts. Each area's tile
// (a glyph on an accent) lives in components/apps/expertise-tile.tsx, not here.
export const expertise = [
  {
    id: "ai",
    title: "AI & Prompt Engineering",
    tools: ["ChatGPT", "DeepSeek AI", "Generative AI", "AI Agents", "n8n Automation"],
    relatedCourses: ["prompt-engineering", "google-veo", "heygen-elevenlabs"],
    relatedServices: ["automation", "courses"],
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    tools: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    relatedCourses: ["figma-design"],
    relatedServices: ["design"],
  },
  {
    id: "video",
    title: "Video Editing & Production",
    tools: ["Professional editing", "YouTube content", "Course production"],
    relatedCourses: ["google-veo", "heygen-elevenlabs"],
    relatedServices: ["video"],
  },
  {
    id: "graphic",
    title: "Graphic Design",
    tools: ["Canva", "Visual branding", "Social media graphics"],
    relatedCourses: ["canva-masterclass"],
    relatedServices: ["design", "branding"],
  },
  {
    id: "web",
    title: "Web Development",
    tools: ["HTML", "CSS", "JavaScript", "Google Apps Script", "Vercel deployments"],
    relatedCourses: [],
    relatedServices: ["websites"],
  },
  {
    id: "course-creation",
    title: "Course Creation",
    tools: ["Curriculum design", "Educational psychology", "Multi-platform publishing"],
    relatedCourses: [],
    relatedServices: ["courses"],
  },
  {
    id: "marketing",
    title: "Content Marketing",
    tools: ["LinkedIn strategy", "Substack newsletters", "Instagram growth", "Personal branding"],
    relatedCourses: ["canva-masterclass"],
    relatedServices: ["branding"],
  },
  {
    id: "automation",
    title: "Automation & Productivity",
    tools: ["Notion systems", "AI chatbots", "Appointment booking bots", "Workflow automation"],
    relatedCourses: ["master-notion"],
    relatedServices: ["automation"],
  },
] satisfies Expertise[];
