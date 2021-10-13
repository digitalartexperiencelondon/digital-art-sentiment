let dataJson;
let sentimentResponse;
let loadedShader;

function preload() {
  dataJson = loadJSON("assets/test_data.json");

  loadedShader = loadShader(
    "assets/vertex_shader.glsl",
    "assets/fragment_shader.glsl"
  );
}

function setup() {
  createCanvas(400, 400, WEBGL);
  sentimentResponse = new SentimentResponse(dataJson);
}

function draw() {
  shader(loadedShader);

  loadedShader.setUniform("u_resolution", [width, height]);
  loadedShader.setUniform("u_time", frameCount);
  loadedShader.setUniform("u_audio", Object.values(sentimentResponse.audio));

  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
