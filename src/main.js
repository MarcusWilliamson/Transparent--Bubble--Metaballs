import * as THREE from 'three'
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.setAnimationLoop(render);
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Light
var light = new THREE.DirectionalLight(0xffffff,0.5);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.5))

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color:'red'});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.5, -10);
scene.add(cube);

// Handle browser resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render every screen refresh
/*function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Cube rotation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}
animate();*/
function render(time) {
    renderer.render(scene, camera);
    cube.rotation.x = time / 1000;
    cube.rotation.y = time / 1000;
}