"""Entrypoint for the bring-the-humans-03 make.fun entry.

Reads VIDEO.json (the TikTok ad this entry submits), validates the
video address, and prints the entry summary plus the caption
checklist the bounty requires. Standard library only, no network.
"""

import json
import sys
from urllib.parse import urlparse

PLAY_CODE = "makefun-teacup-rose-bobcat"
BOUNTY_URL = "https://make.fun/bounty/bring-the-humans-03"


def load_video_url(path="VIDEO.json"):
    """Return the TikTok video URL stored in the entry's VIDEO.json."""
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    url = data.get("url")
    if not isinstance(url, str) or not url:
        raise ValueError(f"{path} does not carry a usable 'url' string")
    return url


def parse_video_url(url):
    """Validate a TikTok video URL; return (handle, video_id)."""
    parts = urlparse(url)
    if parts.scheme != "https":
        raise ValueError(f"video URL must use https: {url!r}")
    host = parts.hostname or ""
    if not host.endswith("tiktok.com"):
        raise ValueError(f"video URL is not on tiktok.com: {url!r}")
    segments = [seg for seg in parts.path.split("/") if seg]
    if len(segments) != 3 or not segments[0].startswith("@"):
        raise ValueError(f"unexpected TikTok path: {parts.path!r}")
    handle, kind, video_id = segments
    if kind != "video" or not video_id.isdigit():
        raise ValueError(f"not a video address: {parts.path!r}")
    return handle, video_id


def caption_checklist():
    """The three things the bounty requires in the video's caption."""
    return [
        '"$500 bounty" written in the caption',
        "make.fun written out (or the bounty link)",
        "one play code: " + PLAY_CODE,
    ]


def main():
    url = load_video_url()
    handle, video_id = parse_video_url(url)
    print("TikTok video:", url)
    print("Handle:", handle)
    print("Video id:", video_id)
    print("Bounty:", BOUNTY_URL)
    print("Caption checklist:")
    for item in caption_checklist():
        print("- " + item)
    return 0


if __name__ == "__main__":
    sys.exit(main())
