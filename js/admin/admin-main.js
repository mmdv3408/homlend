// קובץ ראשי של הפאנל הניהול - הום-לנד נכסים

// ייבוא מודולים
import { initAuth } from './admin-auth.js';
import { initUI } from './admin-ui.js';
import { initProperties } from './admin-properties.js';
import { initAgents } from './admin-agents.js';
import { initImages } from './admin-images.js';
import { initDashboard } from './admin-dashboard.js';

// משתנים גלובליים
export const propertiesData = [];
export const agentsData = [];

// פונקציות עזר
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

// פונקציה לטעינת נתונים ראשונית
async function loadInitialData() {
  try {
    console.log('טוען נתונים ראשוניים...');
    // ניתן להוסיף כאן טעינת נתונים ראשונית אם נדרש
  } catch (error) {
    console.error('שגיאה בטעינת נתונים ראשוניים:', error);
    throw error; // זריקת השגיאה כדי שהפונקציה הקוראת תדע על הכישלון
  }
}

// אתחול המערכת
async function initAdmin() {
  console.log('מאתחל את פאנל הניהול...');

  try {
    // 1. אתחול מודול ההרשאות
    await initAuth();
    
    // 2. אתחול ממשק המשתמש
    initUI();
    
    // 3. טעינת נתונים ראשוניים
    await loadInitialData();
    
    // 4. אתחול שאר המודולים
    initProperties();
    initAgents();
    initImages();
    initDashboard();
    
    console.log('פאנל הניהול אותחל בהצלחה!');

    // אתחול לוח הבקרה
    initDashboard();

    // טעינת נתונים ראשונית
    await loadInitialData();

    console.log('פאנל הניהול אותחל בהצלחה');
  } catch (error) {
    console.error('אירעה שגיאה באתחול הפאנל הניהולי:', error);

    // הצגת הודעת שגיאה למשתמש
    const errorContainer = document.createElement('div');
    errorContainer.className = 'admin-error';
    errorContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>אירעה שגיאה בטעינת הפאנל הניהולי</h3>
                <p>${error.message || 'נסה לרענן את הדף או ליצור קשר עם התמיכה'}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">רענן דף</button>
            </div>
        `;

    document.body.appendChild(errorContainer);
  }
}

// הפעלת האתחול כאשר הדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  // אם הדף כבר נטען, נקרא ישירות
  initAdmin();
}

// ייצוא משתנים ופונקציות לשימוש במודולים אחרים
export { propertiesData, agentsData, getCookie };
