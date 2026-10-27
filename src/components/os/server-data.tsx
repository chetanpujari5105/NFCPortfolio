"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { BlogPost } from "@content/schema";

export type FeedPost = BlogPost & { excerpt: string };

export type LatestVideo = { id: string; title: string; url: string; published: string; thumb: string };

type ServerData = { posts: FeedPost[]; fromFeed: boolean; video: LatestVideo | null };

const Ctx = createContext<ServerData>({ posts: [], fromFeed: false, video: null });

/** Hands server-fetched data (Substack RSS) to the client-side apps. */
export function ServerDataProvider({ value, children }: { value: ServerData; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useServerData = () => useContext(Ctx);
