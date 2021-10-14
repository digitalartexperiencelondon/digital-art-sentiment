#!/bin/sh

#Move into Dockerfile when git repo is stable
git clone https://github.com/digitalartexperiencelondon/digital-art-sentiment.git

cd digital-art-sentiment
git checkout ML-Docker
cd MevonAI-Speech-Emotion-Recognition/src
chmod +x pyaudio.sh
./pyaudio.sh

#This needs to be done in the entrypoint script provided you have mounted the volume
cp -a /records/. /digital-art-sentiment/MevonAI-Speech-Emotion-Recognition/src/input

#python3 speechEmotionRecognition.py
# Something needs to run either here or in speechEmotionRecognition.py to turn the outputted sentiments into the right format and push it to the database

/bin/bash
