// ניהול אימות משתמשים
import { getCookie, showError } from './utils.js';

// בדיקת המשתמש המחובר
async function checkLoggedInUser() {
  console.log('1. Starting checkLoggedInUser...');
  const usernameElement = document.getElementById('username');
  if (!usernameElement) {
    console.log('1.1 No username element found - redirecting to login');
    window.location.href = './login.html';
    return false; // אין להמשיך בלי אימות
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
    window.location.href = './login.html';
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
      window.location.href = './login.html?error_source=admin';
      return false;
    }
    
    console.log('2.3 User authenticated, setting up logout button...');
    setupLogoutButton();
    return true;
    
  } catch (error) {
    console.error('2.4 Error in initAuth:', error);
    console.log('2.5 Redirecting to login page due to error...');
    window.location.href = './login.html?error_source=admin';
    return false;
  }
}

// הגדרת כפתור ההתנתקות
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    console.log('2.3.1 Setting up logout button event listener');
    logoutBtn.addEventListener('click', async () => {
      console.log('Logging out...');
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log('Logout successful, redirecting to login page');
          window.location.href = './login.html';
        } else {
          console.error('Logout failed:', data.message);
          alert('שגיאה בהתנתקות: ' + data.message);
        }
      } catch (error) {
        console.error('Error during logout:', error);
        // אם השרת לא זמין, ננסה לנקות את הקוקיס בצד הלקוח
        document.cookie = 'adminAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        alert('שגיאה בהתנתקות. מנתק אותך בכל זאת...');
        window.location.href = './login.html';
      }
    });
  } else {
    console.warn('2.3.2 Logout button not found');
  }
}

// ייצוא הפונקציות הנדרשות
export { initAuth };