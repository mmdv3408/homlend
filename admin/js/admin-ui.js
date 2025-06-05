// ניהול ממשק משתמש
import { loadProperties } from './admin-properties.js';
import { loadAgents } from './admin-agents.js';
import { loadDashboardData } from './admin-dashboard.js';

// אתחול ממשק המשתמש
function initUI() {
  console.log('אתחול ממשק משתמש');

  try {
    // אתחול תפריט הלשוניות
    initTabsMenu();

    // אתחול אירועים נוספים
    setupEventListeners();
  } catch (error) {
    console.error('שגיאה באתחול ממשק המשתמש:', error);
  }
}

// אתחול תפריט הלשוניות
function initTabsMenu() {
  console.log('מאתחל את התפריט והלשוניות');

  const menuContainer = document.querySelector('.admin-menu');
  if (!menuContainer) {
    console.error('אין אלמנט תפריט (.admin-menu) בעמוד');
    return;
  }

  // יצירת אירוע יחיד על ה-container במקום על כל פריט
  menuContainer.addEventListener('click', function(event) {
    const menuItem = event.target.closest('li');
    if (!menuItem) return;

    const sectionId = menuItem.getAttribute('data-section');
    if (!sectionId) {
      console.error('חסר מאפיין data-section בפריט התפריט');
      return;
    }

    // עדכון הלשונית הפעילה
    document.querySelectorAll('.admin-menu li').forEach(i => i.classList.remove('active'));
    menuItem.classList.add('active');
    
    // עדכון ה-URL ללא ריענון הדף
    const url = new URL(window.location);
    url.searchParams.set('section', sectionId);
    window.history.pushState({}, '', url);

    // טעינת התוכן המתאים
    loadSectionContent(sectionId);
  });

  // טעינת הלשונית הראשונית
  const urlParams = new URLSearchParams(window.location.search);
  const initialSection = urlParams.get('section') || 'dashboard';
  
  // הפעלת הלשונית הראשונית
  const initialTab = document.querySelector(`[data-section="${initialSection}"]`);
  if (initialTab) {
    initialTab.click();
  } else {
    const defaultTab = document.querySelector('[data-section="dashboard"]');
    if (defaultTab) defaultTab.click();
  }

  // פונקציה לטעינת תוכן הסקציה
  async function loadSectionContent(sectionId) {
    const adminSections = document.querySelectorAll('.admin-section');
    const currentSection = document.getElementById(`${sectionId}-section`);
    
    if (!currentSection) {
      console.error(`לא נמצא אזור עם ID: ${sectionId}-section`);
      return;
    }

    // הסתרת כל האזורים והצגת האזור הנבחר
    adminSections.forEach(section => section.classList.remove('active'));
    currentSection.classList.add('active');

    // עדכון כותרת הדף
    updateSectionContent(sectionId);
  }
}

// עדכון תוכן האזור הנבחר
function updateSectionContent(sectionId) {
  const adminTitle = document.querySelector('.admin-title h1');
  if (!adminTitle) {
    console.error('לא נמצאה כותרת הדף');
    return;
  }

  try {
    switch (sectionId) {
      case 'dashboard':
        adminTitle.textContent = 'לוח בקרה';
        loadDashboardData().catch(err => console.error('שגיאה בטעינת לוח הבקרה:', err));
        break;
      case 'properties':
        adminTitle.textContent = 'ניהול נכסים';
        loadProperties().catch(err => console.error('שגיאה בטעינת הנכסים:', err));
        break;
      case 'agents':
        adminTitle.textContent = 'ניהול סוכנים';
        loadAgents().catch(err => console.error('שגיאה בטעינת הסוכנים:', err));
        break;
      case 'add-property':
        adminTitle.textContent = 'הוספת נכס';
        break;
      case 'add-agent':
        adminTitle.textContent = 'הוספת סוכן';
        break;
      default:
        console.warn('סקציה לא מזוהה, מעבר ללוח הבקרה');
        adminTitle.textContent = 'לוח בקרה';
        loadDashboardData().catch(err => console.error('שגיאה בטעינת לוח הבקרה:', err));
    }
  } catch (error) {
    console.error('שגיאה בעדכון תוכן האזור:', error);
    // ניסיון לטעון מחדש את לוח הבקרה במקרה של שגיאה
    adminTitle.textContent = 'לוח בקרה';
    loadDashboardData().catch(err => console.error('שגיאה בטעינת לוח הבקרה:', err));
  }
}

// הגדרת מאזיני אירועים נוספים
function setupEventListeners() {
  // ניתן להוסיף כאן מאזיני אירועים גלובליים נוספים
}

// ייצוא הפונקציות הנדרשות
export { initUI };
