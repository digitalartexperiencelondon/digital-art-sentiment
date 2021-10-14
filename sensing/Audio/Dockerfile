# This is to be run on a laptop as the base image requires AMD
FROM tensorflow/tensorflow:1.15.0-py3

RUN apt-get update && apt -y install git

RUN pip3 install --upgrade pip && python3 -m pip install --upgrade setuptools

RUN apt update
RUN apt -y install libasound2-dev portaudio19-dev libportaudio2 libportaudiocpp0 ffmpeg python3-venv libatlas-base-dev

RUN pip3 uninstall -y keras-nightly

RUN pip3 install \
  librosa \
  matplotlib \
  h5py==2.10.0

RUN apt-get -y install python3-pyaudio

RUN pip3 install \
  keras==2.3.1 \
  torch==1.5.0 \
  pydub==0.24.1 \
  torchvision==0.6.0

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
