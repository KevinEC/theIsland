
varying vec2 vUv;
varying float dist;
varying float circumference;

void main()
{
	vec3 color;
	float color_interval = circumference / 10.;
	float x1 = 1./2. * color_interval;
	float x2 = 2. * color_interval;
	float x3 = 3. * color_interval;
	float x4 = 4. * color_interval;
	if (dist < x1)
	{
		color = vec3(1., 1., 1.);
	}
	else if (dist < x2)
	{
		color = (dist - x1)/(x2 - x1) * vec3(1., 1., 0.) + (1. - (dist - x1)/(x2 - x1)) * vec3(1., 1., 1.);
	}
	else if (dist < x3)
	{
		color = (dist - x2)/(x3 - x2) * vec3(1., 0., 0.) + (1. - (dist - x2)/(x3 - x2)) * vec3(1., 1., 0.);
	}
	else if (dist < x4)
	{
		color = (dist - x3)/(x4 - x3) * vec3(0., 0., 1.) + (1. - (dist - x3)/(x4 - x3)) * vec3(1., 0., 0.);
	}
	else
	{
		color = vec3(0., 0., 1.);
	}


	gl_FragColor = vec4( color, 1.);
}