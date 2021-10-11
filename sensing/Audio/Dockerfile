# Base Docker image, has to use 3.6 or lower for tensorflow
FROM armindocachada/tensorflow2-raspberrypi4

RUN pip3 install --upgrade pip && python3 -m pip install --upgrade setuptools

RUN apt update
RUN apt -y install libasound2-dev portaudio19-dev libportaudio2 libportaudiocpp0 ffmpeg python3-venv
RUN apt-get -y install python3-pyaudio

RUN pip3 uninstall -y keras-nightly
RUN pip3 install --upgrade pip
RUN pip3 install librosa
RUN pip3 install matplotlib
RUN pip3 install h5py==2.10.0
#RUN pip3 install tensorflow==1.15
RUN pip3 install keras==2.3.1
RUN pip3 install torch==1.5.0+cpu
RUN pip3 install pydub==0.24.1
RUN pip3 install torchvision==0.6.0

RUN git clone https://github.com/SuyashMore/MevonAI-Speech-Emotion-Recognition.git

RUN cd MevonAI-Speech-Emotion-Recognition/src
RUN chmod +x /pyaudio.sh && ./pyaudio.sh
