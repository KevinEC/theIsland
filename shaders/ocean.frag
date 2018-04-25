
#pragma glslify: snoise = require('glsl-noise/simplex/2d')


varying vec2 vUv;
uniform float time;



void main()
{
	float maxZ = 2.;

	vec4 darkColor = vec4(0., 0., 1., 1.);
	vec4 lightColor = vec4(1., 0., 0., 1.);
	//snoise är stegus-noice function.
	//gl_FragColor = vec4(snoise(time*gl_FragCoord.xy/190.0), 0.9, 1.0, 1.0);

	if ( gl_FragCoord.z > maxZ/2.1)
	{
		gl_FragColor = darkColor;
	}
	else 
	{
		gl_FragColor = lightColor;
	}
	//gl_FragColor = vec4(0.3, 0.4, 1.0, 1.0);
}