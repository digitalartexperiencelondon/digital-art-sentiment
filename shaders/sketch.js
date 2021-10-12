let simpleShader;

function preload() {
  simpleShader = loadShader(
    "assets/vertex_shader.glsl",
    "assets/fragment_shader.glsl"
  );
}

function setup() {
  createCanvas(400, 400, WEBGL);
}

function draw() {
  shader(simpleShader);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
