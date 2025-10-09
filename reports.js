import { showNotification, formatDateTime, generateId, getCurrentLocationCoords } from './main.js';
import { saveToStorage, getFromStorage } from './storage.js';

export function initReports() {
    const reportForm = document.getElementById('reportForm');
    
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmission);
    }
    
    // Set default time to current time
    const reportTimeInput = document.getElementById('reportTime');
    if (reportTimeInput) {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        reportTimeInput.value = localDateTime;
    }

    // Make getCurrentLocation globally available
    window.getCurrentLocation = getCurrentLocation;
}

async function getCurrentLocation(type) {
    try {
        const coords = await getCurrentLocationCoords();
        
        if (type === 'report') {
            const locationInput = document.getElementById('reportLocation');
            if (locationInput) {
                locationInput.value = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                showNotification('Current location added to report', 'success');
            }
        }
    } catch (error) {
        showNotification(`Location error: ${error.message}`, 'error');
    }
}

async function handleReportSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
        id: generateId(),
        type: 'report',
        activityType: formData.get('reportType') || document.getElementById('reportType').value,
        location: formData.get('reportLocation') || document.getElementById('reportLocation').value,
        time: formData.get('reportTime') || document.getElementById('reportTime').value,
        description: formData.get('reportDescription') || document.getElementById('reportDescription').value,
        anonymous: document.getElementById('reportAnonymous').checked,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    };

    // Validate required fields
    if (!reportData.activityType || !reportData.location || !reportData.time || !reportData.description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        // Save to storage
        const reports = getFromStorage('reports') || [];
        reports.unshift(reportData);
        saveToStorage('reports', reports);

        // Also save to main alerts feed
        const alerts = getFromStorage('alerts') || [];
        alerts.unshift(reportData);
        saveToStorage('alerts', alerts);

        // Show success message
        showNotification('Suspicious activity report submitted successfully!', 'success');
        
        // Reset form
        e.target.reset();
        
        // Reset time to current time
        const reportTimeInput = document.getElementById('reportTime');
        if (reportTimeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            reportTimeInput.value = localDateTime;
        }

        // Simulate report processing
        setTimeout(() => {
            simulateReportProcessing(reportData);
        }, 2000);

    } catch (error) {
        console.error('Error submitting report:', error);
        showNotification('Failed to submit report. Please try again.', 'error');
    }
}

function simulateReportProcessing(reportData) {
    console.log('📋 New suspicious activity report processed:');
    console.log(`Report ID: ${reportData.id}`);
    console.log(`Type: ${reportData.activityType}`);
    console.log(`Location: ${reportData.location}`);
    console.log(`Time: ${formatDateTime(reportData.time)}`);
    console.log(`Description: ${reportData.description}`);
    console.log(`Anonymous: ${reportData.anonymous ? 'Yes' : 'No'}`);
    console.log(`Submitted: ${formatDateTime(reportData.timestamp)}`);
    console.log('---');
    console.log('Report has been forwarded to local neighborhood watch and relevant authorities.');

    // Update report status
    const reports = getFromStorage('reports') || [];
    const reportIndex = reports.findIndex(r => r.id === reportData.id);
    
    if (reportIndex !== -1) {
        reports[reportIndex].status = 'processed';
        reports[reportIndex].processedAt = new Date().toISOString();
        saveToStorage('reports', reports);
    }
}

// Get activity type display name
export function getActivityTypeDisplay(type) {
    const types = {
        'suspicious-person': 'Suspicious Person',
        'suspicious-vehicle': 'Suspicious Vehicle',
        'noise-disturbance': 'Noise Disturbance',
        'trespassing': 'Trespassing',
        'vandalism': 'Vandalism',
        'other': 'Other'
    };
    
    return types[type] || type;
}

// Get all reports
export function getAllReports() {
    return getFromStorage('reports') || [];
}

// Get reports by type
export function getReportsByType(type) {
    const reports = getAllReports();
    return reports.filter(report => report.activityType === type);
}

// Get recent reports (last 7 days)
export function getRecentReports() {
    const reports = getAllReports();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return reports.filter(report => 
        new Date(report.timestamp) >= weekAgo
    );
}