#define PI 3.1415926535897932384626433832795
uniform float time;
#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

void main()
{
    //vec3 newPos = snoise3(position);
	vec3 newPos = position + vec3(0,0,sin(time));
	gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}