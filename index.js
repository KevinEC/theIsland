var THREE = require("three");

var container;

/* THREE js code goes here */
var container;
var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

//Nodes and mesh nodes
var sceneRoot = new THREE.Group();
var oceanTrans = new THREE.Group();
var oceanSpin = new THREE.Group();
var islandTrans = new THREE.Group();
var oceanMesh;
var islandMesh;


function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    // mouseX, mouseY are in the range [-1, 1]
	mouseX = ( event.clientX - windowHalfX ) / windowHalfX;
	mouseY = ( event.clientY - windowHalfY ) / windowHalfY;
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
	
	//Geometries and meshes
	var geometryOcean = new THREE.PlaneGeometry(60, 60, 32, 32);
	var materialOcean = new THREE.MeshBasicMaterial(  {color: 0xffff00, wireframe: true }  );
	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );
	
	//Top level node
	scene.add( sceneRoot );
	
	//Create branches
	sceneRoot.add( oceanTrans );
	oceanTrans.add( oceanSpin );
	oceanSpin.add( oceanMesh );
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}

function render() {
	
	// Set up the camera
	camera.position.x = 0.5;
	camera.position.x = -mouseX*10;
	camera.lookAt( scene.position );
	
	//perform animations
	oceanSpin.rotation.x = 3.14/2;
	oceanTrans.position.set(0, -3, -5);
	
	// Render the scene
	renderer.render( scene, camera );
}

var animate = function () {
	requestAnimationFrame( animate );
	render();
};

init();
console.log(scene);
animate();