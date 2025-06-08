/**
 * admin-main.js
 * מודול ראשי למערכת הניהול מפצל לפי תחומי אחריות
 */

// ייבוא פונקציות ממודול האימות תחילה - חשוב לבדיקת ההרשאות
import { checkAuth, logout, initAuth } from './admin-auth.js';
import { getCookie, showError, showSuccess, formatPrice, formatDate } from './admin-utils.js';

// בדיקת הרשאות ישירה מיד בתחילת הקובץ
checkAuth().then(isAuthenticated => {
    if (isAuthenticated) {
        // רק אם המשתמש מאומת, ממשיכים לטעון את המודולים
        loadModules();
        
        // אתחול המערכת
        document.addEventListener('DOMContentLoaded', () => {
            console.log('הדף נטען בהצלחה, המשתמש מאומת');
            initAdmin();
        });
    } else {
        // אם המשתמש לא מאומת, בדרך כלל הוא יופנה אוטומטית לדף לוגין
        console.error('משתמש לא מאומת!');
    }
}).catch(err => {
    console.error('שגיאה בבדיקת הרשאות:', err);
});

// פונקציה לטעינת מודולים נוספים לאחר אימות
async function loadModules() {
    console.log('מתחיל טעינת מודולים...');
    
    try {
        // טעינת דשבורד
        const dashboardModule = await import('./admin-dashboard.js');
        window.loadDashboardData = dashboardModule.loadDashboardData;
        console.log('נטען מודול הדשבורד');
        
        // טעינת נכסים
        const propertiesModule = await import('./admin-properties.js');
        window.loadProperties = propertiesModule.loadProperties;
        window.setupPropertyForm = propertiesModule.setupPropertyForm;
        window.addPropertyEventListeners = propertiesModule.addPropertyEventListeners;
        console.log('נטען מודול הנכסים');
        
        // טעינת סוכנים
        const agentsModule = await import('./admin-agents.js');
        window.loadAgents = agentsModule.loadAgents;
        window.addAgentEventListeners = agentsModule.addAgentEventListeners;
        console.log('נטען מודול הסוכנים');
        
        // טעינת תמונות
        const imagesModule = await import('./admin-images.js');
        window.setupImageUploadPreview = imagesModule.setupImageUploadPreview;
        console.log('נטען מודול התמונות');
        
        console.log('כל המודולים נטענו בהצלחה!');
        
        // רק לאחר שכל המודולים נטענו, ניתן לאתחל את הממשק
        return true;
    } catch (error) {
        console.error('שגיאה בטעינת המודולים:', error);
        return false;
    }
}

// משתנה גלובלי למעקב אחר המקטע הנוכחי
let currentSection = null;

// פונקציה לאתחול מערכת הניהול
async function initAdmin() {
    console.log('מאתחל מערכת ניהול');
    
    try {
        // בדיקת הרשאות משתמש
        const isAuthenticated = await initAuth();
        
        if (isAuthenticated) {
            console.log('משתמש מאומת, טוען מודולים...');
            
            // טעינת כל המודולים הדרושים
            const modulesLoaded = await loadModules();
            
            if (modulesLoaded) {
                console.log('המודולים נטענו, מאתחל ממשק...');
                
                // אתחול הטפסים וההגדרות
                setupForms();
                
                // אתחול אירועים כלליים
                setupEvents();
                
                // אתחול הניווט בין מקטעים
                initSectionNav();
                
                // הגדרת דשבורד כמקטע ברירת מחדל
                const dashboardItem = document.querySelector('.admin-menu li[data-section="dashboard"]');
                if (dashboardItem) {
                    dashboardItem.classList.add('active');
                }
                
                // טעינת מקטע ראשוני (לוח בקרה)
                showSection('dashboard');
            } else {
                showError('לא ניתן היה לטעון את כל המודולים הדרושים');
            }
        }
    } catch (error) {
        console.error('שגיאה באתחול מערכת הניהול:', error);
    }
}

// פונקציה לאתחול ניווט בין מקטעים
function initSectionNav() {
    console.log('מאתחל מערכת ניווט בין מקטעים...');
    
    // הסלקטור הנכון הוא עבור פריטי התפריט שהם אלמנטי li בתוך .admin-menu
    document.querySelectorAll('.admin-menu li').forEach(item => {
        console.log('נמצא פריט תפריט:', item.getAttribute('data-section'));
        
        item.addEventListener('click', function(e) {
            console.log('נלחץ פריט תפריט:', this.getAttribute('data-section'));
            e.preventDefault();
            
            // מניעת לחיצות מיותרות אם כבר נמצאים במקטע
            if (this.classList.contains('active')) return;
            
            // הסרת המצב פעיל מכל פריטי התפריט
            document.querySelectorAll('.admin-menu li').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // הגדרת הפריט הנוכחי כפעיל
            this.classList.add('active');
            
            // הצגת המקטע המתאים
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            } else {
                console.error('לא נמצא מזהה מקטע עבור הפריט', this);
            }
        });
    });
    
    console.log('סיים אתחול מערכת ניווט');
}

