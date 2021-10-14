// Global variables
const fps = 60;
const fetchFrequencySeconds = 1;

let printSentimentResponse = false;
let sentimentResponse, sentimentResponseValues;
let sentimentsToShader;

let loadedShader;

let localTestData;

// ****************************************************************************
// DATA FETCHING AND PARSING
// ****************************************************************************
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

function fetchSentimentData() {
  console.log("Fetching data...");

  // TODO: get request to the backend api instead of reading local test data.
  // let url = "TBD";
  // httpGet(url, "jsonp", false, function (response) {
  //   sentimentResponse =  //...
  // });

  // TODO: remove next block (it's just reading test input)
  // sentimentResponse = new SentimentResponse(localTestData);
  // const response = sentimentResponse.toSentimentsArray();
  const response = Array.from(Array(8)).map((x) => random(0.0, 1.0));
  sentimentResponse = new SentimentResponse({});
  sentimentResponse.fromArray(response);

  sentimentsToShader = sentimentResponseValues ?? response;
  sentimentResponseValues = response;
}

// ****************************************************************************
// VISUALISATION
// ****************************************************************************
function preload() {
  loadedShader = loadShader("assets/vshader.glsl", "assets/fshader.glsl");
  localTestData = loadJSON("assets/test_data.json");
}

function setup() {
  frameRate(fps);
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  const fetchFrequencyFrames = fps * fetchFrequencySeconds;
  const interpolationFrame = frameCount % fetchFrequencyFrames;

  // Fetch data every first frame of the interpolation
  if (interpolationFrame == 1) {
    fetchSentimentData();
    printSentimentResponse = true;
  }

  // Do nothing until the data is fetched
  if (!sentimentResponse) {
    return;
  }

  if (printSentimentResponse) {
    sentimentResponse.print();
    printSentimentResponse = false;
  }

  // Interpolate the sentiment values from the last value sent to the shaders,
  // to the last fetched value.
  sentimentsToShader = sentimentResponseValues.map((amount, idx) => {
    const lastAmount = sentimentsToShader[idx];
    return map(interpolationFrame, 1, fetchFrequencyFrames, lastAmount, amount);
  });

  // Sort the sentiments by amount and get the ordered indices.
  const mean =
    sentimentsToShader.reduce((amount, acc) => amount + acc) /
    sentimentsToShader.length;

  const topSentimentsIndices = sentimentsToShader
    .map((amount, idx) => [amount, idx])
    .sort()
    .reverse();

  const [_top1Amount, top1Idx] = topSentimentsIndices[0];
  let [top2Amount, top2Idx] = topSentimentsIndices[1];
  top2Idx = top2Amount < mean ? top1Idx : top2Idx;

  shader(loadedShader);
  loadedShader.setUniform("u_resolution", [width, height]);
  loadedShader.setUniform("u_time", 0.01 * frameCount);
  loadedShader.setUniform("u_audio", sentimentsToShader);
  loadedShader.setUniform("u_top1", top1Idx);
  loadedShader.setUniform("u_top2", top2Idx);
  loadedShader.setUniform("u_mean", mean);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
