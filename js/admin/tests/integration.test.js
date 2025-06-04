/**
 * בדיקות אינטגרציה עבור פאנל הניהול
 * קובץ זה בודק את האינטראקציה בין המודולים השונים
 */

// ייבוא המודולים לבדיקה
import { expect } from 'chai';
import * as auth from '../admin-auth.js';
import * as ui from '../admin-ui.js';
import * as properties from '../admin-properties.js';
import * as agents from '../admin-agents.js';
import * as images from '../admin-images.js';
import * as dashboard from '../admin-dashboard.js';
import CONFIG from '../config.js';

// בדיקות לאימות טעינת המודולים
describe('טעינת מודולים', () => {
  it('אמור לטעון את מודול האימות', () => {
    expect(auth).to.be.an('object');
    expect(auth.initAuth).to.be.a('function');
  });

  it('אמור לטעון את מודול ממשק המשתמש', () => {
    expect(ui).to.be.an('object');
    expect(ui.initUI).to.be.a('function');
  });

  it('אמור לטעון את מודול הנכסים', () => {
    expect(properties).to.be.an('object');
    expect(properties.initProperties).to.be.a('function');
  });

  it('אמור לטעון את מודול הסוכנים', () => {
    expect(agents).to.be.an('object');
    expect(agents.initAgents).to.be.a('function');
  });

  it('אמור לטעון את מודול התמונות', () => {
    expect(images).to.be.an('object');
    expect(images.initImages).to.be.a('function');
  });

  it('אמור לטעון את מודול לוח הבקרה', () => {
    expect(dashboard).to.be.an('object');
    expect(dashboard.initDashboard).to.be.a('function');
  });
});

// בדיקות לאימות הקונפיגורציה
describe('אימות קונפיגורציה', () => {
  it('אמור להכיל את כתובת ה-API הבסיסית', () => {
    expect(CONFIG.API.BASE_URL).to.equal('/api');
  });

  it('אמור להכיל את נקודות הקצה הנכונות', () => {
    expect(CONFIG.API.ENDPOINTS.PROPERTIES).to.equal('/properties');
    expect(CONFIG.API.ENDPOINTS.AGENTS).to.equal('/agents');
  });

  it('אמור להכיל את הגדרות ברירת המחדל', () => {
    expect(CONFIG.DEFAULTS.ITEMS_PER_PAGE).to.be.a('number');
    expect(CONFIG.DEFAULTS.PROPERTY_IMAGE).to.be.a('string');
  });
});

// בדיקות אינטגרציה בסיסיות
describe('אינטגרציה בסיסית', () => {
  before(() => {
    // אתחול ראשוני לבדיקות
    document.body.innerHTML = `
            <div id="admin-panel">
                <div class="admin-sidebar"></div>
                <div class="admin-content">
                    <div id="dashboard-section" class="admin-section"></div>
                    <div id="properties-section" class="admin-section"></div>
                    <div id="agents-section" class="admin-section"></div>
                </div>
            </div>
        `;
  });

  it('אמור לאתחל את כל המודולים ללא שגיאות', () => {
    // בדיקת אתחול בסיסי ללא שגיאות
    expect(() => {
      auth.initAuth();
      ui.initUI();
      properties.initProperties();
      agents.initAgents();
      images.initImages();
      dashboard.initDashboard();
    }).to.not.throw();
  });

  it('אמור להכיל את כל הפונקציות הנדרשות במודול האימות', () => {
    expect(auth).to.respondTo('checkAuth');
    expect(auth).to.respondTo('login');
    expect(auth).to.respondTo('logout');
  });

  it('אמור להכיל את כל הפונקציות הנדרשות במודול הנכסים', () => {
    expect(properties).to.respondTo('loadProperties');
    expect(properties).to.respondTo('saveProperty');
    expect(properties).to.respondTo('deleteProperty');
  });
});

// בדיקות לדוגמה למודול הנכסים
describe('מודול הנכסים', () => {
  it('אמור לטפל בשגיאות בטעינת נכסים', async () => {
    // שמירת הפונקציה המקורית
    const originalFetch = window.fetch;

    // החלפת פונקציית fetch בגרסה מדומה
    window.fetch = () => Promise.reject(new Error('שגיאת רשת'));

    // בדיקת טיפול בשגיאה
    try {
      await properties.loadProperties();
    } catch (error) {
      expect(error.message).to.equal('שגיאת רשת');
    }

    // שחזור הפונקציה המקורית
    window.fetch = originalFetch;
  });
});

// בדיקות לדוגמה למודול הסוכנים
describe('מודול הסוכנים', () => {
  it('אמור לאמת את פורמט האימייל של סוכן', () => {
    const validEmail = 'agent@example.com';
    const invalidEmail = 'invalid-email';

    // בדיקת אימות אימייל תקין
    expect(agents.validateAgentEmail(validEmail)).to.be.true;

    // בדיקת אימות אימייל לא תקין
    expect(agents.validateAgentEmail(invalidEmail)).to.be.false;
  });
});

// בדיקות לדוגמה למודול התמונות
describe('מודול התמונות', () => {
  it('אמור לאמת את סוג הקובץ', () => {
    const validFile = { type: 'image/jpeg' };
    const invalidFile = { type: 'application/pdf' };

    // בדיקת אימות קובץ תמונה תקין
    expect(images.isValidImageType(validFile)).to.be.true;

    // בדיקת אימות קובץ לא תקין
    expect(images.isValidImageType(invalidFile)).to.be.false;
  });
});

// בדיקות לדוגמה למודול לוח הבקרה
describe('מודול לוח הבקרה', () => {
  it('אמור לטפל בטעינת נתוני לוח בקרה', async () => {
    // נתוני דמה לתגובת השרת
    const mockData = {
      properties: { total: 10, active: 8, pending: 2, sold: 5 },
      agents: { total: 5, active: 4, admins: 2 },
      recentActivity: [],
      featuredProperties: [],
    };

    // החלפת פונקציית fetch בגרסה מדומה
    const originalFetch = window.fetch;
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

    // בדיקת טעינת נתונים
    const data = await dashboard.loadDashboardData();
    expect(data).to.deep.equal(mockData);

    // שחזור הפונקציה המקורית
    window.fetch = originalFetch;
  });
});

// בדיקות לדוגמה למודול ממשק המשתמש
describe('מודול ממשק המשתמש', () => {
  it('אמור לעדכן את כותרת הדף', () => {
    const title = 'דף בדיקה';
    ui.updatePageTitle(title);

    // בדיקת עדכון כותרת הדף
    expect(document.title).to.include(title);
  });

  it('אמור להחליף בין סקציות', () => {
    // בדיקת החלפת סקציות
    ui.showSection('properties-section');
    const propertiesSection = document.getElementById('properties-section');
    expect(propertiesSection.classList.contains('active')).to.be.true;

    // בדיקה שהסקציות האחרות לא פעילות
    const dashboardSection = document.getElementById('dashboard-section');
    const agentsSection = document.getElementById('agents-section');
    expect(dashboardSection.classList.contains('active')).to.be.false;
    expect(agentsSection.classList.contains('active')).to.be.false;
  });
});
