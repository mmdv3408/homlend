/**
 * Homeland Real Estate - Admin Panel
 * Main entry point for the admin panel
 */

// Import styles
import '../css/admin.css';

// Import modules
import { initAdmin } from './modules/admin.js';

// Initialize the admin panel
initAdmin().catch(error => {
    console.error('Failed to initialize admin panel:', error);
    
    // Show error message to user
    const errorContainer = document.createElement('div');
    errorContainer.className = 'global-error';
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '0';
    errorContainer.style.left = '0';
    errorContainer.style.right = '0';
    errorContainer.style.padding = '15px';
    errorContainer.style.backgroundColor = '#f8d7da';
    errorContainer.style.color = '#721c24';
    errorContainer.style.borderBottom = '1px solid #f5c6cb';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.textAlign = 'center';
    errorContainer.textContent = `שגיאה בהפעלת לוח הבקרה: ${error.message || 'אירעה שגיאה בלתי צפויה'}`;
    
    document.body.prepend(errorContainer);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-admin.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}
