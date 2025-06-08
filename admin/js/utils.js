/**
 * קובץ עזר עם פונקציות שימושיות לשימוש בכל המודולים
 */

/**
 * בדיקת אם המשתמש מחובר
 * @returns {boolean} האם המשתמש מחובר
 */
export function isLoggedIn() {
  // בדיקה אם קיימת עוגיית סשן
  return document.cookie.includes('sessionId=');
}

/**
 * הפנייה לדף ההתחברות אם המשתמש לא מחובר
 */
export function redirectToLoginIfNotAuthenticated() {
  if (!isLoggedIn()) {
    window.location.href = './login.html';
  }
}

/**
 * הצגת הודעת שגיאה למשתמש
 * @param {string} message - הודעת השגיאה להצגה
 * @param {HTMLElement} [container] - אלמנט היעד להצגת השגיאה (אם לא מועבר, יציג הודעת התראה)
 */
export function showError(message, container) {
  console.error('שגיאה:', message);

  if (container) {
    // הצגת השגיאה בתוך האלמנט שסופק
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

    // ניקוי תוכן קיים והוספת השגיאה
    container.innerHTML = '';
    container.appendChild(errorElement);
  } else {
    // הצגת התראה אם לא סופק אלמנט יעד
    alert(`שגיאה: ${message}`);
  }
}

/**
 * הצגת הודעת הצלחה
 * @param {string} message - הודעת ההצלחה להצגה
 * @param {HTMLElement} [container] - אלמנט היעד להצגת ההודעה
 */
export function showSuccess(message, container) {
  console.log('הצלחה:', message);

  if (container) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

    container.innerHTML = '';
    container.appendChild(successElement);
  } else {
    alert(`הצלחה: ${message}`);
  }
}

/**
 * עיצוב מספר כמחיר
 * @param {number} price - המחיר לעיצוב
 * @returns {string} המחיר המעוצב
 */
export function formatPrice(price) {
  if (price === undefined || price === null) return 'מחיר לפי בקשה';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
}

/**
 * עיכוב ביצוע פונקציה
 * @param {Function} func - הפונקציה לעכב
 * @param {number} wait - זמן ההמתנה במילישניות
 * @returns {Function} הפונקציה המעוכבת
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * בדיקת תקינות אימייל
 * @param {string} email - האימייל לבדיקה
 * @returns {boolean} האם האימייל תקין
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * יצירת מזהה ייחודי
 * @returns {string} מזהה ייחודי
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * המרת תאריך לפורמט קריא
 * @param {string|Date} date - התאריך להמרה
 * @returns {string} התאריך המעוצב
 */
export function formatDate(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(date).toLocaleDateString('he-IL', options);
}

/**
 * קבלת פרמטר מכתובת ה-URL
 * @param {string} name - שם הפרמטר
 * @returns {string|null} ערך הפרמטר או null אם לא קיים
 */
export function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// פונקציות עזר כלליות

// פונקציה לקבלת ערך קוקי
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// פונקציה לבדיקת תקינות קובץ תמונה
export function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
}

// פונקציה לבדיקת גודל קובץ
export function isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
} 