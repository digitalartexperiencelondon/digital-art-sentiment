precision mediump float;

// Handy constants:
#define PI 3.141592653589793238462643
#define TWO_PI 2.0 * PI
#define parse256RGB(r, g, b) vec3(r, g, b) / 255.0

// Functions to add and remove objects from the scene:
#define erase(scene, mask) scene *(1. - mask)
#define add(scene, object, color) erase(scene, object) + object *color

// Sentiment constants:
#define NUM_SENTIMENTS 8
#define BUBBLE_FADE_AMOUNT 1.5 // value in range [0.0, NUM_SENTIMENTS]
#define COLOR_ANGER parse256RGB(255, 0, 0)        // RED
#define COLOR_CONTEMPT parse256RGB(255, 132, 136) // PALE RED/PINK
#define COLOR_DISGUST parse256RGB(255, 62, 255)   // MAGENTA
#define COLOR_FEAR parse256RGB(0, 153, 0)         // DARK GREEN
#define COLOR_HAPPINESS parse256RGB(255, 255, 2)  // YELLOW
#define COLOR_NEUTRAL parse256RGB(255, 255, 255)  // GREYSCALE/WHITE
#define COLOR_SADNESS parse256RGB(82, 80, 255)    // DARK BLUE
#define COLOR_SURPRISE parse256RGB(0, 192, 255)   // LIGHT BLUE
#define BGCOLOR parse256RGB(200, 200, 200)

// Input parameters:
varying vec4 vPosition;
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio[NUM_SENTIMENTS];

uniform int u_top1;
uniform int u_top2;
uniform float u_mean;

// Structures:
// - Sentiment: stores the properties of the sentiment representation.
// - TopColors: stores the colors of the top sentiments.
// - Bubble: stores the properties of a circle used to define a bubble.
// - Object: used to add an object to the scene.
struct Sentiment {
  int idx;
  float intensity;
  vec3 color;
  float speed;
};

struct TopColors {
  vec3 top1;
  vec3 top2;
};

struct Bubble {
  vec2 position;
  float radius;
  vec3 color;
};

struct Object {
  float sdf;
  vec3 color;
};

// Function headers:
// - Used to parse the input sentiment data.
Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx);
bool isReposeMode(float data[NUM_SENTIMENTS]);

// - Used to render the background.
vec2 getPlasma(vec2 p);
TopColors getTopColors(float data[NUM_SENTIMENTS]);
Object getTopColorsScreenPlasma(float data[NUM_SENTIMENTS], vec2 p);

// - Used to render the foreground.
vec2 getBubblePosition(Sentiment sentiment);
Bubble getActiveBubble(Sentiment sentiment, float threshold);
Bubble getReposeBubble(Sentiment sentiment);
vec4 BubbleSDF(Bubble bubble, vec2 p);
Object getMergedSentimentBubbles(float data[NUM_SENTIMENTS], float threshold,
                                 vec2 p);

// Main function that renders the scene.
void main() {
  vec2 p = 2.0 * vPosition.xy - 1.0;
  p.x *= u_resolution.x / u_resolution.y;

  Object background = getTopColorsScreenPlasma(u_audio, p);
  Object foreground = getMergedSentimentBubbles(u_audio, u_mean, p);

  vec3 scene;
  scene = add(scene, background.sdf, background.color);
  scene = add(scene, foreground.sdf, foreground.color);

  gl_FragColor = vec4(scene, 1.0);
}

Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx) {
  if (idx == 0) {
    Sentiment anger;
    anger.idx = 0;
    anger.intensity = data[0];
    anger.color = COLOR_ANGER;
    anger.speed = 1.0;
    return anger;
  }

  if (idx == 1) {
    Sentiment contempt;
    contempt.idx = 1;
    contempt.intensity = data[1];
    contempt.color = COLOR_CONTEMPT;
    contempt.speed = 0.8;
    return contempt;
  }

  if (idx == 2) {
    Sentiment disgust;
    disgust.idx = 2;
    disgust.intensity = data[2];
    disgust.color = COLOR_DISGUST;
    disgust.speed = 0.4;
    return disgust;
  }

  if (idx == 3) {
    Sentiment fear;
    fear.idx = 3;
    fear.intensity = data[3];
    fear.color = COLOR_FEAR;
    fear.speed = 0.0;
    return fear;
  }

  if (idx == 4) {
    Sentiment happiness;
    happiness.idx = 4;
    happiness.intensity = data[4];
    happiness.color = COLOR_HAPPINESS;
    happiness.speed = 0.5;
    return happiness;
  }

  if (idx == 5) {
    Sentiment neutral;
    neutral.idx = 5;
    neutral.intensity = data[5];
    neutral.color = COLOR_NEUTRAL;
    neutral.speed = 0.2;
    return neutral;
  }

  if (idx == 6) {
    Sentiment sadness;
    sadness.idx = 6;
    sadness.intensity = data[6];
    sadness.color = COLOR_SADNESS;
    sadness.speed = 0.1;
    return sadness;
  }

  if (idx == 7) {
    Sentiment surprise;
    surprise.idx = 7;
    surprise.intensity = data[7];
    surprise.color = COLOR_SURPRISE;
    surprise.speed = 0.9;
    return surprise;
  }
}

