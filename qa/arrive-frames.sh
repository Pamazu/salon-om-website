#!/bin/sh
# Cuts each arrival a filmed speed.mjs case (VIDEO=dir) kept into one strip: 28 frames, 50 ms apart, from 200 ms before the
# reader arrives, so what the step shows on arriving is looked at frame by frame (task 1ff4c3f4).
#   sh qa/arrive-frames.sh <case.json> <outdir>
set -e
J="$1"; O="$2"; mkdir -p "$O"
FF="${FFMPEG:-$(command -v ffmpeg || echo /opt/homebrew/bin/ffmpeg)}"
node -e '
const rows = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
for (const r of rows) {
  for (const s of r.walk || []) if (s.vMs != null && r.walkVideo) console.log([r.walkVideo, s.vMs, r.v + "-" + r.w + "-walk-" + s.id].join("\t"));
  if (r.direct && r.direct.video) console.log([r.direct.video, r.direct.vMs, r.v + "-" + r.w + "-jump-" + r.direct.id].join("\t"));
}' "$J" | while IFS="$(printf '\t')" read -r vid ms name; do
  ss=$(node -e "console.log(Math.max(0, ($ms - 200) / 1000).toFixed(3))")
  "$FF" -loglevel error -y -ss "$ss" -t 1.4 -i "$vid" -vf "fps=20,scale=360:-2,tile=7x4:padding=4:color=white" -frames:v 1 "$O/$name.png" < /dev/null
  echo "$O/$name.png"
done
