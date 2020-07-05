#!/bin/bash

FILES="$@"

for i in $FILES 
do
  basename=$(basename "$i")
  dirname=$(dirname "$i")
  extension="${basename##*.}"
  target="$dirname/${basename%.*}.$extension"
  if [ "${extension,,}" = "jpg" -o "${extension,,}" = "png" ]; then
    echo "Processing $i ..."
    convert $i -auto-orient -resize '1920x1920>' $target
  else
    echo "Unsupported file extension *.$extension in $basename (skipping) ..."
  fi
done
