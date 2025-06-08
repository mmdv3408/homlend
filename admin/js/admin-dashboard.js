/**
 * admin-dashboard.js
 * מודול לניהול לוח הבקרה של מערכת הניהול
 */

import { showError, formatPrice } from './admin-utils.js';

// משתנים גלובליים למודול
let dashboardStats = {};

// פונקציה לטעינת נתוני לוח בקרה
function loadDashboardData() {
    const dashboardSection = document.getElementById('dashboard-section');
    const statsContainer = dashboardSection.querySelector('.dashboard-stats');
    
    if (!statsContainer) return;
    
    // איפוס והצגת מצב טעינה
    statsContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    // שליפת נתוני נכסים מהשרת לצורך הצגת סטטיסטיקה
    fetch('/api/properties')
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נתונים');
            }
            return response.json();
        })
        .then(properties => {
            // חישוב סטטיסטיקה
            dashboardStats = calculateStats(properties);
            
            // הצגת הסטטיסטיקה
            renderDashboard(statsContainer, dashboardStats);
        })
        .catch(error => {
            console.error('שגיאה בטעינת נתוני לוח בקרה:', error);
            showError('שגיאה בטעינת נתוני לוח בקרה', statsContainer);
        });
}

// פונקציה לחישוב סטטיסטיקה
function calculateStats(properties) {
    const stats = {
        total: properties.length,
        forSale: 0,
        forRent: 0,
        commercial: 0,
        residential: 0,
        averagePrice: 0,
        newest: null,
        totalValue: 0
    };
    
    let totalPrice = 0;
    let priceCount = 0;
    
    properties.forEach(property => {
        // ספירה לפי סוג עסקה
        if (property.dealType === 'sale') {
            stats.forSale++;
        } else if (property.dealType === 'rent') {
            stats.forRent++;
        }
        
        // ספירה לפי סוג נכס
        if (['office', 'store', 'industrial'].includes(property.type)) {
            stats.commercial++;
        } else {
            stats.residential++;
        }
        
        // חישוב ממוצע מחיר
        if (property.price) {
            totalPrice += parseFloat(property.price);
            priceCount++;
            stats.totalValue += parseFloat(property.price);
        }
        
        // מציאת הנכס החדש ביותר
        if (!stats.newest || new Date(property.createdAt) > new Date(stats.newest.createdAt)) {
            stats.newest = property;
        }
    });
    
    // חישוב מחיר ממוצע
    stats.averagePrice = priceCount > 0 ? totalPrice / priceCount : 0;
    
    return stats;
}

// פונקציה להצגת הסטטיסטיקה בלוח הבקרה
function renderDashboard(container, stats) {
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-home"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">סה"כ נכסים</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-tag"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.forSale}</div>
                <div class="stat-label">למכירה</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-key"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.forRent}</div>
                <div class="stat-label">להשכרה</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-shekel-sign"></i></div>
            <div class="stat-content">
                <div class="stat-value">${formatPrice(stats.averagePrice)}</div>
                <div class="stat-label">מחיר ממוצע</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-building"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.residential}</div>
                <div class="stat-label">נכסי מגורים</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-store"></i></div>
            <div class="stat-content">
                <div class="stat-value">${stats.commercial}</div>
                <div class="stat-label">נכסים מסחריים</div>
            </div>
        </div>
    `;
    
    // הוספת גרף התפלגות נכסים אם יש אלמנט מתאים
    const chartContainer = document.getElementById('properties-chart');
    if (chartContainer) {
        renderPropertiesChart(chartContainer, stats);
    }
}

// פונקציה להצגת גרף (אופציונלי, יש להוסיף ספריית גרפים כמו Chart.js)
function renderPropertiesChart(container, stats) {
    // כאן אפשר להוסיף קוד להצגת גרף אם יש ספריית גרפים
    container.innerHTML = '<div class="chart-placeholder">גרף התפלגות נכסים</div>';
}

// יצוא פונקציות
export {
    loadDashboardData
};
