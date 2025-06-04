// ניהול אימות משתמשים
import { getCookie } from './admin-main.js';

// אתחול מערכת האימות
function initAuth() {
  console.log('אתחול מערכת האימות');

  // בדיקת משתמש מחובר
  checkLoggedInUser();

  // אתחול כפתור התנתקות
  setupLogoutButton();
}

// בדיקת המשתמש המחובר
async function checkLoggedInUser() {
  const usernameElement = document.getElementById('username');
  if (!usernameElement) return;
  
  try {
    const response = await fetch('/api/auth/check-session', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('לא מאושר');
    }
    
    const userData = await response.json();
    if (userData.authenticated && userData.user) {
      usernameElement.textContent = userData.user.name;
    } else {
      throw new Error('לא מאושר');
    }
  } catch (error) {
    console.error('שגיאת אימות:', error);
    window.location.href = '/admin/login.html';
  }
}

// הגדרת כפתור ההתנתקות
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    // הסרת מאזיני אירועים קיימים
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

    newLogoutBtn.addEventListener('click', () => {
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = '/admin/login.html';
          }
        })
        .catch(error => {
          console.error('שגיאה בהתנתקות:', error);
        });
    });
  }
}

// ייצוא הפונקציות הנדרשות
export { initAuth };
