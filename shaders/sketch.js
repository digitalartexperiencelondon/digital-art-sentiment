const fps = 60;
const fetchDataFrequencySeconds = 0.5;

let loadedShader;
let dataJson;
let sentimentResponse;

let previousRecord = [];
let currentRecord;
let recordToShader;

function preload() {
  dataJson = loadJSON("assets/test_data.json");

  loadedShader = loadShader(
    "assets/vertex_shader.glsl",
    "assets/fragment_shader.glsl"
  );
}

function setup() {
  frameRate(fps);
  createCanvas(windowHeight, windowHeight, WEBGL);
  sentimentResponse = new SentimentResponse(dataJson);
  currentRecord = Object.values(sentimentResponse.audio);
  recordToShader = currentRecord;
}

function draw() {
  shader(loadedShader);

  // Simulate fetch data for testing
  if (frameCount % (fps * fetchDataFrequencySeconds) == 1) {
    previousRecord = currentRecord;
    currentRecord = Array.from(Array(8)).map((x) => random(0.0, 1.0));
  }
  // Iterpolate values between updates
  else if (previousRecord.lenght != 0) {
    recordToShader = currentRecord.map((amount, idx) => {
      return map(
        frameCount % (fps * fetchDataFrequencySeconds),
        1,
        fps * fetchDataFrequencySeconds,
        previousRecord[idx],
        amount
      );
    });
    previousRecord = recordToShader.map((x) => x);
  }

  loadedShader.setUniform("u_time", frameCount);
  loadedShader.setUniform("u_audio", recordToShader);

  rect(0, 0, width, height);
}

function windowResized() {
  // resizeCanvas(windowWidth, windowHeight);
  resizeCanvas(windowHeight, windowHeight);
}
