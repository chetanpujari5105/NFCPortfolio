import type { Review } from "./schema";

/*
 * Real student reviews, copied word for word from Chetan's Udemy instructor dashboard
 * (Performance → Reviews, 5 stars, with a comment) on 2026-10-29. Nothing is reworded, merged or
 * trimmed. `author` is the name exactly as Udemy shows it; `date` is Udemy's own label ("4 years
 * ago"), read on `READ_ON`. One review per person. Reviews from accounts close to Chetan
 * (his own name, family names, his team) were left out on purpose.
 */
export const READ_ON = "2026-10-29";

const FIGMA = {
  course: "UI/UX Design With Figma : 5+ Real World Projects",
  courseShort: "Figma",
  courseUrl: "https://www.udemy.com/course/uiux-design-with-figma-5-real-world-projects2022/?referralCode=162A0121145B10617735",
};
const WEB_MOBILE = {
  course: "Master Web & Mobile Design: Figma, UI/UX Essentials, +More",
  courseShort: "Web & Mobile",
  courseUrl: "https://www.udemy.com/course/master-web-mobile-design-figma-uiux-essentials-more/",
};
const CANVA = {
  course: "Canva Masterclass For Social Media And Content Creation",
  courseShort: "Canva",
  courseUrl: "https://www.udemy.com/course/canva-masterclass-for-social-media-and-content-creation/?referralCode=66F992F39A96477E14B5",
};
const FILMORA = {
  course: "Filmora 11/X/9: Zero to Hero in Video Editing",
  courseShort: "Filmora",
  courseUrl: "https://www.udemy.com/course/filmora9-complete-video-editing-tutorial-for-beginners-2020/",
};
const PREMIERE = {
  course: "Adobe Premiere Pro CC: Video Editing for Beginners",
  courseShort: "Premiere Pro",
  courseUrl: "https://www.udemy.com/course/adobe-premiere-pro-cc-video-editing-for-beginners/",
};
const PROMPTING = {
  course: "Mastering ChatGPT Prompt Engineering: Beginner to Advanced",
  courseShort: "Prompting",
  courseUrl: "https://www.udemy.com/course/mastering-chatgpt-prompt-engineering-beginner-to-advanced/?referralCode=A9C87B6CB177C58EF463",
};
const PROMPT_MASTERY = {
  course: "ChatGPT Prompt Engineering Mastery",
  courseShort: "Prompting",
  courseUrl: "https://www.udemy.com/course/chatgpt-prompt-engineering-mastery/",
};
const MASTERCLASS = {
  course: "ChatGPT Masterclass: Navigating AI and Prompt Engineering",
  courseShort: "Prompting",
  courseUrl: "https://www.udemy.com/course/the-complete-guide-to-chatgpt-ai-prompts-dall-e-more/",
};
const NOTION = {
  course: "Master Notion: Build Your All-in-One Productivity System",
  courseShort: "Notion",
  courseUrl: "https://www.udemy.com/course/master-notion-build-your-all-in-one-productivity-system/?referralCode=B40F9D016BA8B8A77A92",
};

const udemy = { rating: 5, source: "Udemy", verified: true } as const;

