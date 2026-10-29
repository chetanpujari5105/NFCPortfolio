import type { LatestVideo } from "@/components/os/server-data";
import { decode, field } from "@/lib/xml";

import snapshot from "../../public/content/youtube-latest.json";

/** Channel feed (public, no key). */
export const YOUTUBE_FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=UCZHE1x_Qh-8YfgQm44F9KQg";

export function parseVideoFeed(xml: string): LatestVideo | null {
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) return null;
  const id = field(entry, "yt:videoId");
  const title = decode(field(entry, "title"));
  if (!/^[\w-]{6,20}$/.test(id) || !title) return null;
  return {
    id,
    title,
    url: `https://www.youtube.com/watch?v=${id}`,
    published: field(entry, "published").slice(0, 10),
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/** The last video we saw, committed (refresh: `npx tsx scripts/youtube-snapshot.mts`). */
export const SNAPSHOT_VIDEO: LatestVideo | null = parseSnapshot(snapshot);

function parseSnapshot(data: unknown): LatestVideo | null {
  const v = data as Partial<LatestVideo> | null;
  return v?.id && v.title && v.url && v.thumb ? { id: v.id, title: v.title, url: v.url, published: v.published ?? "", thumb: v.thumb } : null;
}

/** The live feed's newest video; when the feed fails or is empty, the snapshot (null only without one). */
export async function fetchLatestVideo(fetchImpl: typeof fetch = fetch): Promise<LatestVideo | null> {
  try {
    const res = await fetchImpl(YOUTUBE_FEED, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
    const video = parseVideoFeed(await res.text());
    if (!video) throw new Error("YouTube feed: no video");
    return video;
  } catch {
    return SNAPSHOT_VIDEO;
  }
}
