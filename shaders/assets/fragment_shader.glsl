#define BLUR 0.01
#define erase(scene, mask) scene *(1. - mask)
#define add(scene, object, color) erase(scene, object) + object *color
#define parse256RGB(r, g, b)                                                   \
  vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)
#define COLOR_ANGER parse256RGB(255, 0, 0)        // RED
#define COLOR_CONTEMPT parse256RGB(255, 132, 136) // PALE RED/PINK
#define COLOR_DISGUST parse256RGB(255, 62, 255)   // MAGENTA
#define COLOR_FEAR parse256RGB(0, 153, 0)         // DARK GREEN
#define COLOR_HAPPINESS parse256RGB(255, 255, 2)  // YELLOW
#define COLOR_NEUTRAL parse256RGB(255, 255, 255)  // GREYSCALE/WHITE
#define COLOR_SADNESS parse256RGB(82, 80, 255)    // DARK BLUE
#define COLOR_SURPRISE parse256RGB(0, 192, 255)   // LIGHT BLUE
#define NUM_SENTIMENTS 8

precision mediump float;

varying vec4 vPosition;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio[NUM_SENTIMENTS];

struct Sentiment {
  float amount;
  vec3 color;
};

Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx);

float sdCircle(vec2 p, vec2 center, float radius) {
  return smoothstep(radius + BLUR, radius, length(p - center));
}

void main() {

  vec2 p = vPosition.xy;
  float time = 0.01 * u_time;

  vec3 scene = vec3(0.1);
  for (int idx = 0; idx < NUM_SENTIMENTS; idx++) {
    Sentiment sentiment = getSentiment(u_audio, idx);

    vec2 center = vec2((float(idx) + 0.5) / float(NUM_SENTIMENTS), 0.5);

    float radius = 0.05 * smoothstep(-1.0, 1.0, sin(sentiment.amount));
    float circle = sdCircle(p, center, radius);
    scene = add(scene, circle, sentiment.color);
  }

  gl_FragColor = vec4(scene, 1.0);
}

Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx) {
  if (idx == 0) {
    Sentiment anger;
    anger.amount = data[0];
    anger.color = COLOR_ANGER;
    return anger;
  }

  if (idx == 1) {
    Sentiment contempt;
    contempt.amount = data[1];
    contempt.color = COLOR_CONTEMPT;
    return contempt;
  }

  if (idx == 2) {
    Sentiment disgust;
    disgust.amount = data[2];
    disgust.color = COLOR_DISGUST;
    return disgust;
  }

  if (idx == 3) {
    Sentiment fear;
    fear.amount = data[3];
    fear.color = COLOR_FEAR;
    return fear;
  }

  if (idx == 4) {
    Sentiment happiness;
    happiness.amount = data[4];
    happiness.color = COLOR_HAPPINESS;
    return happiness;
  }

  if (idx == 5) {
    Sentiment neutral;
    neutral.amount = data[5];
    neutral.color = COLOR_NEUTRAL;
    return neutral;
  }

  if (idx == 6) {
    Sentiment sadness;
    sadness.amount = data[6];
    sadness.color = COLOR_SADNESS;
    return sadness;
  }

  if (idx == 7) {
    Sentiment surprise;
    surprise.amount = data[7];
    surprise.color = COLOR_SURPRISE;
    return surprise;
  }
}