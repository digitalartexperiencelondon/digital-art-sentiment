# Running the Mevon-AI Machine Learning model in a Docker container on a desktop

## Building the Docker container
Once you have git cloned this repository (by running `git clone https://github.com/digitalartexperiencelondon/digital-art-sentiment.git`), navigate to the directory containing the Dockerfile by running:
`cd digital-art-sentiment/sensing/Audio`.

Open Docker desktop (on your desktop, you should be able to search for Docker in your applications and open it). This will open an application. Go to Settings/Resources, and increase the memory allocation to 3.50GB and the Swap to 2GB.

To build the Docker container, run
`docker build -t audio-ml .`
This builds a Docker image called `audio-ml` (you can change this name to anything of your choosing). This stage might take a while the first time it is run, due to the size of the layers. It will download a large amount from the internet, so it may be worth using Ethernet or closing other applications which are downloading.

## Running the Docker container
Whilst in the `digital-art-sentiment/sensing/Audio` folder on your desktop, create a new folder called `input`.
Run
`docker run -it -v "$(pwd)"/input:/input:ro audio-ml /bin/sh`
This should get you into the Docker container. This maps the `input` folder on your desktop to the Docker container, so that the Docker container has read only access to any files which are put in there.

This means that the audio recordings can be placed in this folder, and when the Docker container is run, the Mevon-AI pre-trained model can analyse the sentiment of these recordings.

## Running the ML model
Once in the Docker container, to run the Mevon-AI machine learning model, run:
`cd digital-art-sentiment/MevonAI-Speech-Emotion-Recognition/src`
and
`python3 speechEmotionRecognition.py`.

This will run the pre-trained machine learning model using the files in src/input.
