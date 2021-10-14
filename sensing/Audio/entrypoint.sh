#!/bin/sh

git clone https://github.com/digitalartexperiencelondon/digital-art-sentiment.git

cd digital-art-sentiment
git checkout audio-input
cd MevonAI-Speech-Emotion-Recognition/src
chmod +x pyaudio.sh
./pyaudio.sh



/bin/sh
