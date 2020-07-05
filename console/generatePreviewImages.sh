#!/bin/bash

FILES="$@"

for i in $FILES 
do
  basename=$(basename "$i")
  dirname=$(dirname "$i")
  extension="${basename##*.}"
  target="$dirname/${basename%.*}.preview.$extension"
  if [ "${extension,,}" = "jpg" -o "${extension,,}" = "png" ]; then
    echo "Processing $i ..."
    convert $i -auto-orient -thumbnail '300x225^' -gravity center -extent 300x225 $target
  else
    echo "Unsupported file extension *.$extension in $basename (skipping) ..."
  fi
done
