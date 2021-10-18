#define PI 3.141592653589793238462643
#define TWO_PI 2.0 * PI
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
#define BGCOLOR parse256RGB(200, 200, 200)

#define NUM_SENTIMENTS 8
#define BUBBLE_FADE_AMOUNT 1.5 // min=0.0 -> max=NUM_SENTIMENTS

precision mediump float;

varying vec4 vPosition;
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio[NUM_SENTIMENTS];

uniform int u_top1;
uniform int u_top2;
uniform float u_mean;

struct Sentiment {
  float amount;
  vec3 color;
  float speed;
};

struct Bubble {
  float radius;
  vec2 position;
  vec3 color;
};

struct SceneObject {
  float sdf;
  vec3 color;
};

Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx);

SceneObject getTop2SentimentsPlasma(vec2 p) {
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

  // Time varying pixel color
  Sentiment topSentiment = getSentiment(u_audio, u_top1);
  vec3 colorTop1;
  vec3 colorTop2;
  if (topSentiment.amount == 0.0) {
    colorTop1 = 0.4 * COLOR_NEUTRAL;
    colorTop2 = 0.7 * COLOR_NEUTRAL;
  } else if (u_top1 != u_top2) {
    colorTop1 = topSentiment.color;
    colorTop2 = getSentiment(u_audio, u_top2).color;
  } else {
    colorTop1 = mix(topSentiment.color, vec3(0.0), 0.2);
    colorTop2 = mix(topSentiment.color, COLOR_NEUTRAL, 0.1);
  }
  vec3 color = mix(colorTop2, colorTop1, p.y + 0.5);

  SceneObject obj;
  obj.sdf = 1.0;
  obj.color = color;
  return obj;
}

vec4 BubbleSDF(Bubble bubble, vec2 p) {
  float d = bubble.radius / length(p - bubble.position);
  return vec4(bubble.color * d, d);
}

SceneObject getSentimentBubbles(float sentimentAmountThreshold, vec2 p) {

  float totalAlpha = 0.0;
  vec3 totalColor = vec3(0.0);

  // For each sentiment, create a bubble.
  for (int idx = 0; idx < NUM_SENTIMENTS; idx++) {

    // Get the sentiment data.
    Sentiment sentiment = getSentiment(u_audio, idx);

    // Initialize the bubble parameters.
    // - position: each bubble is initialized in its corresponding position, so
    // that all the bubbles create a circle.
    // - radius: only sentiments with an amount higher that the given threshold
    // are considered.
    // - color: the color associated to the sentiment.
    Bubble bubble;
    bubble.position = vec2(0.0);
    float theta = TWO_PI * float(idx) / float(NUM_SENTIMENTS);
    bubble.position.x =
        0.5 * cos(theta * sentiment.speed * (sentiment.amount + 0.1) * u_time);
    bubble.position.y =
        0.5 * sin(sentiment.speed * (sentiment.amount + 0.1) * u_time + theta);
    bubble.radius = sentiment.amount <= sentimentAmountThreshold
                        ? 0.0 // Discard smaller bubbles.
                        : 1.5 * (sentiment.amount + 0.1);

    bubble.radius *= bubble.radius; // Empathize the color in the SDF.
    bubble.color = sentiment.color;
    if (getSentiment(u_audio, u_top1).amount == 0.0) {
      bubble.radius = 0.15;
      bubble.color = vec3(sentiment.color.r);
    }

    // Get the SDF (signed distance function) to the bubble and accumulate its
    // color values.
    vec4 bubbleSD = BubbleSDF(bubble, p);
    totalAlpha += bubbleSD.a;
    totalColor += bubbleSD.rgb;
  }

  // Fade the merged bubbles.
  float totalShape = smoothstep(float(NUM_SENTIMENTS) - BUBBLE_FADE_AMOUNT,
                                float(NUM_SENTIMENTS), totalAlpha);

  SceneObject obj;
  obj.sdf = totalShape;
  obj.color = totalColor / totalAlpha;
  return obj;
}

void main() {

  vec2 p = 2.0 * vPosition.xy - 1.0;
  p.x *= u_resolution.x / u_resolution.y;

  vec3 scene;
  SceneObject background = getTop2SentimentsPlasma(p);
  scene = add(scene, background.sdf, background.color);

  SceneObject foreground;
  if (getSentiment(u_audio, u_top1).amount == 0.0) {
    foreground = getSentimentBubbles(-1.0, p);

  } else {
    foreground = getSentimentBubbles(u_mean, p);
  }
  scene = add(scene, foreground.sdf, foreground.color);

  gl_FragColor = vec4(scene, 1.0);
}

Sentiment getSentiment(float data[NUM_SENTIMENTS], int idx) {
  if (idx == 0) {
    Sentiment anger;
    anger.amount = data[0];
    anger.color = COLOR_ANGER;
    anger.speed = 1.0;
    return anger;
  }

  if (idx == 1) {
    Sentiment contempt;
    contempt.amount = data[1];
    contempt.color = COLOR_CONTEMPT;
    contempt.speed = 0.8;
    return contempt;
  }

  if (idx == 2) {
    Sentiment disgust;
    disgust.amount = data[2];
    disgust.color = COLOR_DISGUST;
    disgust.speed = 0.4;
    return disgust;
  }

  if (idx == 3) {
    Sentiment fear;
    fear.amount = data[3];
    fear.color = COLOR_FEAR;
    fear.speed = 0.0;
    return fear;
  }

  if (idx == 4) {
    Sentiment happiness;
    happiness.amount = data[4];
    happiness.color = COLOR_HAPPINESS;
    happiness.speed = 0.5;
    return happiness;
  }

  if (idx == 5) {
    Sentiment neutral;
    neutral.amount = data[5];
    neutral.color = COLOR_NEUTRAL;
    neutral.speed = 0.2;
    return neutral;
  }

  if (idx == 6) {
    Sentiment sadness;
    sadness.amount = data[6];
    sadness.color = COLOR_SADNESS;
    sadness.speed = 0.1;
    return sadness;
  }

  if (idx == 7) {
    Sentiment surprise;
    surprise.amount = data[7];
    surprise.color = COLOR_SURPRISE;
    surprise.speed = 0.9;
    return surprise;
  }
}
