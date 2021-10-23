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

  // Compute the sentiment data that needs to be sent to the shader.
  // - The sentiment intensity array to be sent to the shaders, contains the
  // interpolated intensities from the last value sent to the shaders, to the
  // last fetched value.
  sentimentsToShader = sentimentResponseValues.map((intensity, idx) => {
    const previousIntensity = sentimentsToShader[idx];
    const nextIntensity = map(
      interpolationFrame,
      firstInterpolationFrame,
      lastInterpolationFrame,
      previousIntensity,
      intensity
    );
    // Cast the next intensity to 0.0 if it is too small.
    return nextIntensity < 0.01 ? 0.0 : nextIntensity;
  });

  // - Get the top 2 sentiments, where the top 2 is considered a top sentiment
  // if its value is higher that a threshold (in this case, the mean of the
  // intensities of all the sentiments).
  const sentimentsMean = mean(sentimentsToShader);
  const [top1Idx, top2Idx] = getTop2Sentiments(sentimentsMean);

  // Connect to the shaders and send the data as uniforms.
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

function getTop2Sentiments(threshold) {
  // Sort the sentiments by intensity and get the ordered indices, in order to
  // get the 2 top sentiments. Return the indices of the 1st and 2nd sentiments,
  // if the 2nd sentiment is enough intense. Otherwise, return the 1st twice.
  const orderedSentimentsIndices = sentimentsToShader
    .map((intensity, idx) => [intensity, idx])
    .sort()
    .reverse();

  const [_top1Intensity, top1Idx] = orderedSentimentsIndices[0];
  let [top2Intensity, top2Idx] = orderedSentimentsIndices[1];
  top2Idx = top2Intensity < threshold ? top1Idx : top2Idx;

  return [top1Idx, top2Idx];
}
