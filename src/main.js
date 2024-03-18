// Metaballs implementation based on three.js example at: https://threejs.org/examples/webgl_marchingcubes.html
// Marching cubes algorithm is in built-in MarchingCubes three.js module
// Background HDR image from: https://polyhaven.com/a/buikslotermeerplein

import * as THREE from 'three'
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';

// Parameters
const scale = 5;
let count = 10;
let speed = 0.5;
let size = 0.5;
let resolution = 50

let cube;
let material = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    metalness: 0,
    transmission: 1
}); //THREE.MeshLambertMaterial({color:'red'});

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

// Lights
// var light = new THREE.DirectionalLight(0xffffff,0.5);
// light.position.set(1, 1, 1).normalize();
// scene.add(light);
// scene.add(new THREE.AmbientLight(0xffffff,0.5))

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, -8);
//camera.position.set(scale, scale, -scale);

// Action...
// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.setAnimationLoop(render);
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));  // VR Button

// Move XR camera to camera position
// From: https://discourse.threejs.org/t/initial-webxr-position-same-as-camera-position/36682/12
renderer.xr.addEventListener('sessionstart', (e) => {
    const baseReferenceSpace = renderer.xr.getReferenceSpace();
    const offsetPosition = camera.position;
    const offsetRotation = camera.quaternion;
    const transform = new XRRigidTransform({ x: offsetPosition.x, y: -offsetPosition.y, z: offsetPosition.z, w: offsetPosition.w },
        { x: offsetRotation.x, y: -(offsetRotation.y), z: offsetRotation.z, w: offsetRotation.w });  
    const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
    renderer.xr.setReferenceSpace(teleportSpaceOffset);
});

// Camera controls (for non-VR)
const controls = new OrbitControls(camera, renderer.domElement);

// Handle browser resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Marching Cubes
let effect = new MarchingCubes(resolution, material, true, true, 100000);
effect.position.set(0, 0, 0);
effect.scale.set(scale, scale, scale);
effect.enableUvs = false;
effect.enableColors = false;
scene.add(effect);

let stats = new Stats();
document.body.appendChild(stats.dom);

// RGBE loader (background)
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const loader = new RGBELoader();
const backgroundTexture = new URL('../src/img/buikslotermeerplein_4k.hdr', import.meta.url);
loader.load(backgroundTexture, function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;  // Generates environment map/lighting based on texture
})

// Metaballs
function updateCubes(object, time, numblobs) {
    object.reset();

    const subtract = 12;
    const strength = size * 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1);

    for (let i = 0; i < numblobs; i++) {
        const ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
        const bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
		const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;
        object.addBall(ballx, bally, ballz, strength, subtract);
    }

    object.update();
}

let ballTime = 0;
const clock = new THREE.Clock();

function render(time) {
    renderer.render(scene, camera);
    stats.update();

    const delta = clock.getDelta();
    ballTime += delta * speed * 0.5;
    
    effect.init( Math.floor( resolution ) );
    updateCubes(effect, ballTime, count);
}