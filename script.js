// script.js - Handles all page interactivity except the Three.js background and initial loading.
// This includes navigation, content section toggling, form submission, gallery, and local time display.

// --- DOM Element References ---
// These elements are expected to be present in indexpl.txt
const pageContent = document.getElementById('page-content'); // Main wrapper for all page content
const mainScrollableContentWrapper = document.getElementById('main-scrollable-content-wrapper'); // The div that handles main page scrolling
const navContainer = document.querySelector('.nav-container'); // Container for the fixed navigation bar
const homeContent = document.querySelector('.home-content'); // The home section content
const mobileMenuBtn = document.querySelector('.mobile-menu-btn'); // Hamburger menu button
const navLinksContainer = document.querySelector('.nav-links'); // Container for navigation links (mobile menu overlay)
const navLinkElements = document.querySelectorAll('.nav-link'); // All individual navigation links
const contentSections = document.querySelectorAll('.content-section'); // All overlay content sections
const closeButtons = document.querySelectorAll('.close-btn'); // Close buttons for content sections
const contactForm = document.getElementById('contact-form'); // Contact form element
const formSuccess = document.querySelector('.form-success'); // Success message for contact form
const galleryContainer = document.getElementById('gallery-container'); // Container for gallery images
const particlesContainer = document.getElementById('particles-container'); // Container for water particles on home screen
const homeTitleElement = document.querySelector('.home-title'); // The main title on the home screen

// --- Mobile Menu Toggle ---
/**
 * Toggles the 'open' class on the navigation links container to show/hide the mobile menu.
 * Ensures elements exist before adding event listener.
 */
if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
        // Toggle aria-expanded for accessibility
        const isExpanded = navLinksContainer.classList.contains('open');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        // When mobile menu is open, disable scroll on body
        document.body.classList.toggle('overlay-active', isExpanded);
    });
}

// --- Navigation Handling ---
/**
 * Handles clicks on navigation links to show/hide content sections and manage active states.
 */
navLinkElements.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior (page reload)
        const targetId = link.getAttribute('href').substring(1); // Get target section ID from href

        // Close mobile menu if it's open
        if (navLinksContainer && navLinksContainer.classList.contains('open')) {
            navLinksContainer.classList.remove('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overlay-active'); // Re-enable body scroll
        }

        // Handle 'home' link separately
        if (targetId === 'home') {
            if (homeContent) homeContent.classList.add('visible'); // Show home content
            contentSections.forEach(section => section.classList.remove('active')); // Hide all other sections
            navLinkElements.forEach(l => l.classList.remove('active')); // Deactivate all nav links
            if (mainScrollableContentWrapper) mainScrollableContentWrapper.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
            // Re-create water particles if home content is visible (for responsive adjustments)
            if (homeContent && homeContent.classList.contains('visible')) createWaterParticles();
        } else {
            // Update active navigation link
            navLinkElements.forEach(l => l.classList.remove('active'));
            link.classList.add('active'); // Mark clicked link as active

            // Show target content section and hide home content
            contentSections.forEach(section => {
                const isActive = section.id === targetId;
                section.classList.toggle('active', isActive);
                // Set aria-hidden based on active state
                section.setAttribute('aria-hidden', !isActive);
                // If a content section is active, disable body scroll
                document.body.classList.toggle('overlay-active', isActive);
            });
            if (homeContent) homeContent.classList.remove('visible');

            // Scroll to the top of the main scrollable content wrapper
            const targetSectionElement = document.getElementById(targetId);
            if (targetSectionElement && mainScrollableContentWrapper) {
                setTimeout(() => {
                    const navHeight = navContainer ? navContainer.offsetHeight : 0;
                    mainScrollableContentWrapper.scrollTo({ top: targetSectionElement.offsetTop - navHeight, behavior: 'smooth' });
                }, 100); // Small delay to allow section to become active
            }
        }
    });
});

// --- Close Button Functionality for Content Sections ---
/**
 * Handles clicks on close buttons to hide content sections and return to home.
 */
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetSectionId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetSectionId);

        if (targetSection) {
            targetSection.classList.remove('active'); // Hide the content section
            targetSection.setAttribute('aria-hidden', 'true'); // Hide from accessibility tree
        }
        if (homeContent) homeContent.classList.add('visible'); // Show home content
        navLinkElements.forEach(link => link.classList.remove('active')); // Deactivate nav links
        if (mainScrollableContentWrapper) mainScrollableContentWrapper.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top

        document.body.classList.remove('overlay-active'); // Re-enable body scroll

        // Re-create water particles if home content is visible (for responsive adjustments)
        if (homeContent && homeContent.classList.contains('visible')) createWaterParticles();
    });
});

