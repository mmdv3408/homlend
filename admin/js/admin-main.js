/**
 * admin-main.js
 * מודול ראשי למערכת הניהול מפצל לפי תחומי אחריות
 */

// ייבוא פונקציות ממודולים אחרים
try {
    // כלים וכלי עזר
    import('./admin-utils.js')
        .then(utils => {
            window.showError = utils.showError;
            window.showSuccess = utils.showSuccess;
            window.getCookie = utils.getCookie;
            window.formatPrice = utils.formatPrice;
            window.formatDate = utils.formatDate;
            console.log('נטענו הפונקציות מ- admin-utils.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-utils:', err);
        });

    // כלי אימות
    import('./admin-auth.js')
        .then(auth => {
            window.checkAuth = auth.checkAuth;
            window.logout = auth.logout;
            window.initAuth = auth.initAuth;
            console.log('נטענו הפונקציות מ- admin-auth.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-auth:', err);
        });

    // דשבורד
    import('./admin-dashboard.js')
        .then(dashboard => {
            window.loadDashboardData = dashboard.loadDashboardData;
            console.log('נטענו הפונקציות מ- admin-dashboard.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-dashboard:', err);
        });

    // נכסים
    import('./admin-properties.js')
        .then(props => {
            window.loadProperties = props.loadProperties;
            window.setupPropertyForm = props.setupPropertyForm;
            window.addPropertyEventListeners = props.addPropertyEventListeners;
            console.log('נטענו הפונקציות מ- admin-properties.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-properties:', err);
        });

    // סוכנים
    import('./admin-agents.js')
        .then(agents => {
            window.loadAgents = agents.loadAgents;
            window.addAgentEventListeners = agents.addAgentEventListeners;
            console.log('נטענו הפונקציות מ- admin-agents.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-agents:', err);
        });

    // תמונות
    import('./admin-images.js')
        .then(images => {
            window.setupImageUploadPreview = images.setupImageUploadPreview;
            console.log('נטענו הפונקציות מ- admin-images.js');
        })
        .catch(err => {
            console.error('שגיאה בטעינת מודול admin-images:', err);
        });

} catch (err) {
    console.error('שגיאה כללית בטעינת המודולים:', err);
}

// משתנה גלובלי למעקב אחר המקטע הנוכחי
let currentSection = null;

// פונקציה לאתחול מערכת הניהול
function initAdmin() {
    console.log('%cמאתחל מערכת ניהול', 'color: blue; font-weight: bold');
    
    // מוסיף listener לאירוע טעינת הדף
    document.addEventListener('DOMContentLoaded', () => {
        console.log('הדף נטען בשלמותו, מתחיל בדיקת אימות');
    
        try {
            // בדיקת הרשאות משתמש
            checkAuth()
                .then(isAuthenticated => {
                    console.log(`%cתוצאת אימות: ${isAuthenticated ? 'משתמש מאומת' : 'משתמש לא מאומת'}`, 'color: green; font-weight: bold');
                    
                    if (isAuthenticated) {
                        // אתחול הניווט בין מקטעים
                        initSectionNav();
                        
                        // טעינת מקטע ראשוני (לוח בקרה)
                        showSection('dashboard');
                        
                        // אתחול הטפסים וההגדרות
                        setupForms();
                        
                        // אתחול אירועים כלליים
                        setupEvents();
                    } else {
                        console.warn('משתמש לא מאומת, מפנה לדף התחברות');
                        window.location.href = 'login.html';
                    }
                })
                .catch(error => {
                    console.error('%cשגיאה באימות:', 'color: red; font-weight: bold', error);
                    // במקרה של שגיאה, מפנה לדף ההתחברות
                    window.location.href = 'login.html?error_source=admin';
                });
        } catch (error) {
            console.error('%cשגיאה באתחול מערכת הניהול:', 'color: red; font-weight: bold', error);
            window.location.href = 'login.html?error_source=init';
        }
    });
}

// פונקציה לאתחול ניווט בין מקטעים
function initSectionNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // מניעת לחיצות מיותרות אם כבר נמצאים במקטע
            if (this.classList.contains('active')) return;
            
            // הסרת המצב פעיל מכל פריטי התפריט
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // הגדרת הפריט הנוכחי כפעיל
            this.classList.add('active');
            
            // הצגת המקטע המתאים
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
    
    // הפעלת החלק הראשון בטעינה ראשונית
    const firstLink = document.querySelector('.nav-item');
    if (firstLink) {
        firstLink.classList.add('active');
    }
}

// פונקציה להצגת מקטע לפי שם
function showSection(sectionName) {
    console.log(`מציג מקטע: ${sectionName}`);
    
    // מעקב אחר המקטע הנוכחי
    currentSection = sectionName;
    
    // הסתרת כל המקטעים
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // הצגת המקטע המבוקש
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // עדכון כותרת הדף
        updatePageTitle(sectionName);
        
        // טעינת נתונים בהתאם למקטע
        loadSectionData(sectionName);
    }
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
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'properties':
            loadProperties();
            break;
        case 'add-property':
            setupPropertyForm();
            break;
        case 'agents':
            loadAgents();
            break;
        // מקטעים נוספים אם יתווספו בעתיד
    }
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
