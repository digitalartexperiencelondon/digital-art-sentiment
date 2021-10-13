// Expected JSON structure example for the SentimentResponse:
// {
//     "time": 3564704567,
//     "duration": 0.5,
//     "audio": {
//         "anger": 0.1,
//         "contempt": 0.2,
//         "disgust": null,
//         "fear": 0.0,
//         "happiness": 0.943333,
//         "neutral": 0.3,
//         "sadness": 0.1,
//         "surprise": 0.1
//     },
//     "video": {
//         "anger": null,
//         "contempt": null,
//         "disgust": null,
//         "fear": null,
//         "happiness": 0.92,
//         "neutral": 0.3,
//         "sadness": 0.1,
//         "surprise": null
//     }
// }

class SentimentResponse {
  time;
  duration;
  audio;
  video;

  constructor(data) {
    this.time = data.time;
    this.duration = data.duration;
    this.audio = new SensorSentimentResult(data.audio);
    this.vide = new SensorSentimentResult(data.video);
  }
}

class SensorSentimentResult {
  anger;
  contempt;
  disgust;
  fear;
  happiness;
  neutral;
  sadness;
  surprise;

  constructor(data) {
    this.anger = data.anger ?? 0.0;
    this.contempt = data.contempt ?? 0.0;
    this.disgust = data.disgust ?? 0.0;
    this.fear = data.fear ?? 0.0;
    this.happiness = data.happiness ?? 0.0;
    this.neutral = data.neutral ?? 0.0;
    this.sadness = data.sadness ?? 0.0;
    this.surprise = data.surprise ?? 0.0;
  }
}
