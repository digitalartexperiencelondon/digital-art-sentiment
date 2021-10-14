const fps = 60;
const fetchFrequencySeconds = 1;

let loadedShader;

let sentimentResponse;
let shaderSentiments;

// let dataJson;

function fetchSentimentData() {
  console.log("Fetching data...");

  // let url = "TBD";
  // httpGet(url, "jsonp", false, function (response) {
  //   sentimentResponse =  new SentimentResponse(response);
  // });

  // Local testing:
  const response = Array.from(Array(8)).map((x) => random(0.0, 1.0));
  shaderSentiments = sentimentResponse ?? response;
  sentimentResponse = response;
}

function preload() {
  loadedShader = loadShader(
    "assets/vertex_shader.glsl",
    "assets/fragment_shader.glsl"
  );

  // dataJson = loadJSON("assets/test_data.json");
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
  }

  // Do nothing until the data is fetched
  if (!sentimentResponse) {
    return;
  }

  // Interpolate the sentiment values from the last value sent to the shaders,
  // to the last fetched value.
  shaderSentiments = sentimentResponse.map((amount, idx) => {
    const lastAmount = shaderSentiments[idx];
    return map(interpolationFrame, 1, fetchFrequencyFrames, lastAmount, amount);
  });

  shader(loadedShader);
  loadedShader.setUniform("u_resolution", [width, height]);
  loadedShader.setUniform("u_time", frameCount);
  loadedShader.setUniform("u_audio", shaderSentiments);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
