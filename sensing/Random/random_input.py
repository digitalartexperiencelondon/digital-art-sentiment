import requests
import random
import time
import os

ip = os.getenv('SENTIMENT_SERVER_IP')

url= 'http://'+ip+':10000/submit'

while True:
	headers ={"Content-Type":"application/json"}
	data = {"type":"Random",
        	"anger":random.random(),
        	"contempt":random.random(),
        	"disgust":random.random(),
        	"fear":random.random(),
        	"happiness":random.random(),
        	"neutral":random.random(),
        	"sadness":random.random(),
	        "surprise":random.random()
	       }
	x = requests.post(url, json = data, headers = headers)
	print(x)
	time.sleep(5)