// --- Contact Form Submission ---
/**
 * Handles contact form submission, shows success message, and resets form.
 */
if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        formSuccess.classList.add('visible'); // Show success message
        contactForm.reset(); // Clear form fields
        // Announce success message to screen readers
        formSuccess.focus(); // Move focus to the success message
        setTimeout(() => {
            formSuccess.classList.remove('visible'); // Hide success message after 5 seconds
            // Optionally, move focus back to the form or a logical next element
            if (contactForm) contactForm.querySelector('input[type="text"]').focus();
        }, 5000);
    });
}

// --- Water Particles Effect on Home Screen ---
/**
 * Creates and positions subtle water particle elements around the home title.
 * This function is called on page load, resize, and when returning to the home screen.
 */
function createWaterParticles() {
    // Ensure necessary elements exist
    if (!particlesContainer || !homeTitleElement || !homeContent || !mainScrollableContentWrapper) {
        console.warn("Missing elements for water particles. Aborting createWaterParticles.");
        return;
    }

    // Clear any existing particles to prevent accumulation on resize/re-entry
    particlesContainer.innerHTML = '';

    // Get title position and dimensions relative to the viewport
    const titleRect = homeTitleElement.getBoundingClientRect();
    // Get home content position relative to the viewport
    const homeContentRect = homeContent.getBoundingClientRect();

    // Create a fixed number of particles
    const numberOfParticles = 40; // You can adjust this number

    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('water-particle');

        // Calculate position relative to the home-content, allowing for slight randomness
        // The particles will appear within and slightly around the title area
        const particleX = (titleRect.left - homeContentRect.left) + (Math.random() * titleRect.width) + (Math.random() * 40 - 20);
        const particleY = (titleRect.top - homeContentRect.top) + (Math.random() * titleRect.height) + (Math.random() * 20 - 10);

        particle.style.left = `${particleX}px`;
        particle.style.top = `${particleY}px`;

        // Apply a random animation delay to make particles appear asynchronously
        particle.style.animationDelay = `${Math.random() * 3}s`;

        particlesContainer.appendChild(particle);
    }
}

// --- Accommodation "Inquire Now" Buttons ---
/**
 * Makes all "Inquire Now" buttons redirect to the contact form section.
 */
document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Hide all content sections
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });

        // Show the contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.classList.add('active');
            contactSection.setAttribute('aria-hidden', 'false');
            document.body.classList.add('overlay-active'); // Disable body scroll
        }

        // Hide home content
        if (homeContent) homeContent.classList.remove('visible');

        // Update active navigation link to 'Contact'
        navLinkElements.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#contact') {
                link.classList.add('active');
            }
        });

        // Scroll to the contact section within the scrollable wrapper
        const contactSectionElement = document.getElementById('contact');
        if (contactSectionElement && mainScrollableContentWrapper && navContainer) {
            setTimeout(() => { // Small delay to allow element to become active/visible
                const navHeight = navContainer.offsetHeight;
                mainScrollableContentWrapper.scrollTo({
                    top: contactSectionElement.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }

        // Focus on subject field and pre-fill with "Accommodation Inquiry"
        setTimeout(() => {
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                subjectField.value = "Accommodation Inquiry";
                subjectField.focus(); // Set focus for accessibility
            }
        }, 100);
    });
});

// --- Gallery Implementation ---
/**
 * Populates the gallery with images and sets up lightbox functionality.
 */
