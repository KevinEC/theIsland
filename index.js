var THREE = require("three");
var glslify = require("glslify");
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

/* THREE js code goes here */
let container;
let camera, scene, renderer;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

//Nodes and mesh nodes
let sceneRoot = new THREE.Group();
let oceanTrans = new THREE.Group();
let oceanSpin = new THREE.Group();
let islandTrans = new THREE.Group();
let oceanMesh;
let islandMesh;

let clock = new THREE.Clock();


function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {

	if(event.ctrlKey)
	{ 
    // mouseX, mouseY are in the range [-1, 1]
	mouseX = ( event.clientX - windowHalfX ) / windowHalfX;
	mouseY = ( event.clientY - windowHalfY ) / windowHalfY;
	}
}

function init() {
	
	container = document.getElementById( 'container' );
	
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.z = 5;
	
	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x340000 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	//Top level node
	scene.add( sceneRoot );
	
	oceanInit();
	islandInit();
		
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}

function oceanInit(){
	
	/*
	//Geometries and meshes
	let geometryOcean = new THREE.PlaneGeometry(60, 60, 32, 32);
	let materialOcean = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true } );
	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );
	
	//Create branches
	sceneRoot.add( oceanTrans );
	oceanTrans.add( oceanSpin );
	oceanSpin.add( oceanMesh );

	*/
	//Geometries and meshes
	let geometryOcean = new THREE.PlaneBufferGeometry(60, 60, 32, 32);

	let materialOcean = new THREE.ShaderMaterial({
		vertexShader: glslify("shaders/ocean.vert"),
		fragmentShader: glslify("shaders/ocean.frag"),
		uniforms: {
			time: 1.0,
		}
	});




	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );

	//Create branches
	sceneRoot.add( oceanTrans );
	oceanTrans.add( oceanSpin );
	oceanSpin.add( oceanMesh );

	
}

function islandInit(){
	
	let materialIsland = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true } );
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
	
	// Set up the camera
	camera.position.x = 0.5;
	camera.position.x = -mouseX*10;
	camera.lookAt( scene.position );

	deltaTime = clock.getDelta();

	oceanMesh.material.uniforms.time.value = deltaTime;

	
	//perform animations
	oceanSpin.rotation.x = 3.14/2;
	oceanTrans.position.set(0, -3, -5);
	
	islandTrans.position.set(0, -3, 5);
	
	// Render the scene
	renderer.render( scene, camera );
}

function animate () {
	requestAnimationFrame( animate );
	render();
}

init();
animate();