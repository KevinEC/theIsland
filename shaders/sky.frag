
varying vec2 vUv;
varying float dist;
varying float circumference;
varying vec3 posInterpolL;

void main()
{
	vec3 color;
	float color_interval = circumference / 20.;
	float x1 = 1./2. * color_interval;
	float x2 = 1.5 * color_interval;
	float x3 = 10. * color_interval;
	float x4 = 20. * color_interval;
	float x5 = 40. *color_interval;
	if (dist < x1)
	{
		//White
		color = vec3(1., 1., 1.);
	}
	else if (dist < x2)
	{
		//White to yellow
		color = (dist - x1)/(x2 - x1) * vec3(1., 1., 0.) + (1. - (dist - x1)/(x2 - x1)) * vec3(1., 1., 1.);
	}
	else if (dist < x3 )
	{
		//Yellow to orange
		color = (dist - x2)/(x3 - x2) * vec3(0.7, 0.3, 0.) + (1. - (dist - x2)/(x3 - x2)) * vec3(1., 1., 0.);
	}
	else if (dist < x4)
	{
		//Orange to blue
		color = (dist - x3)/(x4 - x3) * vec3(0., 0.15, 0.25) + (1. - (dist - x3)/(x4 - x3)) * vec3(0.7, 0.3, 0.);
	}
	else if (dist < x5)
	{
		//Blue to black
		color = (dist - x4)/(x5 - x4) * vec3(0., 0.1, 0.2) + (1. - (dist - x4)/(x5 - x4)) * vec3(0., 0.15, 0.25);
	}
	else
	{
		//Basic black
		color = vec3(0., 0.1, 0.2);
	}

	float horizon_k = (1. - max(0., min(1., posInterpolL.y/(circumference/10.))))* (1. - max(0., min(1., dist/ (circumference/0.9))) );

	if (dist < x3)
	{
		horizon_k = 0.;
	}

	//gl_FragColor = vec4(horizon_k, horizon_k, horizon_k, 1);
	gl_FragColor = vec4( color * (1. - horizon_k) + vec3(0.7, 0.3, 0.)* horizon_k , 1.);
}