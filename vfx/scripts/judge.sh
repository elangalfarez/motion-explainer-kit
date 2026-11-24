#!/bin/bash
# Side-by-side judge tools. REF = original video.
#   judge.sh grid  REF START DUR FPS OUT.jpg          # measure: timestamped contact grid of the original (e.g. 30fps)
#   judge.sh strip REF MINE.mp4 START DUR FPS OUT.jpg  # judge: original on top, mine below, per-time pairs
#   judge.sh still REF STILLDIR T1 T2 ...              # judge: o_T | s_T side by side (needs STILLDIR/s_T.jpg from render.py stills)
#   judge.sh overlay REF STILLDIR T                    # judge: red=original, cyan=mine; misaligned shapes show as colour fringes
#   judge.sh sbs REF MINE.mp4 OUT.mp4                  # deliverable: original left | mine right
set -e; M=$1; shift
case $M in
grid) R=$1;S=$2;D=$3;F=$4;O=$5;N=$(python3 -c "import math;print(math.ceil($D*$F))");C=$(python3 -c "import math;print(min(10,$N))");RW=$(python3 -c "import math;print(math.ceil($N/$C))")
  ffmpeg -loglevel error -y -ss $S -t $D -i "$R" -vf "fps=$F,scale=384:216,drawtext=text='%{pts\:hms}':x=4:y=4:fontcolor=yellow:fontsize=18:box=1:boxcolor=black@.5,tile=${C}x${RW}" -frames:v 1 "$O";;
strip) R=$1;V=$2;S=$3;D=$4;F=$5;O=$6;N=$(python3 -c "print(int($D*$F))")
  ffmpeg -loglevel error -y -ss $S -t $D -i "$R" -ss $S -t $D -i "$V" -filter_complex \
  "[0:v]fps=$F,scale=320:180,drawtext=text='O %{pts\:hms}':x=4:y=4:fontcolor=yellow:fontsize=16[a];[1:v]fps=$F,scale=320:180,drawtext=text='V':x=4:y=4:fontcolor=cyan:fontsize=16[b];[a][b]vstack,tile=${N}x1" -frames:v 1 "$O";;
still) R=$1;DIR=$2;shift 2; for t in "$@"; do ffmpeg -loglevel error -y -ss $t -i "$R" -frames:v 1 "$DIR/o_$t.jpg"
  ffmpeg -loglevel error -y -i "$DIR/o_$t.jpg" -i "$DIR/s_$t.jpg" -filter_complex "[0]scale=960:540[a];[1]scale=960:540[b];[a][b]hstack" "$DIR/c_$t.jpg"; echo "$DIR/c_$t.jpg"; done;;
overlay) R=$1;DIR=$2;t=$3; ffmpeg -loglevel error -y -ss $t -i "$R" -frames:v 1 "$DIR/o_$t.jpg"
  ffmpeg -loglevel error -y -i "$DIR/o_$t.jpg" -i "$DIR/s_$t.jpg" -filter_complex "[0]format=gray,scale=1920:1080[a];[1]format=gray,scale=1920:1080,split[b][c];[b][c][a]mergeplanes=0x001020:gbrp" "$DIR/x_$t.jpg"; echo "$DIR/x_$t.jpg";;
sbs) R=$1;V=$2;O=$3; ffmpeg -loglevel error -y -i "$R" -i "$V" -filter_complex "[0:v]scale=960:540[a];[1:v]scale=960:540[b];[a][b]hstack" -an -c:v libx264 -crf 20 -pix_fmt yuv420p "$O"; echo "$O";;
*) echo "modes: grid strip still overlay sbs"; exit 1;;
esac
