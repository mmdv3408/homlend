// ניהול התחברות והרשאות
import { getCookie } from './utils.js';

// פונקציה לבדיקת התחברות המשתמש
async function checkAuth() {
    const username = getCookie('username');
    const name = getCookie('name');
    
    if (!username || !name) {
        window.location.href = '/admin/login.html';
        return false;
    }
    
    // עדכון שם המשתמש בתפריט
    const usernameElement = document.getElementById('currentAgent');
    if (usernameElement) {
        usernameElement.textContent = `שלום, ${name}`;
    }
    
    return true;
}

// פונקציה להתנתקות
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data.success) {
            window.location.href = '/admin/login.html';
        }
    } catch (error) {
        console.error('שגיאה בהתנתקות:', error);
        alert('אירעה שגיאה בהתנתקות. אנא נסה שוב.');
    }
}

// פונקציה לאתחול מערכת האימות
export async function initAuth() {
    console.log('אתחול מערכת האימות');
    
    // בדיקת התחברות
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    
    // הוספת מאזין לכפתור ההתנתקות
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    console.log('מערכת האימות אותחלה בהצלחה');
} 