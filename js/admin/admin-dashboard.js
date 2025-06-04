// ניהול לוח הבקרה
import { getCookie } from './admin-main.js';

// אתחול לוח הבקרה
function initDashboard() {
  console.log('אתחול לוח הבקרה');

  // טעינת נתוני הלוח אם אנחנו בעמוד הלוח
  if (document.getElementById('dashboard-section')) {
    loadDashboardData();
  }
}

// טעינת נתוני לוח הבקרה
function loadDashboardData() {
  console.log('טוען נתוני לוח בקרה...');

  // הצגת טעינה
  const dashboardContent = document.querySelector('#dashboard-section .dashboard-content');
  if (dashboardContent) {
    dashboardContent.innerHTML =
      '<div class="loading"><i class="fas fa-spinner fa-spin"></i> טוען נתונים...</div>';
  }

  // שליפת נתוני לוח הבקרה מהשרת
  fetch('/api/dashboard', {
    headers: {
      'X-CSRF-Token': getCookie('csrfToken') || '',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('תגובת רשת לא תקינה מהשרת');
      }
      return response.json();
    })
    .then(data => {
      renderDashboard(data);
    })
    .catch(error => {
      console.error('שגיאה בטעינת נתוני הלוח:', error);

      // הצגת הודעת שגיאה
      if (dashboardContent) {
        dashboardContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>אירעה שגיאה בטעינת נתוני הלוח: ${error.message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">נסה שוב</button>
                </div>
            `;
      }
    });
}

// הצגת נתוני לוח הבקרה
function renderDashboard(data) {
  console.log('מציג נתוני לוח בקרה:', data);

  const dashboardContent = document.querySelector('#dashboard-section .dashboard-content');
  if (!dashboardContent) return;

  // יצירת HTML עבור לוח הבקרה
  const html = `
        <div class="dashboard-grid">
            <!-- כרטיס סטטיסטיקות נכסים -->
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-home"></i> נכסים</h3>
                </div>
                <div class="card-body">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${data.properties?.total || 0}</div>
                            <div class="stat-label">סה"כ נכסים</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.properties?.active || 0}</div>
                            <div class="stat-label">פעילים</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.properties?.pending || 0}</div>
                            <div class="stat-label">ממתינים לאישור</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.properties?.sold || 0}</div>
                            <div class="stat-label">נמכרו</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- כרטיס סטטיסטיקות סוכנים -->
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-user-tie"></i> סוכנים</h3>
                </div>
                <div class="card-body">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${data.agents?.total || 0}</div>
                            <div class="stat-label">סה"כ סוכנים</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.agents?.active || 0}</div>
                            <div class="stat-label">פעילים</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.agents?.admins || 0}</div>
                            <div class="stat-label">מנהלים</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- כרטיס פעילות אחרונה -->
            <div class="dashboard-card full-width">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> פעילות אחרונה</h3>
                </div>
                <div class="card-body">
                    ${renderRecentActivity(data.recentActivity || [])}
                </div>
            </div>
            
            <!-- כרטיס נכסים מובילים -->
            <div class="dashboard-card full-width">
                <div class="card-header">
                    <h3><i class="fas fa-star"></i> נכסים מובילים</h3>
                </div>
                <div class="card-body">
                    ${renderFeaturedProperties(data.featuredProperties || [])}
                </div>
            </div>
        </div>
    `;

  dashboardContent.innerHTML = html;

  // הוספת מאזיני אירועים
  addDashboardEventListeners();
}

// הצגת רשימת פעילויות אחרונות
function renderRecentActivity(activities) {
  if (!activities || activities.length === 0) {
    return '<div class="no-data">אין פעילות אחרונה להצגה</div>';
  }

  let html = '<ul class="activity-list">';

  activities.forEach(activity => {
    html += `
            <li class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-meta">
                        <span class="activity-user">${activity.user || 'משתמש לא ידוע'}</span>
                        <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
                    </div>
                </div>
            </li>
        `;
  });

  html += '</ul>';
  return html;
}

// הצגת רשימת נכסים מובילים
function renderFeaturedProperties(properties) {
  if (!properties || properties.length === 0) {
    return '<div class="no-data">אין נכסים מובילים להצגה</div>';
  }

  let html = '<div class="featured-properties">';

  properties.forEach(property => {
    html += `
            <div class="property-card">
                <div class="property-image">
                    ${
                      property.images && property.images.length > 0
                        ? `<img src="${property.images[0]}" alt="${property.title || 'נכס'}">`
                        : '<div class="no-image"><i class="fas fa-home"></i></div>'
                    }
                    <span class="property-price">${
                      property.price ? `${property.price.toLocaleString()} ₪` : 'מחיר לפי בקשה'
                    }</span>
                </div>
                <div class="property-details">
                    <h4>${property.title || 'ללא כותרת'}</h4>
                    <div class="property-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${
                          property.neighborhood || 'לא צוין'
                        }</span>
                        <span><i class="fas fa-vector-square"></i> ${
                          property.area || '0'
                        } מ"ר</span>
                        <span><i class="fas fa-door-open"></i> ${property.rooms || '0'} חדרים</span>
                    </div>
                    <div class="property-actions">
                        <a href="/property/${
                          property.id
                        }" class="btn btn-sm btn-outline" target="_blank">צפה בדף הנכס</a>
                        <a href="/admin?section=properties&edit=${
                          property.id
                        }" class="btn btn-sm btn-primary">ערוך</a>
                    </div>
                </div>
            </div>
        `;
  });

  html += '</div>';
  return html;
}

// קבלת אייקון לפי סוג פעילות
function getActivityIcon(activityType) {
  const icons = {
    property_added: 'fas fa-home',
    property_updated: 'fas fa-edit',
    property_deleted: 'fas fa-trash',
    agent_added: 'fas fa-user-plus',
    agent_updated: 'fas fa-user-edit',
    agent_deleted: 'fas fa-user-minus',
    user_logged_in: 'fas fa-sign-in-alt',
    user_logged_out: 'fas fa-sign-out-alt',
    default: 'fas fa-info-circle',
  };

  return icons[activityType] || icons.default;
}

// פורמט זמן (לפני X זמן)
function formatTimeAgo(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `לפני ${interval} שנים`;
  if (interval === 1) return 'לפני שנה';

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `לפני ${interval} חודשים`;
  if (interval === 1) return 'לפני חודש';

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `לפני ${interval} ימים`;
  if (interval === 1) return 'אתמול';

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `לפני ${interval} שעות`;
  if (interval === 1) return 'לפני שעה';

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `לפני ${interval} דקות`;
  if (interval === 1) return 'לפני דקה';

  return 'לפני כמה שניות';
}

// הוספת מאזיני אירועים ללוח הבקרה
function addDashboardEventListeners() {
  // מאזין לרענון נתוני הלוח
  const refreshBtn = document.querySelector('.btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboardData);
  }

  // מאזינים נוספים לפי הצורך
}

// ייצוא הפונקציות הנדרשות
export { initDashboard, loadDashboardData };
