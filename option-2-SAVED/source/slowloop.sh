#!/bin/bash
# usage: slowloop.sh <src> <name> <width> <speed> <mode:pal|xf> <crf> [xfade_seconds]
set -e
SRC="$1"; N="$2"; W="$3"; SP="$4"; MODE="$5"; CRF="$6"; XF="${7:-2.5}"
D=/home/claude/opt2/work/out; cd $D
ffmpeg -y -loglevel error -i "$SRC" -vf "scale=$W:-2:flags=lanczos,setpts=PTS/$SP,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -crf 12 -preset veryfast -pix_fmt yuv420p -an $N-slow.mp4
L=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $N-slow.mp4)
ENC="-c:v libx264 -profile:v high -pix_fmt yuv420p -crf $CRF -preset slow -g 60 -keyint_min 30 -movflags +faststart -an"
if [ "$MODE" = pal ]; then
  ffmpeg -y -loglevel error -i $N-slow.mp4 -filter_complex "[0:v]split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[v]" -map "[v]" $ENC $N.mp4
else
  OFF=$(python3 -c "print(round($L-2*$XF,3))"); TAIL=$(python3 -c "print(round($L,3))")
  ffmpeg -y -loglevel error -i $N-slow.mp4 -filter_complex "[0:v]split[x][y];[x]trim=start=$XF:end=$TAIL,setpts=PTS-STARTPTS[a];[y]trim=start=0:end=$XF,setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=$XF:offset=$OFF[v]" -map "[v]" $ENC $N.mp4
fi
ffmpeg -y -loglevel error -i $N.mp4 -frames:v 1 -vf "scale=1600:-2" -quality 72 $N-poster.webp
echo "$N done $(du -h $N.mp4 | cut -f1) $(ffprobe -v error -show_entries format=duration -of csv=p=0 $N.mp4)s"
