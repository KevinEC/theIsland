var THREE = require("three");
var glslify = require("glslify");
var OBJLoader = require('three-obj-loader');
var MTLLoader = require('three-mtl-loader');
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
let palmTrans = new THREE.Group();
let palmScale = new THREE.Group();

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

var onProgress = function ( xhr ) {
	/*if (xhr.lenghtComputable){
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2) + '% downloaded' );
	}*/
	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}

var onError = function ( error ) {
	console.log( 'An error happened' );
}


function init() {
	
	container = document.getElementById( 'container' );
	
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
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
		
	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}

function lightInit(){

	var ambient = new THREE.AmbientLight( 0xffffff  , 0.5 );
	scene.add( ambient );

	spotLight = new THREE.SpotLight( 0xffff00, 3.5, 50 );
	spotLight.position.set( 0, 100, 260 );
	spotLight.angle = 3.14 / 4;

	spotLight.distance = 350;




	scene.add( spotLight );

	lightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( lightHelper );


}

function oceanInit(){
	//Geometries and meshes
	let geometryOcean = new THREE.PlaneBufferGeometry(300, 300, 300, 300);
	let geometryFloor1 = new THREE.PlaneBufferGeometry(300, 300, 300, 300);
	let geometryFloor2 = new THREE.PlaneBufferGeometry(300, 300, 300, 300);


	geometryOcean.addAttribute('light_pos', spotLight.position);
	geometryOcean.attributes.normal.needsUpdate = true;
	geometryFloor1.addAttribute('light_pos', spotLight.position);
	geometryFloor1.attributes.normal.needsUpdate = true;

	let materialOcean = new THREE.ShaderMaterial({
		vertexShader: glslify("./shaders/ocean.vert"),
		fragmentShader: glslify("./shaders/ocean.frag"),
		uniforms: {
			time: {type: "f", value: 1.0},
			light_pos: {value: spotLight.position},
			cam_pos: {value: camera.position}
		},
		wireframe: false,
		transparent: true
	});
	let materialFloor = new THREE.MeshPhongMaterial({color: 0x0080ff, transparent: true});

	oceanMesh = new THREE.Mesh( geometryOcean, materialOcean );
	floorMesh = new THREE.Mesh(geometryFloor1, materialFloor);
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
	loader.load( 'objects/island1.obj' , 
		
		function (geometryIsland) {
		geometryIsland.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = materialIsland;
			}
		} );
		islandTrans.add( geometryIsland );
		}, onProgress, onError
		/*function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}*/
	);
	
}

function palmInit(){
	
	let materialPalm = new THREE.MeshBasicMaterial( {color: 0xFF01FF, wireframe: false } );
	
	sceneRoot.add(palmTrans);
	sceneRoot.add(palmScale);
	
	let manager_ = new THREE.LoadingManager();
	manager_.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var mtlLoader = new MTLLoader();
	mtlLoader.load('objects/palmiii.mtl', function(palmMaterial) {
		
		palmMaterial.preload();
		
		let objLoader = new THREE.OBJLoader( manager_ );
		//objLoader.setMaterials( palmMaterial );
		objLoader.load( 'objects/palmiii.obj' , 
		
			function (geometryPalm) {
				geometryPalm.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						//child.material = palmMaterial;
						child.material = materialPalm;
					}
				} );
				
				palmTrans.add( geometryPalm );
				palmScale.add( geometryPalm );
			
			}, onProgress, onError);
	});


/*	let objLoader = new THREE.OBJLoader( manager_ );
	objLoader.load( 'objects/palmiii.obj' , 
		
		function (geometryPalm) {
		geometryPalm.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = materialPalm;
			}
		} );
		palmTrans.add( geometryPalm );
		palmScale.add( geometryPalm );
		},
		function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);
	*/
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
	palmTrans.position.set(0, 0, 0);
	palmScale.scale.set(0.01,0.01,0.01);
	
	// Render the scene
	renderer.render( scene, camera );
}

function animate () {
	requestAnimationFrame( animate );
	render();
}

init();
animate();