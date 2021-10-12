attribute vec3 aPosition;
varying vec4 vPosition;

void main() {
  vec4 position = vec4(aPosition, 1.0);
  vPosition = position;

  position.xy = position.xy * 2.0 - 1.0;
  gl_Position = position;
}