import * as THREE from 'three'
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

// Lights
var light = new THREE.DirectionalLight(0xffffff,0.5);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.5))

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, -20);

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
    const transform = new XRRigidTransform({ x: offsetPosition.x, y: -offsetPosition.y, z: offsetPosition.z, w: offsetPosition.w }, offsetRotation);  
    const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
    renderer.xr.setReferenceSpace(teleportSpaceOffset);
});


// Camera controls (for non-VR)
const controls = new OrbitControls(camera, renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color:'red'});
const materialBlue = new THREE.MeshLambertMaterial({color: 'blue'});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);
const cube2 = new THREE.Mesh(geometry, materialBlue);
cube2.position.set(0, 2, 0);
scene.add(cube2);

// Handle browser resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(time) {
    renderer.render(scene, camera);
    //cube.rotation.x = time / 1000;
    cube.rotation.y = time / 1000;
    camera.updateMatrixWorld();
}