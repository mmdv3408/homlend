// קובץ ראשי לאתחול מערכת הניהול
import { initAuth } from './admin-auth.js';
import { initUI } from './admin-ui.js';
import { initProperties } from './admin-properties.js';
import { initAgents } from './admin-agents.js';
import { initImages } from './admin-images.js';
import { initDashboard } from './admin-dashboard.js';

// משתנים גלובליים
let propertiesData = [];
let agentsData = [];

// פונקציה להצגת שגיאה למשתמש
function showAdminError(title, message) {
    const errorContainer = document.getElementById('admin-error-container');
    if (!errorContainer) {
        // אם אין מיכל שגיאה, ניצור אותו
        const div = document.createElement('div');
        div.id = 'admin-error-container';
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.maxWidth = '350px';
        div.style.backgroundColor = '#fff';
        div.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        div.style.borderRight = '4px solid #e74c3c';
        div.style.padding = '15px';
        div.style.zIndex = '9999';
        div.style.borderRadius = '3px';
        div.style.direction = 'rtl';
        document.body.appendChild(div);
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'admin-error';
    errorDiv.style.marginBottom = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderBottom = '1px solid #eee';
    
    errorDiv.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px; color:#e74c3c;">${title}</div>
        <div style="font-size:0.9em; color:#555;">${message}</div>
        <button class="error-dismiss-btn" style="margin-top:8px; padding:5px 10px; background:#f1f1f1; border:none; cursor:pointer; border-radius:3px;">
            סגור
        </button>
    `;
    
    document.getElementById('admin-error-container').appendChild(errorDiv);
    
    errorDiv.querySelector('.error-dismiss-btn').addEventListener('click', () => {
        errorDiv.remove();
        if (document.getElementById('admin-error-container').children.length === 0) {
            document.getElementById('admin-error-container').remove();
        }
    });
}

// פונקציה לאתחול המערכת
async function initAdmin() {
    console.log('אתחול מערכת הניהול');
    
    // רשימת מודולים לטעינה
    const modules = [
        { name: 'אימות משתמש', function: initAuth },
        { name: 'ממשק משתמש', function: initUI },
        { name: 'ניהול נכסים', function: initProperties },
        { name: 'ניהול סוכנים', function: initAgents },
        { name: 'ניהול תמונות', function: initImages },
        { name: 'לוח בקרה', function: initDashboard }
    ];
    
    let hasErrors = false;
    
    // נטען כל מודול בנפרד
    for (const module of modules) {
        try {
            console.log(`טוען מודול ${module.name}...`);
            await module.function();
            console.log(`מודול ${module.name} נטען בהצלחה`);
        } catch (error) {
            console.error(`שגיאה בטעינת מודול ${module.name}:`, error);
            showAdminError(`שגיאה בטעינת מודול ${module.name}`, error.message || 'אירעה שגיאה לא ידועה');
            hasErrors = true;
        }
    }
    
    // הסרת מסך הטעינה בכל מקרה
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (hasErrors) {
        console.warn('מערכת הניהול אותחלה עם שגיאות');
    } else {
        console.log('מערכת הניהול אותחלה בהצלחה');
    }
}

// אתחול המערכת כשהדף נטען
document.addEventListener('DOMContentLoaded', initAdmin);

export { propertiesData, agentsData, initAdmin }; 