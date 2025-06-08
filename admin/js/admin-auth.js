/**
 * admin-auth.js
 * מודול לניהול אימות והרשאות למערכת הניהול
 */

import { getCookie, showError, showSuccess } from './admin-utils.js';

// פונקציית בדיקת הרשאות - דורשת אימות מלא עם סיסמה
function checkAuth() {
    console.log('מבצע בדיקת אימות משתמש...');

    // שליחת בקשה לבדיקת מצב האימות
    return fetch('/api/auth/status', { 
        method: 'GET',
        credentials: 'include', // להבטיח שעוגיות נשלחות
        headers: {
            'Cache-Control': 'no-cache, no-store'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('בעיית תקשורת עם השרת');
        }
        return response.json();
    })
    .then(data => {
        console.log('תוצאת אימות:', data);
        
        if (!data.authenticated) {
            console.warn('משתמש לא מאומת! מפנה לדף התחברות');
            // הפנייה מיידית לדף הלוגין
            window.location.href = 'login.html';
            return false;
        }
        
        // עדכן את פרטי המשתמש בממשק
        const currentAgent = document.getElementById('currentAgent');
        if (currentAgent && data.name) {
            currentAgent.textContent = `שלום, ${data.name}`;
        }
        
        return true;
    })
    .catch(error => {
        console.error('שגיאה בבדיקת הרשאות:', error);
        // גם במקרה של שגיאה, מפנה לדף ההתחברות
        window.location.href = 'login.html';
        return false;
    });
}

// פונקציית התנתקות
function logout() {
    return fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('שגיאה בהתנתקות');
        }
        return response.json();
    })
    .then(data => {
        // מעבר לדף התחברות אחרי התנתקות מוצלחת
        window.location.href = 'login.html';
        return true;
    })
    .catch(error => {
        console.error('שגיאה בהתנתקות:', error);
        // במקרה של שגיאה, עדיין ננסה לנתב לדף התחברות
        window.location.href = 'login.html';
        return false;
    });
}

// אתחול אירועי אימות
function initAuth() {
    // בדיקת אימות בטעינה והחזרת ה-Promise
    return checkAuth().then(isAuthenticated => {
        // הוספת אירוע התנתקות לכפתור
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        return isAuthenticated;
    });
}

// יצוא פונקציות
export {
    checkAuth,
    logout,
    initAuth
};
