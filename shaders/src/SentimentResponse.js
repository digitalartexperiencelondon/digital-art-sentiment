// SentimentResponse.js

// Class storing the sentiment responses coming from the backend, with the
// wieghts for the measured sentiments. It might hold data coming from different
// types of sensors, which is specified through the "type" parameter. Undefined
// values or null values are casted to 0.
//
// Example of expected data (JSON):
// {
//     "anger": 0.1,
//     "contempt": 0.2,
//     "disgust": null,
//     "fear": 0.0,
//     "happiness": 0.943333,
//     "neutral": 0.3,
//     "sadness": 0.1,
//     "surprise": 0.1,
//     "type": "audio"
// }
class SentimentResponse {
  anger;
  contempt;
  disgust;
  fear;
  happiness;
  neutral;
  sadness;
  surprise;
  type;

  constructor(data) {
    this.anger = data.anger ?? 0.0;
    this.contempt = data.contempt ?? 0.0;
    this.disgust = data.disgust ?? 0.0;
    this.fear = data.fear ?? 0.0;
    this.happiness = data.happiness ?? 0.0;
    this.neutral = data.neutral ?? 0.0;
    this.sadness = data.sadness ?? 0.0;
    this.surprise = data.surprise ?? 0.0;
    this.type = data.type ?? "unknown";
  }

  // setTestFrustration() {
  //   this.anger = 0.3;
  //   this.contempt = 0.0;
  //   this.disgust = 0.8;
  //   this.fear = 0.4;
  //   this.happiness = 0.0;
  //   this.neutral = 0.0;
  //   this.sadness = 0.9;
  //   this.surprise = 0.0;
  // }

  // setTestExcitement() {
  //   this.anger = 0.3;
  //   this.contempt = 0.8;
  //   this.disgust = 0.1;
  //   this.fear = 0.2;
  //   this.happiness = 0.9;
  //   this.neutral = 0.5;
  //   this.sadness = 0.0;
  //   this.surprise = 0.9;
  // }

  // setTestBored() {
  //   this.anger = 0.3;
  //   this.contempt = 0.1;
  //   this.disgust = 0.7;
  //   this.fear = 0.2;
  //   this.happiness = 0.1;
  //   this.neutral = 0.7;
  //   this.sadness = 0.5;
  //   this.surprise = 0.0;
  // }

  // setTestAngry() {
  //   this.anger = 0.9;
  //   this.contempt = 0.1;
  //   this.disgust = 0.7;
  //   this.fear = 0.2;
  //   this.happiness = 0.1;
  //   this.neutral = 0.0;
  //   this.sadness = 0.5;
  //   this.surprise = 0.4;
  // }

  toArray() {
    return Object.entries(this)
      .filter(([key, _value]) => key !== "type")
      .map(([_key, value]) => value);
  }

  fromArray(dataArray) {
    Object.entries(this).forEach(
      ([key, _value], idx) => (this[key] = dataArray[idx])
    );
  }

  print() {
    console.log(`
    RED\t\t\t anger:\t\t ${this.anger}
    PALE PINK\t contempt:\t ${this.contempt}
    MAGENTA\t\t disgust:\t ${this.disgust}
    DARK GREEN\t fear:\t\t ${this.fear}
    YELLOW\t\t happines:\t ${this.happiness}
    WHITE\t\t neutral:\t ${this.neutral}
    DARK BLUE\t sadness:\t ${this.sadness}
    LIGHT BLUE\t surprise:\t ${this.surprise}
    `);
  }
}

// Example sentiment measurements for predefined visualisations.
class PredefinedSentimentResponse {
  static Frustration() {
    const sentimentResponse = new SentimentResponse({});
    sentimentResponse.anger = 0.3;
    sentimentResponse.contempt = 0.0;
    sentimentResponse.disgust = 0.8;
    sentimentResponse.fear = 0.4;
    sentimentResponse.happiness = 0.0;
    sentimentResponse.neutral = 0.0;
    sentimentResponse.sadness = 0.9;
    sentimentResponse.surprise = 0.0;
    return sentimentResponse;
  }

  static Excitement() {
    const sentimentResponse = new SentimentResponse({});
    sentimentResponse.anger = 0.3;
    sentimentResponse.contempt = 0.8;
    sentimentResponse.disgust = 0.1;
    sentimentResponse.fear = 0.2;
    sentimentResponse.happiness = 0.9;
    sentimentResponse.neutral = 0.5;
    sentimentResponse.sadness = 0.0;
    sentimentResponse.surprise = 0.9;
    return sentimentResponse;
  }

  static Bored() {
    const sentimentResponse = new SentimentResponse({});
    sentimentResponse.anger = 0.3;
    sentimentResponse.contempt = 0.1;
    sentimentResponse.disgust = 0.7;
    sentimentResponse.fear = 0.2;
    sentimentResponse.happiness = 0.1;
    sentimentResponse.neutral = 0.7;
    sentimentResponse.sadness = 0.5;
    sentimentResponse.surprise = 0.0;
    return sentimentResponse;
  }

  static Angry() {
    const sentimentResponse = new SentimentResponse({});
    sentimentResponse.anger = 0.9;
    sentimentResponse.contempt = 0.1;
    sentimentResponse.disgust = 0.7;
    sentimentResponse.fear = 0.2;
    sentimentResponse.happiness = 0.1;
    sentimentResponse.neutral = 0.0;
    sentimentResponse.sadness = 0.5;
    sentimentResponse.surprise = 0.4;
    return sentimentResponse;
  }
}
