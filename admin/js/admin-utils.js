/**
 * admin-utils.js
 * קובץ זה מכיל פונקציות עזר כלליות לשימוש בכל מודולי מערכת הניהול
 */

// פונקציה לקבלת ערך עוגייה
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// פונקציה להצגת הודעות שגיאה
function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (container) {
        // אם יש מיכל מוגדר, הצג בתוכו
        container.innerHTML = '';
        container.appendChild(errorDiv);
    } else {
        // אחרת הצג הודעה צפה
        errorDiv.classList.add('floating-error');
        document.body.appendChild(errorDiv);
        
        // הסר אחרי 5 שניות
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// פונקציה להצגת הודעות הצלחה
function showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    if (container) {
        // אם יש מיכל מוגדר, הצג בתוכו
        container.innerHTML = '';
        container.appendChild(successDiv);
    } else {
        // אחרת הצג הודעה צפה
        successDiv.classList.add('floating-success');
        document.body.appendChild(successDiv);
        
        // הסר אחרי 5 שניות
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// פונקציה לפרמוט מחירים בשקלים
function formatPrice(price) {
    if (!price) return 'מחיר לא צוין';
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
}

// פונקציה לפרמוט תאריכים לתצוגה
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL').format(date);
}

// יצוא הפונקציות להשתמש בהן במודולים אחרים
// וידוא שכל הפונקציות מיוצאות כראוי
// אם יש שגיאות ייבוא, בדוק שכל הפונקציות מוגדרות לפני הייצוא
console.log('מודול admin-utils נטען בהצלחה');

export {
    getCookie,
    showError,
    showSuccess,
    formatPrice,
    formatDate
};
