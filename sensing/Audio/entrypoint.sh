#!/bin/sh

git clone https://github.com/digitalartexperiencelondon/digital-art-sentiment.git

cd digital-art-sentiment
git checkout audio-input
cd MevonAI-Speech-Emotion-Recognition/src
chmod +x pyaudio.sh
./pyaudio.sh

#This needs to be done in the entrypoint script provided you have moun
cp -a /input/. /digital-art-sentiment/MevonAI-Speech-Emotion-Recognition/src/

/bin/bash
