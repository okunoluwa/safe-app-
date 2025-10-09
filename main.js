// Import all modules
import { initSOS } from './sos.js';
import { initReports } from './reports.js';
import { initLocation } from './location.js';
import { initFeed } from './feed.js';
import { loadRecentActivity } from './storage.js';

// Global variables
let currentSection = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSOS();
    initReports();
    initLocation();
    initFeed();
    loadRecentActivity();
    initMobileMenu();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });

    // Make showSection globally available
    window.showSection = function(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show the selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionId;

            // Add active class to corresponding nav link
            const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Close mobile menu if open
            const nav = document.querySelector('.nav');
            if (nav) {
                nav.classList.remove('active');
            }

            // Update page title
            updatePageTitle(sectionId);

            // Trigger section-specific initialization
            if (sectionId === 'feed') {
                initFeed();
            } else if (sectionId === 'dashboard') {
                loadRecentActivity();
            }
        }
    };
}

// Mobile menu functionality
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove('active');
            }
        });
    }
}

// Update page title based on current section
function updatePageTitle(sectionId) {
    const titles = {
        dashboard: 'Community Alert - Safety Dashboard',
        sos: 'Community Alert - Emergency SOS',
        reports: 'Community Alert - Report Activity',
        location: 'Community Alert - Share Location',
        feed: 'Community Alert - Community Feed'
    };

    document.title = titles[sectionId] || 'Community Alert - Safety & Security';
}

// Notification system
export function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    const closeButton = notification.querySelector('.notification-close');

    messageElement.textContent = message;
    
    // Remove existing type classes
    notification.classList.remove('success', 'error', 'warning');
    notification.classList.add(type);

    // Show notification
    notification.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);

    // Close button functionality
    closeButton.onclick = () => {
        notification.classList.remove('show');
    };
}

// Utility functions
export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatTime(date) {
    return new Date(date).toLocaleString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Geolocation utility
export function getCurrentLocationCoords() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            error => {
                let message;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                    default:
                        message = 'An unknown error occurred';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Format coordinates for display
export function formatCoordinates(latitude, longitude) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    } else {
        return `${distance.toFixed(1)}km`;
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Service worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker would be registered here in a real application
        console.log('Service worker support detected');
    });
}