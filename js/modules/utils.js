/**
 * פונקציות עזר שימושיות ברחבי האפליקציה
 */

/**
 * פונקציה לביצוע קריאות fetch עם טיפול בשגיאות
 * @param {string} url - כתובת ה-API
 * @param {Object} options - אובייקט אפשרויות ל-fetch
 * @returns {Promise<Object>} - הנתונים שהתקבלו מה-API
 */
export async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include'
        });

        if (!response.ok) {
            let errorMessage = 'אירעה שגיאה בביצוע הבקשה';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // אם לא ניתן לפענח את הודעת השגיאה
            }
            throw new Error(errorMessage);
        }

        // אם התשובה ריקה (למשל במחיקה מוצלחת)
        if (response.status === 204) {
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error('שגיאה:', error);
        throw error;
    }
}

/**
 * פונקציה לקבלת ערך מעוגייה
 * @param {string} name - שם העוגייה
 * @returns {string|null} - ערך העוגייה או null אם לא קיימת
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * פונקציה להצגת הודעת שגיאה למשתמש
 * @param {string} message - הודעת השגיאה
 * @param {HTMLElement} [container=document.body] - אלמנט היעד להצגת השגיאה
 */
export function showError(message, container = document.body) {
    // הסרת הודעות שגיאה קודמות
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    if (!message) return;

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#e74c3c';
    errorElement.style.padding = '10px';
    errorElement.style.margin = '10px 0';
    errorElement.style.border = '1px solid #e74c3c';
    errorElement.style.borderRadius = '4px';
    errorElement.style.backgroundColor = '#fde8e8';
    errorElement.textContent = message;

    container.insertBefore(errorElement, container.firstChild);
}

/**
 * פונקציה להצגת הודעת הצלחה
 * @param {string} message - הודעת ההצלחה
 * @param {number} [timeout=3000] - זמן הצגת ההודעה במילישניות
 */
export function showSuccess(message, timeout = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#2ecc71';
    toast.style.color: 'white';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.3s ease';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, timeout);
}

/**
 * פונקציה לטעינת תמונות
 * @param {File} file - קובץ התמונה
 * @returns {Promise<string>} - Promise שמחזיר את ה-URL של התמונה
 */
export function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('הקובץ חייב להיות תמונה'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * פונקציה לנורמליזציה של מערך תמונות
 * @param {string|Array} images - מערך תמונות או מחרוזת JSON
 * @returns {Array} - מערך מנורמל של תמונות
 */
export function normalizeImages(images) {
    if (!images) return [];
    
    try {
        // אם זה מערך - נחזיר העתק
        if (Array.isArray(images)) {
            return [...images];
        }
        
        // אם זו מחרוזת JSON
        if (typeof images === 'string') {
            // נסה לפרש כ-JSON
            try {
                const parsed = JSON.parse(images);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                // אם לא ניתן לפרש כ-JSON, נחלק לפי פסיקים
                return images.split(',')
                    .map(img => img.trim())
                    .filter(img => img);
            }
        }
        
        // אם זה משהו אחר
        return [String(images)];
    } catch (error) {
        console.error('שגיאה בנורמליזציה של תמונות:', error);
        return [];
    }
}
