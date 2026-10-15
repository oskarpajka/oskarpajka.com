#!/usr/bin/env bash
# Makes the web versions of the films and the stills from the masters.
# Run from the project folder: bash scripts/encode-media.sh
# Films go to media/web/ (upload these to R2, never commit them).
# Posters and stills go to public/images/ (small, part of the site).
set -euo pipefail
cd "$(dirname "$0")/.."

HOP="media/masters/OskarPajka-Hoplite.sh-Master-3840x2160@24.mp4"
BRI="media/masters/OskarPajka-BridgeMind.ai-Master-2160x2160@24.mp4"
OUT="media/web"
IMG="public/images"
mkdir -p "$OUT" "$IMG"

# One still at an After Effects timecode (h:mm:ss:ff, 24 fps), frame exact.
still () { # master, h, mm, ss, ff, width, name
  local frame=$(( ($2*3600 + 10#$3*60 + 10#$4) * 24 + 10#$5 ))
  ffmpeg -hide_banner -loglevel error -y -i "$1" \
    -vf "select=eq(n\,$frame),scale=$6:-2:flags=lanczos" -frames:v 1 -q:v 3 "$IMG/$7.jpg"
}

# Stills (posters, Breakdown, rebuild frame)
still "$HOP" 0 00 23 14 1920 hoplite-poster
still "$HOP" 0 00 04 14 1920 hoplite-shot-0-00-04-14
still "$HOP" 0 00 12 06 1920 hoplite-shot-0-00-12-06
still "$HOP" 0 00 28 00 1920 hoplite-shot-0-00-28-00
still "$BRI" 0 00 25 12 1440 bridgemind-poster
still "$BRI" 0 00 07 00 1080 bridgemind-shot-0-00-07-00
still "$BRI" 0 00 13 00 1080 bridgemind-shot-0-00-13-00
still "$BRI" 0 00 25 00 1080 bridgemind-shot-0-00-25-00
echo "stills done"

X264="-c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart -tag:v avc1"

# Player films
ffmpeg -hide_banner -loglevel error -y -i "$HOP" -vf scale=1920:-2:flags=lanczos $X264 -crf 21 \
  -c:a aac -b:a 160k "$OUT/hoplite-1080.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$BRI" -vf scale=1080:-2:flags=lanczos $X264 -crf 21 \
  -an "$OUT/bridgemind-1080.mp4"
# Home page loops (no sound track)
ffmpeg -hide_banner -loglevel error -y -i "$HOP" -vf scale=1280:-2:flags=lanczos $X264 -crf 25 \
  -an "$OUT/hoplite-loop-720.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$BRI" -vf scale=720:-2:flags=lanczos $X264 -crf 25 \
  -an "$OUT/bridgemind-loop-720.mp4"
echo "films done"
ls -la "$OUT" "$IMG"
