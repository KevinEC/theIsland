var THREE = require("three");
var glslify = require("glslify");
var OBJLoader = require('three-obj-loader');
var OrbitControls = require('three-orbit-controls')(THREE);
OBJLoader(THREE);

/* THREE js code goes here */
let container;
let camera, scene, renderer;
let spotLight, lightHelper, shadowCameraHelper;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

//Nodes and mesh nodes
let sceneRoot = new THREE.Group();
let oceanTrans = new THREE.Group();
let oceanSpin = new THREE.Group();
let islandTrans = new THREE.Group();
let floorSpin = new THREE.Group();
let floorTrans = new THREE.Group();
let floorMesh;
let oceanMesh;
let islandMesh;

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

function init() {
	
	container = document.getElementById( 'container' );
	
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
	let controls = new OrbitControls(camera);
	camera.position.y = 20;
	camera.position.x = 100;
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
		
	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}

function lightInit(){

	var ambient = new THREE.AmbientLight( 0xffffff  , 0.5 );
	scene.add( ambient );

	spotLight = new THREE.SpotLight( 0xffff00, 3.5, 50 );
	spotLight.position.set( 0, 100, 60 );
	spotLight.angle = 3.14 / 4;

	spotLight.distance = 150;




	scene.add( spotLight );

	lightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( lightHelper );


}

function oceanInit(){
	//Geometries and meshes
	let geometryOcean = new THREE.PlaneBufferGeometry(90, 90, 90, 90);
	let geometryFloor = new THREE.PlaneBufferGeometry(90, 90, 90, 90);


	geometryOcean.addAttribute('light_pos', spotLight.position);
	geometryOcean.attributes.normal.needsUpdate = true;
	geometryFloor.addAttribute('light_pos', spotLight.position);
	geometryFloor.attributes.normal.needsUpdate = true;

	let materialOcean = new THREE.ShaderMaterial({
		vertexShader: glslify("./shaders/ocean.vert"),
		fragmentShader: glslify("./shaders/ocean.frag"),
		uniforms: {
			time: {type: "f", value: 1.0},
			light_pos: {value: spotLight.position}
		},
		wireframe: false
	});
	let materialFloor = new THREE.MeshPhongMaterial({color: 0x0080ff});

	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );
	floorMesh = new THREE.Mesh(geometryFloor, materialFloor);
	console.log(materialFloor);
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
	loader.load( 'island1.obj' , 
		
		function (geometryIsland) {
		geometryIsland.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = materialIsland;
			}
		} );
		islandTrans.add( geometryIsland );
		},
		function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);
	
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
	
	// Render the scene
	renderer.render( scene, camera );
}

function animate () {
	requestAnimationFrame( animate );
	render();
}

init();
animate();