/** In order of strength; `featured` ones fill the carousel at the top of the app. */
export const reviews = [
  {
    id: "jeremy-hein",
    ...PROMPT_MASTERY,
    ...udemy,
    featured: true,
    author: "Jeremy Hein",
    date: "11 months ago",
    text: "It really shared the secrets of a pro prompt engineer. Mr. Pujari condensed years of his own experience into numerous insightful lessons. Believe it or not, I will miss his humor, wit, and positive attitude. But I will be using what he taught me everyday!",
  },
  {
    id: "swapnil-idawate",
    ...WEB_MOBILE,
    ...udemy,
    featured: true,
    author: "Swapnil Idawate",
    date: "2 years ago",
    text: "I found this course extremely helpful as I was looking for a carrier change into designing and figma is the best tool out there. The instructor was able to teach the fundamentals of figma very well which boosted my confidence and I feel confident enough to give interviews for designer role.",
  },
  {
    id: "ezinne-awambu",
    ...NOTION,
    ...udemy,
    featured: true,
    author: "Ezinne Awambu",
    date: "1 year ago",
    text: "This course is very detailed and well-structured. I especially love the project sessions, as they provide hands-on practice and make it easier for learners to apply what they’ve learned. Highly recommended for anyone who wants to truly master Notion.",
  },
  {
    id: "jackie-lheen-llosa",
    ...PREMIERE,
    ...udemy,
    featured: true,
    author: "Jackie Lheen Llosa",
    date: "8 months ago",
    text: "i did not only learn all of the editing tools available in Premiere Pro, but also how to edit with the mindset of a professional editor! nice!",
  },
  {
    id: "aditya-roham",
    ...CANVA,
    ...udemy,
    featured: true,
    author: "Aditya Roham",
    date: "3 years ago",
    text: "I used to be the person who would spend hours on Microsoft Paint trying to make a decent graphic. Thanks to the Canva Masterclass, I can now whip up a beautiful design in no time! Thank you sir",
  },
  {
    id: "nicole-jameson",
    ...PROMPTING,
    ...udemy,
    featured: true,
    author: "Nicole Jameson",
    date: "1 year ago",
    text: "I really enjoyed this class. The concepts were broken down into manageable pieces, so they didn't become overwhelming. Highly recommend!",
  },
  {
    id: "yopi-p",
    ...FIGMA,
    ...udemy,
    featured: true,
    author: "Yopi p",
    date: "4 years ago",
    text: "What an amazing figma course. The section 2 is a great overview about what is figma and exploring it's element, and also an overview about what projects that we're going to build.",
  },
  {
    id: "abdulsalam-jamoh",
    ...NOTION,
    ...udemy,
    featured: true,
    author: "Abdulsalam Jamoh",
    date: "1 year ago",
    text: "Am not a fan of leaving a review for courses or books. But i have to leave a review for this course because i really love the course content and how the tutor explain everything in detail i will recommend this course to anybody that is interested in learning notion",
  },
  {
    id: "asmir-imran",
    ...MASTERCLASS,
    ...udemy,
    author: "Asmir Imran",
    date: "1 year ago",
    text: "I am a student of BS AI and I really liked this course also suggest every student not specific Computer field But All Beginners to learn this vital skill : Prompt Engineering",
  },
  {
    id: "amol-satpute",
    ...FIGMA,
    ...udemy,
    author: "Amol satpute",
    date: "4 years ago",
    text: "Every topic is explained very well that's why this is the highest-rated course on Udemy and the instructor knows everything about UI/UX and Figma I highly recommend this tutorial to everyone.",
  },
  {
    id: "sandeshnarsale",
    ...CANVA,
    ...udemy,
    author: "Sandeshnarsale",
    date: "3 years ago",
    text: "I must say that going through this course was a very valuable experience. As someone who had only dabbled in Canva before, I was amazed at the breadth and depth of features that the platform had to offer, and expert guidance helped me make sense of it all.",
  },
  {
    id: "surbhibajirao",
    ...CANVA,
    ...udemy,
    author: "Surbhibajirao",
    date: "3 years ago",
    text: "Fantastic course! Although I used Canva before at school and university, I couldn't expect it to be so universal, especially in terms of video and digital marketing products creation. Thank you",
  },
  {
    id: "abhishek-devidas-kamble",
    ...FIGMA,
    ...udemy,
    author: "Abhishek devidas kamble",
    date: "4 years ago",
    text: "Chetan is a great instructor! I learned a lot. He's also giving some alternative ways from simple to complex ones. I had fun thank you Chetan!",
  },
  {
    id: "shubham-fendar",
    ...FILMORA,
    ...udemy,
    author: "Shubham Fendar",
    date: "5 years ago",
    text: "It's really helpful for me . It gives all details classification of each & every parameters which are used in filmora 9.Great experience I got from Udemy .",
  },
  {
    id: "sagar-s-r",
    ...FILMORA,
    ...udemy,
    author: "Sagar S R",
    date: "4 years ago",
    text: "This course is really good. very well structured and I highly recommend this course if you are starting to learn. learn a lot from this course. Thank you CP!",
  },
  {
    id: "jose-antonio-guzman-gonzalez",
    ...PROMPTING,
    ...udemy,
    author: "Jose Antonio Guzman Gonzalez",
    date: "9 months ago",
    text: "I really liked this course; all the explanations helped me to understand better and enjoyed all the great materials. Thanks a lot.",
  },
] satisfies Review[];

export const verifiedReviews: Review[] = reviews.filter((r) => r.verified);

/** As shown on the public Udemy instructor profile on `READ_ON` (no average rating is shown there). */
export const udemyProfileStats = {
  reviews: 10279,
  learners: 392559,
  url: "https://www.udemy.com/user/chetan-pujari-3/",
};
