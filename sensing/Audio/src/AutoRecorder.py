import pyaudio
import math
import struct
import numpy as np
import keras
import librosa
import os
import tensorflow as tf
from keras.preprocessing import sequence
from keras.models import Sequential
from keras.layers import Dense, Embedding
from keras.utils import to_categorical
from keras.layers import Input, Flatten, Dropout, Activation
from keras.layers import Conv1D, MaxPooling1D
from keras.models import Model
from keras.callbacks import ModelCheckpoint
import requests

url= 'http://192.168.1.8:10000/submit'

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


Threshold = 10

SHORT_NORMALIZE = (1.0/32768.0)

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
swidth = 2

TIMEOUT_LENGTH = 1

chunk = RATE*TIMEOUT_LENGTH

f_name_directory = r'./input'

model = keras.models.load_model(
    'model/lstm_cnn_rectangular_lowdropout_trainedoncustomdata.h5')

classes = ['neutral', 'happiness', 'sadness',
           'angry', 'fear', 'disgust', 'surprise']

class Recorder:

    @staticmethod
    def rms(frame):
        count = len(frame) / swidth
        format = "%dh" % (count)
        shorts = struct.unpack(format, frame)

        sum_squares = 0.0
        for sample in shorts:
            n = sample * SHORT_NORMALIZE
            sum_squares += n * n
        rms = math.pow(sum_squares / count, 0.5)

        return rms * 1000

    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=FORMAT,
                                  channels=CHANNELS,
                                  rate=RATE,
                                  input=True,
                                  output=True,
                                  frames_per_buffer=chunk)

    def record(self):
        print('Noise detected, recording beginning')
        rec = []

        data = self.stream.read(chunk)
        
        return data

    def predict(self, recording):
        solutions = []
        filenames = []
        lst = []
        predictions = []
        # print("Sub",subdir)
            
        X =  np.frombuffer(recording, dtype=np.int16).astype(np.float)
        X = X*SHORT_NORMALIZE
        sample_rate = RATE
        
        print(type(X))
        print(min(X), max(X))
        #X = np.double(X)
        
        temp = np.zeros((1, 13, 216))
        
        mfccs = librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=13)
        result = np.zeros((13, 216))
        result[:mfccs.shape[0], :mfccs.shape[1]] = mfccs
        temp[0] = result
        t = np.expand_dims(temp, axis=3)
        
        return classes[model.predict_classes(t)[0]], model.predict(t), classes
       
       
    def upload(self, probabilities, class_names):
        headers ={"Content-Type":"application/json"}
        data = {"type":"Audio"}
        for i, prob in enumerate(probabilities):
            data[class_names[i]] = str(prob);
        print(data)
        
        x = requests.post(url, json = data, headers = headers)
        print(x)
        
    
    def listen(self):
        print('Listening beginning')
        while True:
            input = self.stream.read(chunk)
            rms_val = self.rms(input)
            if rms_val > Threshold:
                data = self.record()
                _, probabilities, class_names = self.predict(data)
                self.upload(probabilities[0], class_names)


a = Recorder()
a.listen()
