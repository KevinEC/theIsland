#define PI 3.1415926535897932384626433832795
uniform float time;
#pragma glslify: pnoise = require('glsl-noise/periodic/3d')


varying vec2 vUv;
varying float noise;
uniform vec3 light_pos;
varying vec3 light_direction;
varying vec3 n_hat;
varying vec3 position4interpol;

varying float dist_to_island;

uniform vec3 cam_pos;

void main() {

  vUv = uv;

  float maxD = 30.; // inner circular wave start radius
  vec3 orig = vec3(0.,0.,0.);

  float dist = distance(position, orig);

  // get a 3d noise using the position, low frequency
  float f = 3. * pnoise( 0.2 * position + vec3(0, 0, 2.0 * 0.5* time), vec3( 1000.0 ) ); // far noise pattern
  // get a 3d noise using the position, low frequency
  float g = 3. * pnoise( 0.1 * position + vec3(0, 0, 2.0 * sin(dist + time)), vec3( 1000.0 )) ; // close noise pattern


  float displacement;
  
  
  if (dist <= maxD)
  {
  	 // compose both noises
	 displacement = (dist / maxD)*f + (1.0-dist/maxD)*g; // returns a vector cuz position 
  }
  else 
  {
  	 displacement = f;

  }

  light_direction = (-1.0*light_pos)/length(light_pos);

  //pass distance from point to island to fragment shader
  float skybox_radius = 200.0;
  dist_to_island = dist/skybox_radius;

  
  // move the position along the normal and transform it
  vec3 newPosition = position + normal*displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  position4interpol = newPosition;
  n_hat = normal;
}