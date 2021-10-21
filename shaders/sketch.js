// sketch.js

// Global variables.
const fps = 60;
const requestDataFrequencySeconds = 2;

let loadedShader;
let receiveData = true;
let printSentimentResponse = false;
let sentimentResponse, sentimentResponseValues;
let sentimentsToShader;

// *****************************************************************************
// p5js canvas functions.
// *****************************************************************************
function preload() {
  loadedShader = loadShader("assets/vshader.glsl", "assets/fshader.glsl");
}

function setup() {
  frameRate(fps);
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  const firstInterpolationFrame = 1;
  const lastInterpolationFrame = fps * requestDataFrequencySeconds;
  const interpolationFrame = frameCount % lastInterpolationFrame;

  // Request data every first frame of the interpolation.
  if (interpolationFrame == firstInterpolationFrame) {
    requestSentimentResponse();
    printSentimentResponse = true;
  }

  // Do nothing until the data is fetched.
  if (!sentimentResponse) {
    return;
  }

  // Print the sentiment data only once, once it is fetched.
  if (printSentimentResponse) {
    sentimentResponse.print();
    printSentimentResponse = false;
  }

  // Interpolate the sentiment values from the last value sent to the shaders,
  // to the last fetched value.
  sentimentsToShader = sentimentResponseValues.map((sentimentAmount, idx) => {
    const previousSentimentAmount = sentimentsToShader[idx];
    let nextSentimentAmount = map(
      interpolationFrame,
      firstInterpolationFrame,
      lastInterpolationFrame,
      previousSentimentAmount,
      sentimentAmount
    );
    // Cast the next amount to 0.0 if it is too small.
    return nextSentimentAmount < 0.01 ? 0.0 : nextSentimentAmount;
  });

  // Sort the sentiments by amount and get the ordered indices.
  const orderedSentimentsIndices = sentimentsToShader
    .map((amount, idx) => [amount, idx])
    .sort()
    .reverse();

  // TODO(sonia) here: refactor the shader and see what top data do we need to
  // pass and what can we remove/clean up
  const [_top1Amount, top1Idx] = orderedSentimentsIndices[0];
  let [top2Amount, top2Idx] = orderedSentimentsIndices[1];

  const sentimentsMean = mean(sentimentsToShader);
  top2Idx = top2Amount < sentimentsMean ? top1Idx : top2Idx;

  shader(loadedShader);
  loadedShader.setUniform("u_resolution", [width, height]);
  loadedShader.setUniform("u_time", 0.01 * frameCount);
  loadedShader.setUniform("u_audio", sentimentsToShader);
  loadedShader.setUniform("u_top1", top1Idx);
  loadedShader.setUniform("u_top2", top2Idx);
  loadedShader.setUniform("u_mean", sentimentsMean);
  rect(0, 0, width, height);
}

function keyPressed() {
  if (key == "s") {
    receiveData = !receiveData;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// *****************************************************************************
// Helper functions
// *****************************************************************************
function requestSentimentResponse() {
  console.log("Requesting sentiment response...");

  sentimentResponse = receiveData
    ? requestLocalRandomSentiment()
    : requestLocalEmptySentiment();
  const sentimentResponseAsArray = sentimentResponse.toArray();

  sentimentsToShader = sentimentResponseValues ?? sentimentResponseAsArray;
  sentimentResponseValues = sentimentResponseAsArray;
}

function mean(array) {
  return array.reduce((amount, acc) => amount + acc) / array.length;
}
