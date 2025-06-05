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

// פונקציה להסתרת הטוען
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
    console.log('הטוען הוסתר בהצלחה');
  } else {
    console.warn('לא נמצא אלמנט טוען להסתרה');
  }
}

// אתחול המערכת
async function initAdmin() {
  console.log('מאתחל את פאנל הניהול...');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  try {
    // 1. הצגת טוען
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
      console.log('הטעינה החלה, מציג טען...');
    }
    
    // 2. אתחול מודול ההרשאות
    console.log('מתחיל אימות...');
    const isAuthenticated = await initAuth();
    
    if (!isAuthenticated) {
      console.log('הפניה לדף ההתחברות...');
      return; // נצא מהפונקציה, הטעינה תטופל על ידי ההפניה
    }
    
    console.log('אימות הושלם בהצלחה');
    
    // 3. אתחול ממשק המשתמש
    console.log('מאתחל ממשק משתמש...');
    initUI();
    
    // 4. טעינת נתונים ראשוניים
    console.log('טוען נתונים ראשוניים...');
    await loadInitialData();
    
    // 5. אתחול שאר המודולים
    console.log('מאתחל מודולים נוספים...');
    initProperties();
    initAgents();
    initImages();
    initDashboard();
    
    console.log('פאנל הניהול אותחל בהצלחה!');
    
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
    throw error; // זרוק את השגיאה כדי שהפונקציה הקוראת תדע על הכישלון
  } finally {
    // הסתרת הטוען בכל מקרה - גם בהצלחה וגם בשגיאה
    hideLoadingIndicator();
  }
}

// פונקציה להצגת הודעת שגיאה
function showError(message, error = null) {
  console.error('שגיאה:', message, error);
  
  // הסתרת הטוען אם קיים
  hideLoadingIndicator();
  
  // הסרת הודעות שגיאה קודמות
  const existingError = document.querySelector('.admin-error');
  if (existingError) {
    existingError.remove();
  }
  
  // יצירת הודעת שגיאה חדשה
  const errorContainer = document.createElement('div');
  errorContainer.className = 'admin-error';
  errorContainer.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>${message || 'אירעה שגיאה'}</h3>
      <p>${error?.message || 'נא לרענן את הדף או ליצור קשר עם התמיכה'}</p>
      <button onclick="window.location.reload()" class="btn btn-primary">רענן דף</button>
    </div>
  `;
  
  document.body.appendChild(errorContainer);
}

// טיפול בשגיאות לא צפויות
window.addEventListener('error', function(event) {
  showError('אירעה שגיאה לא צפויה', event.error);
  return false; // מונע את ברירת המחדל של הדפדפן
});

// טיפול בהבטחות שלא טופלו
window.addEventListener('unhandledrejection', function(event) {
  showError('שגיאה בטעינת נתונים', event.reason);
  event.preventDefault();
});

// הפעלת האתחול כאשר הדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAdmin().catch(error => {
      console.error('שגיאה באתחול האפליקציה:', error);
    });
  });
} else {
  // אם הדף כבר נטען, נקרא ישירות
  initAdmin().catch(error => {
    console.error('שגיאה באתחול האפליקציה:', error);
  });
}

// ייצוא משתנים ופונקציות לשימוש במודולים אחרים
export { propertiesData, agentsData, getCookie, initAdmin };

// Debug: Log that the module was loaded
console.log('admin-main.js module loaded successfully');