// פונקציה להצגת מקטע לפי שם
function showSection(sectionName) {
    console.log(`מציג מקטע: ${sectionName}`);
    
    // מעקב אחר המקטע הנוכחי
    currentSection = sectionName;
    
    // בדיקה שהמקטע מוגדר ב-HTML
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (!targetSection) {
        console.error(`מקטע '${sectionName}' לא נמצא ב-HTML`);
        return;
    }
    
    // סימון הפריט המתאים בתפריט כפעיל
    document.querySelectorAll('.admin-menu li').forEach(item => {
        item.classList.remove('active');
        
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // הסתרת כל המקטעים
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // הצגת המקטע המבוקש
    targetSection.classList.add('active');
    
    // עדכון כותרת הדף
    updatePageTitle(sectionName);
    
    // נסה לטעון את הנתונים עבור המקטע הזה 
    setTimeout(() => {
        loadSectionData(sectionName);
    }, 100); // השהיה קטנה לווידוא שהמודולים נטענו
}

// פונקציה לעדכון כותרת הדף לפי מקטע
function updatePageTitle(sectionName) {
    const pageTitle = document.querySelector('.admin-title h1');
    if (!pageTitle) return;
    
    switch(sectionName) {
        case 'dashboard':
            pageTitle.textContent = 'לוח בקרה';
            break;
        case 'properties':
            pageTitle.textContent = 'ניהול נכסים';
            break;
        case 'add-property':
            pageTitle.textContent = 'הוספת נכס';
            break;
        case 'agents':
            pageTitle.textContent = 'ניהול סוכנים';
            break;
        case 'users':
            pageTitle.textContent = 'ניהול משתמשים';
            break;
        case 'settings':
            pageTitle.textContent = 'הגדרות מערכת';
            break;
        default:
            pageTitle.textContent = 'פאנל ניהול';
    }
}

// פונקציה לטעינת נתונים בהתאם למקטע הנוכחי
function loadSectionData(sectionName) {
    console.log(`טוען נתונים עבור מקטע: ${sectionName}`);
    
    // בדיקה שהפונקציות אכן קיימות לפני קריאה אליהן
    switch(sectionName) {
        case 'dashboard':
            if (typeof window.loadDashboardData === 'function') {
                window.loadDashboardData();
            } else {
                console.warn('פונקציית loadDashboardData אינה זמינה עדיין');
            }
            break;
        case 'properties':
            if (typeof window.loadProperties === 'function') {
                window.loadProperties();
            } else {
                console.warn('פונקציית loadProperties אינה זמינה עדיין');
            }
            break;
        case 'agents':
            if (typeof window.loadAgents === 'function') {
                window.loadAgents();
            } else {
                console.warn('פונקציית loadAgents אינה זמינה עדיין');
            }
            break;
        case 'add-property':
            if (typeof window.setupPropertyForm === 'function') {
                window.setupPropertyForm();
            }
            if (typeof window.setupImageUploadPreview === 'function') {
                window.setupImageUploadPreview();
            }
            break;
    }    
    // מקטעים נוספים אם יתווספו בעתיד
}

// פונקציה לאתחול הטפסים והגדרות
function setupForms() {
    // אתחול תצוגה מקדימה של תמונות
    setupImageUploadPreview();
    
    // הגדרת אירועים לטופס הוספת נכס
    // (אירוע ה-submit מטופל בתוך setupPropertyForm)
    
    // הגדרת אירועים אחרים אם צריך
}

// פונקציה לאתחול אירועים כלליים
function setupEvents() {
    // אירוע התנתקות
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // אירוע חיפוש (אם יש)
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = this.querySelector('input[name="search"]').value;
            performSearch(query);
        });
    }
    
    // חיבור כפתור חזרה ברשימת נכסים
    const backToPropertiesBtn = document.getElementById('backToPropertiesBtn');
    if (backToPropertiesBtn) {
        backToPropertiesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('properties');
        });
    }
    
    // מאזיני אירועים נוספים...
}

// פונקציה לביצוע חיפוש
function performSearch(query) {
    if (!query || query.trim() === '') return;
    
    console.log(`מחפש: ${query}`);
    
    // פה יש להוסיף לוגיקת חיפוש בהתאם למקטע הנוכחי
    switch(currentSection) {
        case 'properties':
            searchProperties(query);
            break;
        case 'agents':
            searchAgents(query);
            break;
        default:
            // חיפוש כללי אם צריך
    }
}

// פונקציה לחיפוש נכסים
function searchProperties(query) {
    // דוגמה ללוגיקת חיפוש פשוטה (יש להחליף בקריאת API בהמשך)
    const propertiesTableBody = document.getElementById('propertiesTableBody');
    if (!propertiesTableBody) return;
    
    // זמנית: סינון מקומי של הנתונים שכבר טעונים
    const filteredProperties = window.propertiesData.filter(property => 
        property.title.includes(query) || 
        property.address.includes(query) || 
        property.description.includes(query)
    );
    
    // עדכון הטבלה עם התוצאות
    // לוגיקה מותאמת לתצוגת תוצאות חיפוש...
}

// פונקציה לחיפוש סוכנים
function searchAgents(query) {
    // דוגמה ללוגיקת חיפוש פשוטה (יש להחליף בקריאת API בהמשך)
    const agentsTableBody = document.getElementById('agentsTableBody');
    if (!agentsTableBody) return;
    
    // זמנית: סינון מקומי של הנתונים שכבר טעונים
    const filteredAgents = window.agentsData.filter(agent => 
        agent.name.includes(query) || 
        agent.email.includes(query) || 
        agent.phone.includes(query)
    );
    
    // עדכון הטבלה עם התוצאות
    // לוגיקה מותאמת לתצוגת תוצאות חיפוש...
}

// אתחול מערכת הניהול כשהדף נטען
document.addEventListener('DOMContentLoaded', initAdmin);

// יצוא פונקציות עיקריות למקרה שיידרשו ממקום אחר
export {
    initAdmin,
    showSection,
    currentSection
};
