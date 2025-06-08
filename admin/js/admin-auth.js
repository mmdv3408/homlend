/**
 * admin-auth.js
 * מודול לניהול אימות והרשאות למערכת הניהול
 */

import { getCookie, showError, showSuccess } from './admin-utils.js';

// פונקציית בדיקת הרשאות - בלי הפניה אוטומטית למניעת לולאות אינסופיות
function checkAuth() {
    console.log('בודק מצב אימות משתמש...');
    
    // בדוק אם יש כבר הפניה בתהליך למניעת לולאת אינסוף
    const redirectInProgress = sessionStorage.getItem('auth_redirect_in_progress');
    if (redirectInProgress === 'true') {
        console.log('זוהתה הפניית אימות בתהליך, מונע לולאת הפניות');
        sessionStorage.removeItem('auth_redirect_in_progress');
        return Promise.resolve(false);
    }
    
    return fetch('/api/auth/status')
        .then(response => {
            if (!response.ok) {
                throw new Error('בעיית תקשורת עם השרת');
            }
            return response.json();
        })
        .then(data => {
            console.log('תוצאת בדיקת אימות:', data);
            // מחזיר את מצב האימות בלבד, בלי לבצע הפניה
            return data.authenticated === true;
        })
        .catch(error => {
            console.error('שגיאה בבדיקת אימות:', error);
            // לא מבצע הפניה אוטומטית גם במקרה של שגיאה
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
