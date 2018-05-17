#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform vec3 light_pos;
varying float dist;
varying float circumference;
varying vec3 posInterpolL;

void main() 
{
  vUv = uv;
  float radius = 800.;
  dist = distance(position, light_pos);
  
  circumference = radius * 2.;

  posInterpolL = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}