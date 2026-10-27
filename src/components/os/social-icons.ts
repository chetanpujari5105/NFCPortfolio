import type { Social } from "@content/schema";

import type { BrandMark } from "./BrandIcon";
import { github, instagram, linkedin, substack, udemy, x, youtube } from "./brand-marks";

/** Each social link shows its brand's official mark (see BrandIcon). */
export const SOCIAL_MARK: Record<Social["id"], BrandMark> = {
  linkedin,
  x,
  instagram,
  "ai-instagram": instagram,
  substack,
  udemy,
  youtube,
  github,
};

/** Home-screen items with a `brand` slug */
export const HOME_MARKS: Record<string, BrandMark> = { linkedin, x, youtube, github };

export const FOLDER_SOCIALS: Social["id"][] = ["linkedin", "x", "instagram", "ai-instagram", "substack", "udemy", "github"];
