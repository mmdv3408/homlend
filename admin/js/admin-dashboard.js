// ניהול לוח הבקרה
import { showError, formatPrice, formatDate } from './utils.js';

// פונקציה לטעינת נתוני לוח הבקרה
export async function loadDashboardData() {
    try {
        // טעינת סטטיסטיקות
        const statsResponse = await fetch('../api/dashboard/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            updateStats(statsData.stats);
        }
        
        // טעינת פעילות אחרונה
        const activityResponse = await fetch('../api/dashboard/activity');
        const activityData = await activityResponse.json();
        
        if (activityData.success) {
            updateActivity(activityData.activities);
        }
        
    } catch (error) {
        console.error('שגיאה בטעינת נתוני לוח הבקרה:', error);
        showError('אירעה שגיאה בטעינת נתוני לוח הבקרה');
    }
}

// פונקציה לעדכון סטטיסטיקות
function updateStats(stats) {
    const statCounts = document.querySelectorAll('.stat-count');
    
    if (statCounts.length >= 3) {
        statCounts[0].textContent = stats.properties || 0;
        statCounts[1].textContent = stats.views || 0;
        statCounts[2].textContent = stats.inquiries || 0;
    }
}

// פונקציה לעדכון רשימת הפעילות
function updateActivity(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = activities.map(activity => `
        <li>
            <span class="activity-time">${formatDate(activity.time)}</span>
            <span class="activity-text">${activity.text}</span>
        </li>
    `).join('');
}

// פונקציה לאתחול לוח הבקרה
export async function initDashboard() {
    await loadDashboardData();
} 