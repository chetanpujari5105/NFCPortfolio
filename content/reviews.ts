import type { Review } from "./schema";

/*
 * Imported from the old site's "What My Students Say" section.
 * Every review stays `verified: false` until Chetan confirms it is a real student
 * quote he has permission to publish. Only verified reviews are shown.
 */
export const reviews = [
  {
    name: "Rohit S.",
    role: "Freelance AI Content Writer",
    city: "Nagpur",
    quote:
      "I was stuck in a dead-end data entry job. I took Chetan's ChatGPT Masterclass and within 2 months, I started offering AI-powered content writing services on Fiverr. Last month I made ₹85,000 — more than my old salary. This man changed my life.",
    rating: 5,
    verified: false,
  },
  {
    name: "Priya M.",
    role: "UI/UX Designer",
    city: "Bangalore",
    quote:
      "I signed up for the Figma course with zero design experience. Three months later, I landed a UI/UX job at a Bangalore startup at ₹6.5 LPA. Chetan doesn't just teach tools — he teaches you how to think like a designer.",
    rating: 5,
    verified: false,
  },
  {
    name: "Arjun D.",
    role: "Founder, Digital Marketing Agency",
    city: "Mumbai",
    quote:
      "I run a small marketing agency. After taking Chetan's AI automation course, I set up chatbots and automated workflows for 3 of my clients. One client alone saved ₹2 lakh/month on customer support costs. My agency revenue jumped 40% in a quarter.",
    rating: 5,
    verified: false,
  },
  {
    name: "Kashyap B.",
    role: "Engineering Student",
    city: "SVNIT Surat",
    quote:
      "I attended Chetan's workshop at NIT Surat during MINDBEND. The way he broke down prompt engineering was incredible. I went back and built an AI tool for my college project that our professors couldn't believe was made by a student.",
    rating: 5,
    verified: false,
  },
  {
    name: "Sunita K.",
    role: "School Teacher",
    city: "Pune",
    quote:
      "As a 45-year-old teacher, I was terrified of AI. Chetan's courses feel like a friend explaining things over chai. Now I use ChatGPT to create lesson plans, quizzes, and even my school newsletter. My students think I'm a tech wizard! 😄",
    rating: 5,
    verified: false,
  },
] satisfies Review[];

export const verifiedReviews = reviews.filter((r) => r.verified);
