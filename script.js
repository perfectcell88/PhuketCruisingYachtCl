// Combined script based on your index2.txt and new widget requirements

import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/controls/OrbitControls.js';
import { Water } from './js/objects/Water.js';
import { Sky } from './js/objects/Sky.js'; // CORRECTED: from instead of =

const overlay = document.getElementById('loading-overlay');
const prog = document.querySelector('#loading-circle circle.progress');
const pageContent = document.getElementById('page-content');
const mainScrollableContentWrapper = document.getElementById('main-scrollable-content-wrapper');
const navContainer = document.querySelector('.nav-container');
const homeContent = document.querySelector('.home-content');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinksContainer = document.querySelector('.nav-links'); // Changed variable name for clarity
let progress = 0;

if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
    });
}

const navLinkElements = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

navLinkElements.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        const currentlyActiveLink = document.querySelector('.nav-link.active');
        const isSameLink = currentlyActiveLink && currentlyActiveLink === link;

        // Close the navigation menu only if a DIFFERENT link is clicked,
        // or if the 'home' link is clicked (even if it's already active, it represents a navigation action)
        if (navLinksContainer && navLinksContainer.classList.contains('open') && !isSameLink) {
            navLinksContainer.classList.remove('open');
        }

        // Handle navigation and active states only if a different link is clicked
        // or if no link is currently active (first click)
        if (!isSameLink) {
            if (targetId === 'home') {
                if (homeContent) homeContent.classList.add('visible');
                contentSections.forEach(section => section.classList.remove('active'));
                navLinkElements.forEach(l => l.classList.remove('active')); // Ensure no nav link remains active when going home
                if (mainScrollableContentWrapper) mainScrollableContentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                navLinkElements.forEach(l => l.classList.remove('active'));
                link.classList.add('active'); // This marks the clicked link as active
                contentSections.forEach(section => section.classList.toggle('active', section.id === targetId));
                if (homeContent) homeContent.classList.remove('visible');
                const targetSectionElement = document.getElementById(targetId);
                if (targetSectionElement && mainScrollableContentWrapper) {
                    setTimeout(() => {
                        const navHeight = navContainer ? navContainer.offsetHeight : 0;
                        mainScrollableContentWrapper.scrollTo({ top: targetSectionElement.offsetTop - navHeight, behavior: 'smooth' });
                    }, 100);
                }
            }
        }
    });
});

const closeButtons = document.querySelectorAll('.close-btn');
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetSectionId = btn.getAttribute('data-target'); // Assuming 'data-target' on the close button points to the section to close
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) targetSection.classList.remove('active'); // Hides the content section
        if (homeContent) homeContent.classList.add('visible'); // Shows the home content
        navLinkElements.forEach(link => link.classList.remove('active')); // Deactivates nav links
        if (mainScrollableContentWrapper) mainScrollableContentWrapper.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls to top

        // Add closing the navigation menu when the close button is clicked
        if (navLinksContainer) {
            navLinksContainer.classList.remove('open');
        }
    });
});

const contactForm = document.getElementById('contact-form');
const formSuccess = document.querySelector('.form-success');
if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formSuccess.classList.add('visible');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.remove('visible'), 5000);
    });
}

function createWaterParticles() {
    const particlesContainer = document.getElementById('particles-container');
    const titleElement = document.querySelector('.home-title');
    if (!particlesContainer || !titleElement || !homeContent) return;
    particlesContainer.innerHTML = '';
    const titleRect = titleElement.getBoundingClientRect();
    const homeContentRect = homeContent.getBoundingClientRect();
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('water-particle');
        const particleX = (titleRect.left - homeContentRect.left) + (Math.random() * titleRect.width) + (Math.random() * 40 - 20);
        const particleY = (titleRect.top - homeContentRect.top) + (Math.random() * titleRect.height) + (Math.random() * 20 - 10);
        particle.style.left = `${particleX}px`;
        particle.style.top = `${particleY}px`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particlesContainer.appendChild(particle);
    }
}

