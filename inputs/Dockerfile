# Base Docker image, has to use 3.6 or lower for tensorflow
FROM python:3.6

RUN pip3 install --upgrade pip && python3 -m pip install --upgrade setuptools

RUN apt update
RUN apt -y install libasound2-dev portaudio19-dev libportaudio2 libportaudiocpp0 ffmpeg python3-venv
RUN apt-get -y install python3-pyaudio

RUN pip3 uninstall -y keras-nightly
RUN pip3 install --upgrade pip && pip3 install \
  librosa \
  matplotlib \
  h5py==2.10.0 \
  tensorflow==1.15 \
  keras==2.3.1 \
  torch==1.5.0 \
  pydub==0.24.1 \
  torchvision==0.6.0

RUN chmod +x pyaudio.sh && ./pyaudio.sh
