// main.js - Handles Three.js background and initial loading animation
// This script is designed to be self-contained for the 3D background and loading sequence.

import * as THREE from './three.module.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { Water } from './objects/Water.js';
import { Sky } from './objects/Sky.js';

// Global variables for Three.js scene elements
let container;
let camera, scene, renderer;
let controls, water, sun;

// DOM elements for the loading overlay
const loadingOverlay = document.getElementById('loading-overlay');
// Removed: const loadingText = document.getElementById('loading-text'); as per user request

/**
 * Initializes the Three.js scene, camera, renderer, water, sky, and OrbitControls.
 * This function sets up the visual background of the website.
 */
function init() {
  // Create a container for the renderer's DOM element and append it to the body
  // This container is separate from the #threejs-background div in HTML,
  // but the renderer's canvas will be appended to it.
  container = document.createElement('div');
  // The #threejs-background div already exists and is styled via CSS to cover the viewport.
  // We'll append the renderer's DOM element directly to it.
  const threeJsBackgroundDiv = document.getElementById('threejs-background');
  if (threeJsBackgroundDiv) {
    threeJsBackgroundDiv.appendChild(container);
  } else {
    console.error("Error: #threejs-background div not found in HTML. Three.js scene cannot be initialized.");
    return; // Exit if the container is not found
  }


  // Initialize the camera: PerspectiveCamera(fov, aspect, near, far)
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 15, 100); // Set initial camera position

  // Initialize the scene
  scene = new THREE.Scene();

  // Initialize the sun vector for lighting and sky simulation
  sun = new THREE.Vector3();

  // Create water geometry (large plane)
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  // Initialize Water object with textures and properties
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    // Load water normals texture and set wrapping properties
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(), // Initial sun direction
    sunColor: 0xffcc66, // Sun color (yellowish)
    waterColor: 0x00A0D2, // Water color (blueish)
    distortionScale: 3.7, // Scale of water distortion
    fog: scene.fog !== undefined // Enable fog if scene has it (currently false)
  });

  // Rotate water plane to be horizontal
  water.rotation.x = -Math.PI / 2;
  scene.add(water); // Add water to the scene

  // Initialize Sky object for atmospheric scattering
  const sky = new Sky();
  sky.scale.setScalar(10000); // Scale the sky to encompass the scene
  scene.add(sky); // Add sky to the scene

  // Configure sky uniforms for atmospheric effects
  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  // Set sun position based on elevation and azimuth
  const parameters = { elevation: 3, azimuth: 180 }; // Elevation (degrees above horizon), Azimuth (degrees from North)
  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation); // Convert elevation to spherical coordinate phi
  const theta = THREE.MathUtils.degToRad(parameters.azimuth); // Convert azimuth to spherical coordinate theta

  sun.setFromSphericalCoords(1, phi, theta); // Set sun position using spherical coordinates
  sky.material.uniforms['sunPosition'].value.copy(sun); // Update sky with sun position
  water.material.uniforms['sunDirection'].value.copy(sun).normalize(); // Update water with normalized sun direction

  // Initialize WebGLRenderer
  renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing for smoother edges
  renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for high-DPI displays
  renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to full window
  container.appendChild(renderer.domElement); // Append renderer's canvas to the container

  // Initialize OrbitControls for camera interaction (mouse/touch)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.4; // Limit vertical rotation
  controls.minDistance = 40.0; // Minimum zoom distance
  controls.maxDistance = 200.0; // Maximum zoom distance
  controls.enableZoom = false; // Disable zoom as per user's original script's intent for the background scene

  // Set controls target relative to the sun position for a focused view
  const sunTargetDistance = 100;
  const sunTarget = sun.clone().multiplyScalar(sunTargetDistance);
  controls.target.copy(sunTarget);
  controls.update(); // Update controls after changing target

  // Add event listener for window resize to adjust camera and renderer
  window.addEventListener('resize', onWindowResize, false);
}

/**
 * Handles window resize events to update camera aspect ratio and renderer size.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // Update camera's projection matrix
  renderer.setSize(window.innerWidth, window.innerHeight); // Resize renderer
}

/**
 * Animation loop for rendering the Three.js scene.
 */
function animate() {
  requestAnimationFrame(animate); // Request next animation frame
  render(); // Call render function
}

/**
 * Renders the Three.js scene.
 */
function render() {
  // Update water's time uniform for animation
  water.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, camera); // Render the scene
}

/**
 * Simulates loading progress and starts the Three.js animation after completion.
 * This function also manages the fading out of the loading overlay.
 */
function simulateLoadingAndStart() {
  let progress = 0; // Initial loading progress

  const interval = setInterval(() => {
    progress += Math.random() * 5; // Increment progress by a random amount (0-5%)
    if (progress >= 100) {
      progress = 100; // Cap progress at 100%
      // Removed: updateLoadingUI(progress); as per user request
      clearInterval(interval); // Stop the interval
      fadeOutLoadingOverlay(); // Start fading out the overlay
      animate(); // Start the Three.js animation loop
    } else {
      // Removed: updateLoadingUI(progress); as per user request
    }
  }, 100); // Update every 100 milliseconds
}

/**
 * Removed: updateLoadingUI function as per user request.
 */

/**
 * Fades out the loading overlay smoothly and then removes it from the DOM.
 * Also sets aria-busy to false and aria-hidden to false for the main content.
 */
function fadeOutLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0'; // Start fade-out animation
    loadingOverlay.setAttribute('aria-busy', 'false'); // Indicate loading is complete

    setTimeout(() => {
      loadingOverlay.style.display = 'none'; // Hide after transition
      loadingOverlay.remove(); // Remove from DOM after it's hidden

      // Reveal main page content
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        pageContent.setAttribute('aria-hidden', 'false');
        pageContent.classList.add('visible'); // Trigger CSS fade-in for page-content
      }
    }, 1000); // Match CSS transition duration for opacity
  }
}

// Initialize the Three.js scene and start the loading simulation when the window loads.
// This ensures all DOM elements are available before script execution.
window.onload = function () {
  init(); // Initialize Three.js scene
  simulateLoadingAndStart(); // Start loading simulation
};
