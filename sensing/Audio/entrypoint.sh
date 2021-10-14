#!/bin/sh

git clone https://github.com/digitalartexperiencelondon/digital-art-sentiment.git

cd digital-art-sentiment
git checkout ML-Docker
cd MevonAI-Speech-Emotion-Recognition/src
chmod +x pyaudio.sh
./pyaudio.sh

#This needs to be done in the entrypoint script provided you have mounted the volume
cp -a /records/. /digital-art-sentiment/MevonAI-Speech-Emotion-Recognition/src/input

/bin/bash