if (galleryContainer) {
    const galleryImages = [
        { src: 'images/sailboat-414509_1280.jpg', alt: 'Woman on yacht in Phuket waters' },
        { src: 'images/473599725_10160435212412175_501266893980304214_n.jpg', alt: 'Yacht sailing in Phuket' },
        { src: 'images/148872788_3169037883196094_849598998136454814_n.jpg', alt: 'Yacht Club gathering' },
        { src: 'images/118274592_10157223767507175_1027198816200289080_n.jpg', alt: 'Sailing in Phuket' },
        { src: 'images/75380478_10156391073797175_4972174924367003648_n.jpg', alt: 'Yacht sailing' },
        { src: 'images/463398656_7798563456910157_6872878179612088792_n.jpg', alt: 'Seafood at the yacht club' },
        { src: 'images/468066240_10102904678842276_3997282509366841665_n.jpg', alt: 'Yacht club members' },
        { src: 'images/464508298_8693886117336396_5575655286860524176_n.jpg', alt: 'Sailing yacht' },
        { src: 'images/beautiful-woman-yacht-swimwear.jpg', alt: 'Sailboat at sunset' } // Corrected duplicate src
    ];

    galleryImages.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('role', 'button'); // Make it a button for accessibility
        galleryItem.setAttribute('tabindex', '0'); // Make it focusable
        galleryItem.setAttribute('aria-label', `View larger image of ${image.alt}`);

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        // Add onerror for image fallbacks
        img.onerror = function() { this.onerror=null; this.src='https://placehold.co/200x200/000c1a/f9d976?text=Image+Error'; };

        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);

        // Lightbox functionality on click or keyboard enter
        const openLightbox = () => {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', `Image: ${image.alt}`);
            // Set focus to the lightbox for accessibility
            lightbox.setAttribute('tabindex', '-1');

            const lightboxImg = document.createElement('img');
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;
            lightboxImg.onerror = function() { this.onerror=null; this.src='https://placehold.co/800x600/000c1a/f9d976?text=Image+Error'; };

            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);

            lightbox.focus(); // Set focus to the lightbox

            // Close lightbox on click or Escape key
            lightbox.addEventListener('click', () => { lightbox.remove(); });
            lightbox.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    lightbox.remove();
                }
            });
        };

        galleryItem.addEventListener('click', openLightbox);
        galleryItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { // Allow Enter or Space key to open
                e.preventDefault(); // Prevent default scroll behavior for spacebar
                openLightbox();
            }
        });
    });
}

// --- Live Local Time Script ---
/**
 * Updates the 'Current Local Time' display every second.
 * Assumes 'Asia/Bangkok' timezone.
 */
function updateLocalTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeString = now.toLocaleTimeString('en-GB', options);
    const localTimeElement = document.getElementById('localTime');
    if (localTimeElement) { // Ensure element exists before updating
        localTimeElement.textContent = `Current Local Time: ${timeString}`;
    }
}
setInterval(updateLocalTime, 1000);
updateLocalTime(); // Initial call to display time immediately

// --- Auto-refresh Iframes in Dashboard ---
/**
 * Auto-refreshes all iframes within elements with class 'widget' every 15 minutes.
 * Uses a more robust reload method and includes error handling for cross-origin issues.
 */
setInterval(() => {
    document.querySelectorAll('.widget iframe').forEach(iframe => {
        try {
            // Attempt to reload the iframe content directly
            iframe.contentWindow.location.reload();
        } catch (e) {
            // Fallback for cross-origin iframes where direct reload might be blocked
            // Re-setting src attribute can sometimes trigger a reload, but might not work for all cases.
            iframe.src = iframe.src;
            console.warn("Attempted to refresh iframe, possibly cross-origin or security blocked:", iframe.src, e);
        }
    });
}, 15 * 60 * 1000); // 15 minutes

// --- Dashboard Widget Data Handling (Reverted to static/placeholder as per user request) ---
// Removed API keys and fetch functions for weather warnings, UV index, sunrise/sunset, sea temp, and moon phase.
// These widgets will now display their default HTML content or "Data not available".

// --- Event Listeners and Initial Calls ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial call for local time (already handled by setInterval, but good for immediate display)
    updateLocalTime();

    // Call water particles creation if home content is visible on initial load
    // This handles cases where the script loads after the 'visible' class is applied by main.js
    if (homeContent && homeContent.classList.contains('visible')) {
        createWaterParticles();
    }
});

// Re-create water particles on window resize to adjust to new dimensions
window.addEventListener('resize', () => {
    // Only re-create if home content is currently visible
    if (homeContent && homeContent.classList.contains('visible')) {
        createWaterParticles();
    }
});

// Ensure water particles are created if home content becomes visible after initial load (e.g., returning from a section)
// This is handled by the navigation logic, but adding a fallback for robustness.
// No separate window.onload here as main.js uses it.
