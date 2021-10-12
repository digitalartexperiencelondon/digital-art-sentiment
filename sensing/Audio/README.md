# Running a ML model on a Raspberry Pi to turn audio inputs into sentiments

## Building the Docker container
Navigate to the directory containing the Dockerfile on the Raspberry Pi.

Run
`sudo docker build -t audio-input .`
This builds a Docker image called `audio-input`. This stage might take a while the first time it is run, due to the size of the layers.

### Interactively experiment with the Docker container and required packages
Alternatively, to test whether the base image works you can run
`sudo docker pull armindocachada/tensorflow2-raspberrypi4:2.3.0-cp35-none-linux_armv7l`.
And then you should be able to run
`sudo docker run -it armindocachada/tensorflow2-raspberrypi4:2.3.0-cp35-none-linux_armv7l /bin/sh`
Once in the container, you can run all the commands listed in the Dockerfile (with `RUN` removed) and progressively change them as required.

## Running the Docker container
Run
`sudo docker run -it audio-input /bin/sh`.
This should get you into the Docker container.

If it fails, tell Sonal which line it failed on.
