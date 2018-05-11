
#pragma glslify: snoise = require('glsl-noise/simplex/2d')
#extension GL_OES_standard_derivatives : enable

varying vec2 vUv;
uniform float time;
varying vec3 light_direction;
varying vec3 n_hat;

varying vec3 position4interpol;
varying float dist_to_island;

uniform vec3 cam_pos;
void main()
{



	vec3 real_cam_pos = position4interpol - cam_pos;
	vec3 a_light_direction = vec3(0.0,0.0,-1.0);

	vec3 real_normal = normalize(cross(dFdx(position4interpol), dFdy(position4interpol)));
	float maxZ = 2.;

	vec3 spec_light = light_direction - 2. * dot(real_normal, light_direction)*real_normal;
	vec3 a_spec_light = a_light_direction - 2. * dot(real_normal, a_light_direction)*real_normal;

	//snoise är stegus-noice function.
	//gl_FragColor = vec4(snoise(time*gl_FragCoord.xy/190.0), 0.9, 1.0, 1.0);

	float k_spec_raw = max(0., dot(normalize(spec_light), normalize(real_cam_pos)));
	float k_spec = k_spec_raw*k_spec_raw*k_spec_raw;

	//specular from ambient light FUNKAR INTE
	float a_k_spec_raw = max(0., dot(normalize(a_spec_light), normalize(real_cam_pos)));
	float a_k_spec = a_k_spec_raw*a_k_spec_raw*a_k_spec_raw;

	float k_diff = -1.*dot(real_normal, light_direction);

	vec3 ambientColor =  vec3(0., 0.1, 0.2);
	vec3 diffuseColor =  k_diff * vec3(0., 0.2, 0.4);
	vec3 specularColor = k_spec * vec3(1., 1., 1.0);
	vec3 a_specularColor =  a_k_spec * vec3(.8, 0.8, 0.8);

	//calc transparancy by distance from island
	float transp = 0.35 ;

	gl_FragColor = vec4(ambientColor +  diffuseColor + specularColor + a_specularColor, transp);

    //gl_FragColor = vec4(spec_light, 1.);
}