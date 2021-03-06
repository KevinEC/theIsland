var THREE = require("three");
var glslify = require("glslify");
var OBJLoader = require('three-obj-loader')(THREE);
var MTLLoader = require('three-mtl-loader');
var OrbitControls = require('three-orbit-controls')(THREE);


/* THREE js code goes here */
let container;

let camera, scene, renderer;
let pointLight, lightHelper, shadowCameraHelper;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

//Nodes and mesh nodes
let sceneRoot = new THREE.Group();
let oceanTrans = new THREE.Group();
let oceanSpin = new THREE.Group();
let islandTrans = new THREE.Group();
let islandScale = new THREE.Group();
let islandSphereTrans = new THREE.Group();
let islandSphereScale = new THREE.Group();
let palmTrans = new THREE.Group();
let palmScale = new THREE.Group();
let floorSpin = new THREE.Group();
let floorTrans = new THREE.Group();
let floorMesh;
let oceanMesh;
let islandMesh;
let islandSphereMesh;
let skyBoxMesh;

let clock = new THREE.Clock();

//console.log(glslify("./node_modules/webgl-noise/src/noise3D.glsl"));


function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

//function onDocumentMouseMove( event ) {

//	if(event.ctrlKey)
//	{ 
    // mouseX, mouseY are in the range [-1, 1]
//	mouseX = ( event.clientX - windowHalfX ) / windowHalfX;
//	mouseY = ( event.clientY - windowHalfY ) / windowHalfY;
//	}
//}

var onError = function ( error ) {
	console.log( 'An error happened' );
}


function init() {
	
	container = document.getElementById( 'container' );
	
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 3000 );
	let controls = new OrbitControls(camera);
	camera.position.y = 5;
	camera.position.x = 90;
	controls.update();
	
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x340000 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	//Top level node
	scene.add( sceneRoot );
	
	lightInit();
	oceanInit();
	islandInit();
	palmInit();
	skyBoxInit();
		
	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}

function skyBoxInit(){

	let geometrySkyBox = new THREE.SphereBufferGeometry(800, 300, 300);

	geometrySkyBox.addAttribute('light_pos', pointLight.position);
	geometrySkyBox.attributes.normal.needsUpdate = true;

	let materialSkyBox =  new THREE.ShaderMaterial({
		vertexShader: glslify("./shaders/sky.vert"),
		fragmentShader: glslify("./shaders/sky.frag"),
		uniforms: {
			light_pos: {value: pointLight.position}
		},
		wireframe: false,
		side: THREE.BackSide
	});

	skyBoxMesh = new THREE.Mesh(geometrySkyBox, materialSkyBox);

	sceneRoot.add(skyBoxMesh);
}

function lightInit(){

	//TESTA DIRECTIONAL LIGHT

	var ambient = new THREE.AmbientLight( 0xffffff  , 0.3 );
	sceneRoot.add( ambient );

	pointLight = new THREE.PointLight( 0xff0000, 15., 850, 1.);

	r_pointLight = new THREE.PointLight( 0xff0000, 2., 400 );
	g_pointLight = new THREE.PointLight( 0x00ff00, 1., 200 );

	pointLight.position.set( 0, 220, 800 );
	r_pointLight.position.set(0, 220, 650 );
	g_pointLight.position.set(0, 220, 650 );
	//spotLight.angle = 3.14 / 3;

	//directionalLight.distance = 0;

	sceneRoot.add( pointLight );
	//sceneRoot.add( r_pointLight );
	//sceneRoot.add( g_pointLight );

	lightHelper = new THREE.PointLightHelper( pointLight );
	sceneRoot.add( lightHelper );


}

function oceanInit(){
	//Geometries and meshes
	let geometryOcean = new THREE.PlaneBufferGeometry(1600, 1600, 1600, 1600);
	let geometryFloor1 = new THREE.PlaneBufferGeometry(1600, 1600, 1600, 1600);


	geometryOcean.addAttribute('light_pos', pointLight.position);
	geometryOcean.attributes.normal.needsUpdate = true;

	let materialOcean = new THREE.ShaderMaterial({
		vertexShader: glslify("./shaders/ocean.vert"),
		fragmentShader: glslify("./shaders/ocean.frag"),
		uniforms: {
			time: {type: "f", value: 1.0},
			light_pos: {value: pointLight.position},
			cam_pos: {value: camera.position}
		},
		wireframe: false,
		transparent: true
	});

	let materialFloor1 = new THREE.MeshPhongMaterial({color: 0x0080ff, transparent: true, opacity: 0.8});

	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean);
	floorMesh = new THREE.Mesh(geometryFloor1, materialFloor1);
	materialFloor1.needsUpdate = true;

	//Create ocean branches
	sceneRoot.add( oceanTrans );
	oceanTrans.add( oceanSpin );
	oceanSpin.add( oceanMesh );

	//Create floor branches
	sceneRoot.add( floorTrans );
	floorTrans.add( floorSpin );
	floorSpin.add (floorMesh );	
}