document.querySelectorAll('.book-btn, .premium-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        contentSections.forEach(section => section.classList.remove('active'));
        const contactSection = document.getElementById('contact');
        if (contactSection) contactSection.classList.add('active');
        if (homeContent) homeContent.classList.remove('visible');
        navLinkElements.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#contact') link.classList.add('active');
        });
        const contactSectionElement = document.getElementById('contact');
        if (contactSectionElement && mainScrollableContentWrapper) {
            setTimeout(() => {
                const navHeight = navContainer ? navContainer.offsetHeight : 0;
                mainScrollableContentWrapper.scrollTo({ top: contactSectionElement.offsetTop - navHeight, behavior: 'smooth' });
            }, 100);
        }
        setTimeout(() => {
            const subjectField = document.getElementById('subject');
            if (subjectField) { subjectField.value = "Accommodation Inquiry"; subjectField.focus(); }
        }, 100);
    });
});

function initScene() {
    const threeJsBackground = document.getElementById('threejs-background');
    if (!threeJsBackground) { console.warn("Three.js background container not found."); return; }
    const container = document.createElement('div');
    threeJsBackground.appendChild(container);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100); // Original camera position

    const scene = new THREE.Scene();
    const sun = new THREE.Vector3();

    // Restored original Water settings
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffcc66, // Original sunColor from your file
        waterColor: 0x001e0f, // Original waterColor from your file (line 141 in index2.txt script block)
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Restored original Sky settings
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = 10; // Original
    uniforms['rayleigh'].value = 2;  // Original
    uniforms['mieCoefficient'].value = 0.005; // Original
    uniforms['mieDirectionalG'].value = 0.8; // Original

    // Restored original sun position logic from your index2.txt (lines 150-154)
    // Original logic: parameters.elevation = 2; parameters.azimuth = 180;
    // phi = MathUtils.degToRad( 90 - elevation ); theta = MathUtils.degToRad( azimuth );
    const elevation = 2; // degrees above the horizon
    const azimuth = 180; // degrees from the north, 180 is west (sunset direction)
    const phi_original = THREE.MathUtils.degToRad(90 - elevation);
    const theta_original = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi_original, theta_original);

    uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    const renderer = new THREE.WebGLRenderer({ antialias: true }); // No alpha for opaque sky
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495; // Original
    controls.minDistance = 40.0; // Original
    controls.maxDistance = 200.0; // Original
    controls.target.set(0, 10, 0); // Original target
    controls.enableZoom = false; // Original
    controls.update();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (homeContent && homeContent.classList.contains('visible')) createWaterParticles();
    });

    function animate() {
        requestAnimationFrame(animate);
        water.material.uniforms['time'].value += 1.0 / 60.0; // Original time update
        renderer.render(scene, camera);
    }
    animate();

    setTimeout(() => {
        if (navContainer) navContainer.classList.add('visible');
        if (homeContent) { homeContent.classList.add('visible'); createWaterParticles(); }
    }, 1000);
}

const loadingInterval = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 10 + 5);
    const circumference = 2 * Math.PI * 45;
    if (prog) prog.style.strokeDashoffset = circumference * (1 - progress / 100);
    if (progress >= 100) {
        clearInterval(loadingInterval);
        if (overlay) overlay.classList.add('fade-out');
        setTimeout(() => {
            if (overlay) overlay.remove();
            initScene();
            if (pageContent) { pageContent.setAttribute('aria-hidden', 'false'); pageContent.classList.add('visible'); }
        }, 1000);
    }
}, 200);

