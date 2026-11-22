// main.ts — entrypoint for the bring-the-humans-03 entry.
// Reads VIDEO.json (the TikTok video entered in this competition),
// validates its URL, and prints the video details together with the
// caption checklist the entry relies on. Node builtins only; the
// script makes no network calls and exits non-zero on a bad entry.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLAY_CODE: string = "makefun-teacup-rose-bobcat";
const BOUNTY_URL: string = "https://make.fun/bounty/bring-the-humans-03";

interface VideoRef {
  handle: string;
  videoId: string;
  url: string;
}

function loadVideoUrl(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, "VIDEO.json"), "utf8");
  const data = JSON.parse(raw) as { url?: unknown };
  if (typeof data.url !== "string" || data.url.length === 0) {
    throw new Error("VIDEO.json does not contain a non-empty \"url\" string");
  }
  return data.url;
}

function parseVideoUrl(url: string): VideoRef {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`VIDEO.json url is not a valid URL: ${url}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`TikTok video URL must use https, got: ${parsed.protocol}`);
  }
  const host = parsed.hostname;
  if (host !== "tiktok.com" && !host.endsWith(".tiktok.com")) {
    throw new Error(`TikTok video URL must be on tiktok.com, got host: ${host}`);
  }
  const segments = parsed.pathname.split("/").filter((s) => s.length > 0);
  const looksRight =
    segments.length === 3 &&
    segments[0].startsWith("@") &&
    segments[1] === "video" &&
    /^\d+$/.test(segments[2]);
  if (!looksRight) {
    throw new Error(
      `Unexpected TikTok path, expected /@handle/video/<id>, got: ${parsed.pathname}`,
    );
  }
  return { handle: segments[0], videoId: segments[2], url };
}

function captionChecklist(): string[] {
  return [
    "the caption names the $500 bounty on offer for this competition",
    "the caption names make.fun as the place running the bounty",
    `the caption carries the entry play code ${PLAY_CODE}`,
  ];
}

function main(): void {
  const ref = parseVideoUrl(loadVideoUrl());
  console.log(`TikTok video: ${ref.url}`);
  console.log(`Handle: ${ref.handle}`);
  console.log(`Video id: ${ref.videoId}`);
  console.log(`Bounty: ${BOUNTY_URL}`);
  console.log("Caption checklist:");
  for (const item of captionChecklist()) {
    console.log(`- ${item}`);
  }
}

main();
