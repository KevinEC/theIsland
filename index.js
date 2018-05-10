var THREE = require("three");
var glslify = require("glslify");
var OBJLoader = require('three-obj-loader');
var MTLLoader = require('three-mtl-loader');
var OrbitControls = require('three-orbit-controls')(THREE);
OBJLoader(THREE);

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
let palmTrans = new THREE.Group();
let palmScale = new THREE.Group();
let floorSpin = new THREE.Group();
let floorTrans = new THREE.Group();
let floorMesh;
let oceanMesh;
let islandMesh;
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

var onProgress = function ( xhr ) {
	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}

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

	var ambient = new THREE.AmbientLight( 0xffffff  , 0.5 );
	sceneRoot.add( ambient );

	pointLight = new THREE.PointLight( 0xffffff, 1. , 800);
	r_pointLight = new THREE.PointLight( 0xff0000, 2., 400 );
	g_pointLight = new THREE.PointLight( 0x00ff00, 1., 200 );

	pointLight.position.set( 0, 340, 700 );
	r_pointLight.position.set(0, 340, 650 );
	g_pointLight.position.set(0, 340, 650 );
	//spotLight.angle = 3.14 / 3;

	//directionalLight.distance = 0;

	sceneRoot.add( pointLight );
	sceneRoot.add( r_pointLight );
	sceneRoot.add( g_pointLight );

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
	let materialFloor = new THREE.MeshPhongMaterial({color: 0x0080ff, transparent: true, opacity: 0.8});

	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );
	floorMesh = new THREE.Mesh(geometryFloor1, materialFloor);
	materialFloor.needsUpdate = true;

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
	materialIsland.flatShading = true;
	materialIsland.lights = true;
	sceneRoot.add(islandTrans);
	
	let manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};
	
	let loader = new THREE.OBJLoader( manager );
	loader.load( 'objects/island1.obj' , 
		
		function (geometryIsland) {
		geometryIsland.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = materialIsland;
			}
		} );
		islandTrans.add( islandScale );
		islandScale.add( geometryIsland );
		}, onProgress, onError
	);
	
}

function palmInit(){
	
	//let materialPalm = new THREE.MeshBasicMaterial( {color: 0xFF01FF, wireframe: false } );
	
	sceneRoot.add(palmTrans);
	palmTrans.add(palmScale);
	
	let manager_ = new THREE.LoadingManager();
	manager_.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var mtlLoader = new MTLLoader(manager_);
	
	mtlLoader.setPath('objects/'); //till mtl-filen
	mtlLoader.load ('palmiii.mtl', 

		function(palmMaterial) {

			palmMaterial.preload();
			
			//console.log(palmMaterial.getAsArray());

			let objLoader = new THREE.OBJLoader( manager_ );
			
			objLoader.setPath('objects/'); 
			objLoader.load( 'palmiii.obj' , 
			
				function (geometryPalm) {
		
					objLoader.setMaterials( palmMaterial );
					palmTrans.add( geometryPalm );
					palmScale.add( geometryPalm );
				
				}, onProgress, onError
			);
			console.log(objLoader);
		},  onProgress, onError
	);
 //console.log(mtlLoader);

}

function render() {

	time = clock.getElapsedTime();

	oceanMesh.material.uniforms.time.value = time;

	
	//perform animations
	oceanSpin.rotation.x = -3.14/2;
	oceanTrans.position.set(0, 0, 0);

	floorSpin.rotation.x = -3.14/2;
	floorTrans.position.set(0, -4, 0);
	
	islandTrans.position.set(0, 0, 0);
	islandScale.scale.set(4.,4.,4.);

	palmTrans.position.set(0, 5., 0);
	palmScale.scale.set(0.05,0.05,0.05);
	
	// Render the scene
	renderer.render( scene, camera );
}

function animate () {
	requestAnimationFrame( animate );
	render();
}

init();
animate();