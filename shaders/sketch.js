const fps = 60;
const fetchDataFrequencySeconds = 2;

let dataJson;
let sentimentResponse;
let loadedShader;

let audioSentiment;

function preload() {
  dataJson = loadJSON("assets/test_data.json");

  loadedShader = loadShader(
    "assets/vertex_shader.glsl",
    "assets/fragment_shader.glsl"
  );
}

function setup() {
  frameRate(fps);
  createCanvas(400, 400, WEBGL);
  sentimentResponse = new SentimentResponse(dataJson);
  audioSentiment = Object.values(sentimentResponse.audio);
}

function draw() {
  shader(loadedShader);

  // Simulate fetch data for testing
  if (frameCount % fps == fetchDataFrequencySeconds) {
    audioSentiment = Array.from(Array(8)).map((x) => random(0.0, 1.0));
  }

  loadedShader.setUniform("u_resolution", [width, height]);
  loadedShader.setUniform("u_time", frameCount);
  loadedShader.setUniform("u_audio", audioSentiment);

  rect(0, 0, width, height);
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }
