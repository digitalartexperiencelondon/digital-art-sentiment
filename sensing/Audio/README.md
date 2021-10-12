# Running a ML model on a Raspberry Pi to turn audio inputs into sentiments

## Building the Docker container
Navigate to the directory containing the Dockerfile on the Raspberry Pi.

Run
`sudo docker build -t audio-input .`
This builds a Docker image called `audio-input`. This stage might take a while the first time it is run, due to the size of the layers.
