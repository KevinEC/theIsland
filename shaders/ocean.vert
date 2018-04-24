#define PI 3.1415926535897932384626433832795
uniform float time;
#pragma glslify: pnoise = require('glsl-noise/periodic/3d')


varying vec2 vUv;
varying float noise;



void main() {

  vUv = uv;

  // get a 3d noise using the position, low frequency
  float f = 1.5 * pnoise( 0.2 * position + vec3(0, 0, 2.0 * 1.* time), vec3( 1000.0 ) );
  // get a 3d noise using the position, low frequency
  float g = 1.5 * pnoise( 0.2 * position + vec3(0, 0, 2.0 * 0.5* time), vec3( 1000.0 )) ;
  // compose both noises
  float displacement = f + g;

  // move the position along the normal and transform it



  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}






//void main() {

//  vUv = uv;

  // get a 3d noise using the position, low frequency
//  float f = 1.5 * pnoise( 0.2 * position + vec3(0, 0, 2.0 * 1.* time), vec3( 1000.0 ) );
  // get a 3d noise using the position, low frequency
//  float g = 1.5 * pnoise( 0.2 * position + vec3(0, 0, 2.0 * 0.5* time), vec3( 1000.0 )) ;
  // compose both noises
  //float displacement = f + g;

  // move the position along the normal and transform it

  

//  vec3 newPosition = position + normal * ((position/vec3(30., 1., 30.))*f + (vec3(1., 0, 1.) - position/vec3(30., 1., 30.)*g)) ;
//  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

//}