const galleryContainer = document.getElementById('gallery-container');
const galleryImages = [
    { src: 'images/beautiful-woman-yacht-swimwear.jpg', alt: 'Woman on yacht in Phuket waters' },
    { src: 'images/473599725_10160435212412175_501266893980304214_n.jpg', alt: 'Yacht sailing in Phuket' },
    { src: 'images/148872788_3169037883196094_849598998136454814_n.jpg', alt: 'Yacht Club gathering' },
    { src: 'images/118274592_10157223767507175_1027198816200289080_n.jpg', alt: 'Sailing in Phuket' },
    { src: 'images/75380478_10156391073797175_4972174924367003648_n.jpg', alt: 'Yacht sailing' },
    { src: 'images/463398656_7798563456910157_6872878179612088792_n.jpg', alt: 'Seafood at the yacht club' },
    { src: 'images/468066240_10102904678842276_3997282509366841665_n.jpg', alt: 'Yacht club members' },
    { src: 'images/464508298_8693886117336396_5575655286860524176_n.jpg', alt: 'Sailing yacht' },
    { src: 'images/sailboat-414509_1280.jpg', alt: 'Sailboat at sunset' }
];
if (galleryContainer) {
    galleryImages.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);
        galleryItem.addEventListener('click', () => {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            const lightboxImg = document.createElement('img');
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;
            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);
            lightbox.addEventListener('click', () => { lightbox.remove(); });
        });
    });
}

// 🕐 Live Local Time Script (Restored from your original index2.txt)
// Note: The element with id="localTime" was part of the old dashboard.
// This function will run but won't display anything unless you add <div id="localTime"></div> somewhere.
function updateLocalTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeString = now.toLocaleTimeString('en-GB', options);
    const localTimeElement = document.getElementById('localTime');
    if (localTimeElement) {
        localTimeElement.textContent = `Current Local Time: ${timeString}`;
    }
}
setInterval(updateLocalTime, 1000);
updateLocalTime(); // Initial call

// 🔁 Auto-refresh iframes in the NEW dashboard structure every 15 minutes
setInterval(() => {
    document.querySelectorAll('.widget iframe').forEach(iframe => { // Targets iframes in the new .widget class
        try {
            iframe.contentWindow.location.reload(); // More robust reload
        } catch (e) {
            // Fallback for cross-origin iframes (might not always work due to security)
            iframe.src = iframe.src;
            console.warn("Attempted to refresh iframe, possibly cross-origin:", iframe.src, e);
        }
    });
}, 15 * 60 * 1000); // 15 minutes

// --- NEW WIDGET JAVASCRIPT ---
const lat = 7.8;
const lon = 98.34;
const openWeatherKey = '28851ddd3b7cc40ca37d8834dc944ade';
const weatherApiKey = 'a6ee8a34083c4ab296b65918252105';

