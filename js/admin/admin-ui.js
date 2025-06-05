// ניהול ממשק משתמש וניווט
import { loadDashboardData } from './admin-dashboard.js';
import { loadProperties } from './admin-properties.js';
import { loadAgents } from './admin-agents.js';
import { setupPropertyForm } from './admin-properties.js';

// פונקציה לאתחול התפריט והלשוניות
function initTabsMenu() {
    console.log('אתחול תפריט ולשוניות');
    
    const menuItems = document.querySelectorAll('.admin-menu li');
    const adminSections = document.querySelectorAll('.admin-section');
    const adminTitle = document.querySelector('.admin-title h1');
    
    if (!menuItems.length || !adminSections.length || !adminTitle) {
        console.error('חסרים אלמנטים חיוניים בממשק');
        return;
    }
    
    // הוספת מאזיני אירועים לפריטי התפריט
    menuItems.forEach(item => {
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            if (!sectionId) {
                console.error('חסר מאפיין data-section בפריט התפריט');
                return;
            }
            
            // עדכון התפריט
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // עדכון האזורים
            adminSections.forEach(section => section.classList.remove('active'));
            const currentSection = document.getElementById(sectionId + '-section');
            
            if (currentSection) {
                currentSection.classList.add('active');
                
                // עדכון כותרת וטעינת נתונים
                switch(sectionId) {
                    case 'dashboard':
                        adminTitle.textContent = 'לוח בקרה';
                        loadDashboardData();
                        break;
                    case 'properties':
                        adminTitle.textContent = 'ניהול נכסים';
                        loadProperties();
                        break;
                    case 'agents':
                        adminTitle.textContent = 'ניהול סוכנים';
                        loadAgents();
                        break;
                    case 'add-property':
                        adminTitle.textContent = 'הוספת נכס';
                        setupPropertyForm();
                        break;
                    default:
                        adminTitle.textContent = 'פאנל ניהול';
                }
            }
        });
    });
    
    // טעינת לשונית לפי פרמטר בכתובת
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    const targetMenuItem = section 
        ? document.querySelector(`[data-section="${section}"]`)
        : document.querySelector('[data-section="dashboard"]');
        
    if (targetMenuItem) {
        targetMenuItem.click();
    }
}

// פונקציה לאתחול ממשק המשתמש
export async function initUI() {
    console.log('אתחול ממשק משתמש');
    
    try {
        initTabsMenu();
        console.log('ממשק המשתמש אותחל בהצלחה');
    } catch (error) {
        console.error('שגיאה באתחול ממשק המשתמש:', error);
        throw error;
    }
} 