function islandInit(){
	
	let materialIsland = new THREE.MeshLambertMaterial( {color: 0x80ff80, wireframe: false,overdraw: 0.5 } );
	let materialSphereIsland = new THREE.MeshLambertMaterial( {color: 0x80ff80, wireframe: false, transparent: true, opacity: 0.95});
	materialSphereIsland.lights = true;
	//materialSphereIsland.depthTest = false;
	materialIsland.lights = true;
	sceneRoot.add(islandTrans);
	sceneRoot.add(islandSphereTrans);

	let geometrySphereIsland = new THREE.SphereGeometry(80, 60, 60);
	islandSphereMesh = new THREE.Mesh(geometrySphereIsland, materialSphereIsland);


	let mtlLoader = new MTLLoader()
	mtlLoader.setPath( 'objects/' )
	mtlLoader.load( 'newisland.mtl', 
		function ( materials ) {

			materials.preload();
			
			let objLoader = new THREE.OBJLoader();

			console.log(materials);

			objLoader.setMaterials( materials );
			objLoader.setPath( 'objects/' );
			objLoader.load( 'newisland.obj', 
				function ( object ) {

					islandTrans.add( islandScale );
					islandScale.add( object );

				}, function ( xhr ) {
						console.log( ( 'island1-obj:' + xhr.loaded / xhr.total * 100 ) + '% loaded' );
					}, onError );
	} );



	//Island without texture
	/*let loader = new THREE.OBJLoader( );
	loader.load( 'objects/newisland.obj' , 
		
		function (geometryIsland) {
		geometryIsland.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = materialIsland;
			}
		} );
		islandTrans.add( islandScale );
		islandScale.add( geometryIsland );
		},  function ( xhr ) {
				console.log( ( 'Island:' + xhr.loaded / xhr.total * 100 ) + '% loaded' );
			}, onError
	);*/

	//islandSphereTrans.add(islandSphereScale);
	//islandSphereScale.add(islandSphereMesh);	
}

 function palmInit(){
	sceneRoot.add(palmTrans);

	let alphaMapPic = new THREE.TextureLoader().load('objects/bw - opacity map.jpg');

	let mtlLoader = new MTLLoader()
	mtlLoader.setPath( 'objects/' )
	mtlLoader.load( 'palm.mtl', 
		function ( materials ) {

			materials.preload();
			
			let objLoader = new THREE.OBJLoader();
			materials.materials.palme.transparent = true;
			materials.materials.palme.side = THREE.DoubleSide;
			materials.materials.palme.alphaMap = alphaMapPic;
			materials.materials.palme.depthTest = false;

			console.log(materials);

			objLoader.setMaterials( materials );
			objLoader.setPath( 'objects/' );
			objLoader.load( 'palm.obj', 
				function ( object ) {
					palmTrans.add( palmScale );
					palmScale.add( object );
				}, function ( xhr ) {
						console.log( ( 'Palm-obj:' + xhr.loaded / xhr.total * 100 ) + '% loaded' );
					}, onError );
		} );
 }




function render() {

	time = clock.getElapsedTime();

	oceanMesh.material.uniforms.time.value = time;

	
	//perform animations
	oceanSpin.rotation.x = -3.14/2;
	oceanTrans.position.set(0, 0, 0);

	floorSpin.rotation.x = -3.14/2;
	floorTrans.position.set(0, -2.5, 0);
	
	islandTrans.position.set(0,6., 0);
	islandScale.scale.set(1.,0.75,1);

	palmTrans.position.set(-15, 6, 0);
	palmScale.scale.set(0.19,0.19,0.19);
	
	// Render the scene
	renderer.render( scene, camera );
}

function animate () {
	requestAnimationFrame( animate );
	render();
}

init();
animate();


/*	let materialPalm = new THREE.MeshLambertMaterial( {color: 0x80ff80, wireframe: false,overdraw: 0.5 } );
	materialPalm.flatShading = true;
	materialPalm.lights = true;
	
	
	sceneRoot.add(palmTrans);
	
	var mtlLoader = new MTLLoader();
		
		mtlLoader.setPath('objects/'); //till mtl-filen
		mtlLoader.load ('palme1.mtl', 

			function(palmMaterial) {

				palmMaterial.preload();
				
				var objLoader = new THREE.OBJLoader();

				//objLoader.setMaterials( palmMaterial );
				objLoader.setPath('objects/'); 
				objLoader.load( 'palmiii.obj' , 
				
					function (geometryPalm) {
						geometryPalm.traverse( function ( child ) {
							if ( child instanceof THREE.Mesh ) {
								//child.material = materialPalm;
								//child.material = palmMaterial;
							}
						} );
						//console.log(palmMaterial.materials.palme1);
						
						palmTrans.add( palmScale );
						palmScale.add( geometryPalm.children[0] );

						objLoader.setMaterials( palmMaterial.materials.palme1 );
						// set map
						//geometryPalm.children[0].material = palmMaterial.materials.palme1;
						//console.log(geometryPalm.children[0].material);

					}, function ( xhr ) {
							console.log( ( 'Palm-obj:' + xhr.loaded / xhr.total * 100 ) + '% loaded' );
						}, onError
				);
				
			},  function ( xhr ) {
					console.log( ( 'Palm-mat:' + xhr.loaded / xhr.total * 100 ) + '% loaded' );
				}, onError
		);
 
*/