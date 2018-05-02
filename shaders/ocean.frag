
#pragma glslify: snoise = require('glsl-noise/simplex/2d')


varying vec2 vUv;
uniform float time;
varying vec3 light_direction;
varying vec3 n_hat;


void main()
{

	float maxZ = 2.;

	vec4 darkColor = vec4(0., 0., 1., 1.);
	vec4 lightColor = vec4(1., 0., 0., 1.);

	vec3 spec_light = light_direction - 2. * dot(n_hat, light_direction)*n_hat;
	//snoise är stegus-noice function.
	//gl_FragColor = vec4(snoise(time*gl_FragCoord.xy/190.0), 0.9, 1.0, 1.0);

	gl_FragColor = vec4(-1.0*dot(n_hat, light_direction) * vec3(0.0, 0.0, 1.0), 1.);
}