function fetchWarnings() {
    const warningDiv = document.getElementById('weather-warnings');
    if (!warningDiv) return;
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${openWeatherKey}`)
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(data => {
            if (data.alerts && data.alerts.length > 0) {
                warningDiv.innerHTML = data.alerts.map(alert => `<p class='warning'><strong>${alert.event}</strong> (${new Date(alert.start * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(alert.end * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}):<br>${alert.description}</p>`).join('');
            } else { warningDiv.innerHTML = '<p>No active weather alerts.</p>'; }
        }).catch(error => { console.error('Error fetching weather warnings:', error); warningDiv.innerHTML = '<p>Could not load weather alerts.</p>'; });
}

function fetchUvIndex() {
    const uvDiv = document.getElementById('uv-index');
    if (!uvDiv) return;
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${openWeatherKey}`)
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(data => {
            if (data.current && typeof data.current.uvi !== 'undefined') {
                let uviDesc = "";
                if (data.current.uvi <= 2) uviDesc = "Low"; else if (data.current.uvi <= 5) uviDesc = "Moderate"; else if (data.current.uvi <= 7) uviDesc = "High"; else if (data.current.uvi <= 10) uviDesc = "Very High"; else uviDesc = "Extreme";
                uvDiv.innerHTML = `<p style="font-size: 1.8em; margin-bottom: 5px;">${data.current.uvi}</p><p>(${uviDesc})</p>`;
            } else { uvDiv.innerHTML = '<p>UV Index data not available.</p>'; }
        }).catch(error => { console.error('Error fetching UV Index:', error); uvDiv.innerHTML = '<p>Could not load UV Index.</p>'; });
}

function fetchSunriseSunset() {
    const sunriseSunsetDiv = document.getElementById('sunrise-sunset');
    if (!sunriseSunsetDiv) return;
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${openWeatherKey}`)
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(data => {
            if (data.current && data.current.sunrise && data.current.sunset) {
                const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
                const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
                sunriseSunsetDiv.innerHTML = `<p>Sunrise: ${sunriseTime}</p><p>Sunset: ${sunsetTime}</p>`;
            } else { sunriseSunsetDiv.innerHTML = '<p>Sunrise/Sunset data not available.</p>'; }
        }).catch(error => { console.error('Error fetching Sunrise/Sunset:', error); sunriseSunsetDiv.innerHTML = '<p>Could not load Sunrise/Sunset data.</p>'; });
}

function fetchSeaTemp() {
    const seaTempDiv = document.getElementById('sea-temp');
    if (!seaTempDiv) return;
    fetch(`https://api.weatherapi.com/v1/marine.json?key=${weatherApiKey}&q=${lat},${lon}&days=1`)
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(data => {
            if (data.forecast && data.forecast.forecastday && data.forecast.forecastday[0] && data.forecast.forecastday[0].hour) {
                const hoursArray = data.forecast.forecastday[0].hour; const currentHour = new Date().getHours(); let temp = 'N/A';
                const currentHourData = hoursArray.find(h => new Date(h.time_epoch * 1000).getHours() === currentHour);
                if (currentHourData && typeof currentHourData.water_temp_c !== 'undefined') { temp = currentHourData.water_temp_c; }
                else if (hoursArray.length > 0 && typeof hoursArray[0].water_temp_c !== 'undefined') { temp = hoursArray[0].water_temp_c; }
                seaTempDiv.innerHTML = `<p style="font-size: 1.8em; margin-bottom: 5px;">${temp}°C</p>`;
            } else { seaTempDiv.innerHTML = '<p>Sea Temp data not available.</p>'; }
        }).catch(error => { console.error('Error fetching Sea Temperature:', error); seaTempDiv.innerHTML = '<p>Could not load Sea Temp.</p>'; });
}

function fetchMoonPhase() {
    const moonPhaseDiv = document.getElementById('moon-phase-content');
    if (!moonPhaseDiv) return;
    fetch(`https://api.weatherapi.com/v1/astronomy.json?key=${weatherApiKey}&q=${lat},${lon}`)
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(data => {
            if (data.astronomy && data.astronomy.astro && data.astronomy.astro.moon_phase) {
                moonPhaseDiv.innerHTML = `<p><strong>${data.astronomy.astro.moon_phase}</strong></p><p style="font-size:0.9em;">Moonrise: ${data.astronomy.astro.moonrise}</p><p style="font-size:0.9em;">Moonset: ${data.astronomy.astro.moonset}</p>`;
            } else { moonPhaseDiv.innerHTML = '<p>Moon Phase data not available.</p>'; }
        }).catch(error => { console.error('Error fetching Moon Phase:', error); moonPhaseDiv.innerHTML = '<p>Could not load Moon Phase data.</p>'; });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWarnings(); fetchUvIndex(); fetchSunriseSunset(); fetchSeaTemp(); fetchMoonPhase();
    setInterval(fetchWarnings, 10 * 60 * 1000);
    setInterval(fetchUvIndex, 30 * 60 * 1000);
    setInterval(fetchSunriseSunset, 60 * 60 * 1000);
    setInterval(fetchSeaTemp, 30 * 60 * 1000);
    setInterval(fetchMoonPhase, 6 * 60 * 60 * 1000);
    if (homeContent && homeContent.classList.contains('visible')) createWaterParticles();
});
window.addEventListener('load', () => { if (homeContent && homeContent.classList.contains('visible')) createWaterParticles(); });
window.addEventListener('resize', createWaterParticles);

// --- END OF NEW WIDGET JAVASCRIPT ---
