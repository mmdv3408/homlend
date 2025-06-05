// קובץ ראשי לאתחול מערכת הניהול
import { initAuth } from './admin-auth.js';
import { initUI } from './admin-ui.js';
import { initProperties } from './admin-properties.js';
// import { initAgents } from './admin-agents.js'; // הוסר כי אין פונקציה כזו
import { initImages } from './admin-images.js';
import { initDashboard } from './admin-dashboard.js';

// משתנים גלובליים
export let propertiesData = [];
export let agentsData = [];

// פונקציה לאתחול המערכת
async function initAdmin() {
    console.log('אתחול מערכת הניהול');
    
    try {
        // אתחול מערכות המשנה
        await initAuth();
        await initUI();
        await initProperties();
        // await initAgents(); // הוסר כי אין פונקציה כזו
        await initImages();
        await initDashboard();
        
        // הסרת מסך הטעינה
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        console.log('מערכת הניהול אותחלה בהצלחה');
    } catch (error) {
        console.error('שגיאה באתחול מערכת הניהול:', error);
        alert('אירעה שגיאה באתחול מערכת הניהול. אנא רענן את הדף.');
    }
}

// אתחול המערכת כשהדף נטען
document.addEventListener('DOMContentLoaded', initAdmin);

export { propertiesData, agentsData, initAdmin }; 