bool isReposeMode(float data[NUM_SENTIMENTS]) {
  float topIntensity = getSentiment(data, u_top1).intensity;
  return topIntensity == 0.0;
}

vec2 getPlasma(vec2 p) {
  const int iterations = 2;
  float speed = 0.5;
  float t = speed * u_time;
  float waveFrequency = 1.0;
  float waveHeight = 1.0;
  float disphaseFactor = 0.0;
  float edgeDistortion = 0.2;

  if (u_top1 == u_top2) {
    waveFrequency = 2.0;
  }

  for (int i = 0; i < iterations; i++) {
    vec2 pDisplacement;
    pDisplacement.x = cos(p.y * waveFrequency + t - disphaseFactor);
    pDisplacement.y = sin(p.x * waveFrequency + t - disphaseFactor);
    pDisplacement *= waveHeight;
    pDisplacement += edgeDistortion * vec2(-pDisplacement.y, pDisplacement.x);
    p += pDisplacement;

    waveFrequency *= 1.5;
    speed *= 1.5;
    waveHeight *= 1.5;
    disphaseFactor += 0.5 * t;
  }
  return p;
}

TopColors getTopColors(float data[NUM_SENTIMENTS]) {
  TopColors colors;
  if (isReposeMode(data)) {
    colors.top1 = 0.4 * COLOR_NEUTRAL;
    colors.top2 = 0.7 * COLOR_NEUTRAL;
    return colors;
  }

  Sentiment top1 = getSentiment(data, u_top1);
  if (u_top1 == u_top2) {
    colors.top1 = mix(top1.color, vec3(0.0), 0.2);
    colors.top2 = mix(top1.color, COLOR_NEUTRAL, 0.1);
    return colors;
  }

  Sentiment top2 = getSentiment(data, u_top2);
  colors.top1 = top1.color;
  colors.top2 = top2.color;
  return colors;
}

Object getTopColorsScreenPlasma(float data[NUM_SENTIMENTS], vec2 p) {
  TopColors colors = getTopColors(data);
  vec2 plasma = getPlasma(p);

  Object screen;
  screen.sdf = 1.0; // Should occupy the whole screen.
  screen.color = mix(colors.top2, colors.top1, plasma.y + 0.5);
  return screen;
}

vec2 getBubblePosition(Sentiment sentiment) {
  // The bubble stays on a fraction of a deformed circle centered in (0, 0)
  // with radius 0.5. The position in the circle depends on the sentiment
  // index, and the deformation of the circle depends on the sentiment
  // intensity and speed.
  float r = 0.5;
  float theta = TWO_PI * float(sentiment.idx) / float(NUM_SENTIMENTS);
  float t = sentiment.speed * (sentiment.intensity + 0.1) * u_time;
  float x = r * cos(theta * t);
  float y = r * sin(theta + t);
  return vec2(x, y);
}

Bubble getActiveBubble(Sentiment sentiment, float threshold) {
  // The sentiment is rendered as active only if its intensity is higher (or
  // equal) than the given threshold.
  if (sentiment.intensity < threshold) {
    Bubble noBubble;
    noBubble.position = vec2(0.0);
    noBubble.radius = 0.0;
    noBubble.color = vec3(0.0);
    return noBubble;
  }

  // Initialize the active sentiment bubble.
  // - Position: the bubble position.
  // - Radius: proportional to the sentiment intensity.
  // - Color: the same as the sentiment color.
  Bubble bubble;
  bubble.position = getBubblePosition(sentiment);
  bubble.radius = pow(1.5 * (sentiment.intensity + 0.1), 2.0);
  bubble.color = sentiment.color;
  return bubble;
}

Bubble getReposeBubble(Sentiment sentiment) {
  // Initialize the repose sentiment bubble.
  // - Position: the bubble position.
  // - Radius: small and constant for all repose bubbles.
  // - Color: gray based on the red channel of the sentiment color.
  Bubble bubble;
  bubble.position = getBubblePosition(sentiment);
  bubble.radius = 0.15;
  bubble.color = vec3(sentiment.color.r);
  return bubble;
}

vec4 BubbleSDF(Bubble bubble, vec2 p) {
  float d = bubble.radius / length(p - bubble.position);
  return vec4(bubble.color * d, d);
}

Object getMergedSentimentBubbles(float data[NUM_SENTIMENTS], float threshold,
                                 vec2 p) {
  // For each sentiment, create a bubble, compute their SDF, and accumulate
  // their color values.
  float totalAlpha = 0.0;
  vec3 totalColor = vec3(0.0);
  for (int idx = 0; idx < NUM_SENTIMENTS; idx++) {
    Sentiment sentiment = getSentiment(data, idx);

    Bubble bubble;
    if (isReposeMode(data))
      bubble = getReposeBubble(sentiment);
    else
      bubble = getActiveBubble(sentiment, threshold);

    vec4 bubbleSD = BubbleSDF(bubble, p);
    totalAlpha += bubbleSD.a;
    totalColor += bubbleSD.rgb;
  }

  // Fade the merged bubbles.
  float totalShape = smoothstep(float(NUM_SENTIMENTS) - BUBBLE_FADE_AMOUNT,
                                float(NUM_SENTIMENTS), totalAlpha);
  Object obj;
  obj.sdf = totalShape;
  obj.color = totalColor / totalAlpha;
  return obj;
}