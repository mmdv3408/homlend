// ניהול אימות משתמשים
import { getCookie, showError } from './utils.js';

// בדיקת המשתמש המחובר
async function checkLoggedInUser() {
  console.log('1. Starting checkLoggedInUser...');
  const usernameElement = document.getElementById('username');
  if (!usernameElement) {
    console.log('1.1 No username element found - continuing without authentication');
    return true; // Continue without authentication if username element doesn't exist
  }
  
  try {
    console.log('בודק סשן משתמש...');
    const response = await fetch('/api/auth/check-session', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('הסשן לא מאושר');
    }
    
    const userData = await response.json();
    if (userData.authenticated && userData.user) {
      console.log('משתמש מאומת:', userData.user.name);
      usernameElement.textContent = userData.user.name;
      return true;
    } else {
      throw new Error('לא מאושר - אין נתוני משתמש');
    }
  } catch (error) {
    console.error('שגיאת אימות:', error);
    // הפנייה לדף ההתחברות
    window.location.href = '/admin/login.html';
    return false; // לא נמשיך את ההתחברות
  }
}

// אתחול מערכת האימות
async function initAuth() {
  console.log('2. Starting initAuth...');
  try {
    console.log('2.1 Checking if user is authenticated...');
    const isAuthenticated = await checkLoggedInUser();
    
    if (!isAuthenticated) {
      console.log('2.2 User not authenticated, redirecting to login...');
      window.location.href = '/admin/login.html';
      return false;
    }
    
    console.log('2.3 User authenticated, setting up logout button...');
    setupLogoutButton();
    return true;
    
  } catch (error) {
    console.error('2.4 Error in initAuth:', error);
    console.log('2.5 Redirecting to login page due to error...');
    window.location.href = '/admin/login.html';
    return false;
  }
}

// ייצוא הפונקציות הנדרשות
export { initAuth };