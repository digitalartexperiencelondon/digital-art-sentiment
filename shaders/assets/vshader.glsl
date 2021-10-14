attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec4 vPosition;
varying vec2 vTexCoord;

void main() {
  vec4 position = vec4(aPosition, 1.0);
  vPosition = position;
  vTexCoord = aTexCoord;

  position.xy = position.xy * 2.0 - 1.0;
  gl_Position = position;
}
