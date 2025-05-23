import * as THREE from './three.module.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { Water } from './objects/Water.js';
import { Sky } from './objects/Sky.js';

let container;
let camera, scene, renderer;
let controls, water, sun;

const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

init();
simulateLoadingAndStart();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 15, 100);

  scene = new THREE.Scene();

  sun = new THREE.Vector3();

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffcc66,
    waterColor: 0x00A0D2,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  });

  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = { elevation: 3, azimuth: 180 };
  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms['sunPosition'].value.copy(sun);
  water.material.uniforms['sunDirection'].value.copy(sun).normalize();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.4;
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;

  const sunTargetDistance = 100;
  const sunTarget = sun.clone().multiplyScalar(sunTargetDistance);
  controls.target.copy(sunTarget);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  water.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, camera);
}

// Simulate loading progress with smooth increments
function simulateLoadingAndStart() {
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 5; // random increment 0-5%
    if (progress >= 100) {
      progress = 100;
      updateLoadingUI(progress);
      clearInterval(interval);
      fadeOutLoadingOverlay();
      animate(); // start animation loop
    } else {
      updateLoadingUI(progress);
    }
  }, 100);
}

function updateLoadingUI(progress) {
  loadingText.textContent = `Setting sail... ${Math.floor(progress)}%`;
}

// Fade out loading overlay smoothly
function fadeOutLoadingOverlay() {
  loadingOverlay.style.opacity = '0';
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
  }, 1000); // match CSS transition duration
}
