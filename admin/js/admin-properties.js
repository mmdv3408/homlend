/**
 * admin-properties.js
 * מודול לניהול נכסים במערכת הניהול
 */

import { showError, showSuccess, formatPrice } from './admin-utils.js';
import { updateImagePreviews } from './admin-images.js';

// משתנים גלובליים למודול
let propertiesData = [];
let currentPropertyId = null;

// טעינת נכסים מהשרת לטבלת הנכסים
function loadProperties() {
    const propertiesTableBody = document.getElementById('propertiesTableBody');
    if (!propertiesTableBody) return;

    // איפוס הטבלה והצגת מצב טעינה
    propertiesTableBody.innerHTML = '<tr><td colspan="6" class="loading-row"><div class="loading-spinner"></div> טוען נכסים...</td></tr>';

    // שליפת נתוני נכסים מהשרת
    fetch('/api/properties')
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נכסים');
            }
            return response.json();
        })
        .then(properties => {
            // שמירת המידע במשתנה הגלובלי
            propertiesData = properties;
            
            if (properties && properties.length > 0) {
                // ניקוי הטבלה
                propertiesTableBody.innerHTML = '';
                
                // הוספת שורות לטבלה
                properties.forEach(property => {
                    const row = document.createElement('tr');
                    
                    // התאמת סוגי העסקה והנכס לעברית
                    let dealTypeText = property.dealType === 'sale' ? 'מכירה' : 'השכרה';
                    let propertyTypeText = '';
                    
                    switch(property.type) {
                        case 'apartment': propertyTypeText = 'דירה'; break;
                        case 'house': propertyTypeText = 'בית'; break;
                        case 'office': propertyTypeText = 'משרד'; break;
                        case 'store': propertyTypeText = 'חנות'; break;
                        case 'land': propertyTypeText = 'קרקע'; break;
                        default: propertyTypeText = property.type;
                    }
                    
                    row.innerHTML = `
                        <td>${property.id}</td>
                        <td>${property.title || 'ללא כותרת'}</td>
                        <td>${dealTypeText}</td>
                        <td>${propertyTypeText}</td>
                        <td>${formatPrice(property.price)}</td>
                        <td class="table-actions">
                            <button class="action-btn edit-property-btn" data-id="${property.id}" title="ערוך"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-property-btn" data-id="${property.id}" title="מחק"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                    
                    propertiesTableBody.appendChild(row);
                });
                
                // הוספת אירועי לחיצה לכפתורי עריכה ומחיקה
                addPropertyEventListeners();
            } else {
                // אין נכסים
                propertiesTableBody.innerHTML = '<tr><td colspan="6" class="empty-row">לא נמצאו נכסים</td></tr>';
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת נכסים:', error);
            propertiesTableBody.innerHTML = `<tr><td colspan="6" class="error-row">שגיאה בטעינת נכסים: ${error.message}</td></tr>`;
        });
}

// פונקציה למחיקת נכס
function deleteProperty(propertyId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) {
        return Promise.resolve(false);
    }
    
    return fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('שגיאה במחיקת הנכס');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showSuccess('הנכס נמחק בהצלחה');
            
            // רענון רשימת הנכסים
            loadProperties();
            return true;
        } else {
            throw new Error(data.error || 'שגיאה במחיקת הנכס');
        }
    })
    .catch(error => {
        console.error('שגיאה במחיקת נכס:', error);
        showError(`שגיאה במחיקת הנכס: ${error.message}`);
        return false;
    });
}

// הוספת אירועי לחיצה לכפתורי נכסים
function addPropertyEventListeners() {
    document.querySelectorAll('.edit-property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            
            // שינוי לתצוגת עריכה
            currentPropertyId = propertyId;
            
            // מעבר ללשונית עריכה
            document.querySelector('[data-section="add-property"]').click();
            
            // עדכון כותרת
            const adminTitle = document.querySelector('.admin-title h1');
            if (adminTitle) {
                adminTitle.textContent = 'עריכת נכס';
            }
            
            // עדכון כותרת טופס
            const formTitle = document.querySelector('#property-form-title');
            if (formTitle) {
                formTitle.textContent = 'עריכת נכס קיים';
            }
            
            // טעינת נתוני הנכס
            fetch(`/api/properties/${propertyId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('שגיאה בטעינת נתוני נכס');
                    }
                    return response.json();
                })
                .then(property => {
                    fillPropertyForm(property);
                })
                .catch(error => {
                    console.error('שגיאה בטעינת נתוני נכס:', error);
                    showError(`שגיאה בטעינת נתוני הנכס: ${error.message}`);
                });
        });
    });
    
    document.querySelectorAll('.delete-property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            deleteProperty(propertyId);
        });
    });
}

// פונקציה לאתחול טופס הנכס
function setupPropertyForm() {
    console.log('מאתחל טופס נכס');
    
    // איפוס הטופס והמזהה הנוכחי
    resetPropertyForm();
    
    // עדכון כותרת הטופס
    const formTitle = document.querySelector('#property-form-title');
    if (formTitle) {
        formTitle.textContent = 'הוספת נכס חדש';
    }
    
    // עדכון כפתור השליחה
    const submitBtn = document.querySelector('#addPropertyForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'הוסף נכס';
    }
    
    // אתחול אירוע שליחת הטופס
    const addPropertyForm = document.getElementById('addPropertyForm');
    if (addPropertyForm) {
        // הסרת מאזינים קודמים למניעת כפילויות
        const newForm = addPropertyForm.cloneNode(true);
        addPropertyForm.parentNode.replaceChild(newForm, addPropertyForm);
        
        // הגדרה מחדש של אירוע השליחה
        newForm.addEventListener('submit', handlePropertyFormSubmit);
    }
}

// פונקציה לטיפול בשליחת טופס הנכס
function handlePropertyFormSubmit(e) {
    e.preventDefault();
    console.log('שליחת טופס נכס');
    
    // יצירת אובייקט FormData חדש
    const formData = new FormData(this);
    
    // הוספת מידע על תמונות מהטופס (ימולא על ידי מודול התמונות)
    // קוד טיפול בתמונות נמצא במודול admin-images.js
    
    // הגדרת שיטת השליחה וכתובת היעד
    let method = 'POST';
    let url = '/api/properties';
    
    // אם זו עריכה, שנה את המתודה והכתובת
    if (currentPropertyId) {
        method = 'PUT';
        url = `/api/properties/${currentPropertyId}`;
    }
    
    // שליחת הבקשה לשרת (הרחבה של הטיפול בתמונות נמצאת במודול admin-images.js)
    fetch(url, {
        method: method,
        body: formData
    })
    .then(response => {
        console.log('תגובת שרת:', response.status);
        if (!response.ok) {
            throw new Error('שגיאה בתגובת השרת');
        }
        return response.json();
    })
    .then(data => {
        console.log('תגובת שרת JSON:', data);
        
        if (data.success) {
            showSuccess('הנכס נשמר בהצלחה!');
            
            // איפוס הטופס אחרי שמירה
            resetPropertyForm();
            
            // מעבר ללשונית רשימת הנכסים ורענון הרשימה
            document.querySelector('[data-section="properties"]').click();
        } else {
            throw new Error(data.error || 'אירעה שגיאה בשמירת הנכס');
        }
    })
    .catch(error => {
        console.error('שגיאה בשליחת הנכס:', error);
        showError(`אירעה שגיאה בשמירת הנכס: ${error.message}`);
    });
}

// פונקציה למילוי טופס נכס עם נתונים
function fillPropertyForm(property) {
    console.log('ממלא טופס נכס עם נתונים:', property);
    
    // איפוס הטופס לפני מילוי
    resetPropertyForm();
    
    // עדכון המזהה הנוכחי
    currentPropertyId = property.id;
    
    // מילוי שדות הטופס
    document.getElementById('property-title').value = property.title || '';
    document.getElementById('property-description').value = property.description || '';
    document.getElementById('property-price').value = property.price || '';
    document.getElementById('property-rooms').value = property.rooms || '';
    document.getElementById('property-size').value = property.size || '';
    document.getElementById('property-floor').value = property.floor || '';
    document.getElementById('property-address').value = property.address || '';
    document.getElementById('property-city').value = property.city || '';
    document.getElementById('property-neighborhood').value = property.neighborhood || '';
    
    // בחירת סוג עסקה
    if (property.dealType) {
        document.querySelector(`input[name="dealType"][value="${property.dealType}"]`).checked = true;
    }
    
    // בחירת סוג נכס
    if (property.type) {
        document.getElementById('property-type').value = property.type;
    }
    
    // בחירת מאפיינים
    if (property.features && Array.isArray(property.features)) {
        property.features.forEach(feature => {
            const checkbox = document.querySelector(`input[name="features"][value="${feature}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // עדכון תצוגה מקדימה של תמונות
    updateImagePreviews(property);
    
    // עדכון כותרת הטופס
    const formTitle = document.querySelector('#property-form-title');
    if (formTitle) {
        formTitle.textContent = 'עריכת נכס';
    }
    
    // עדכון כפתור השליחה
    const submitBtn = document.querySelector('#addPropertyForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'שמור שינויים';
    }
}

// פונקציה לאיפוס טופס הנכס
function resetPropertyForm() {
    // איפוס המזהה הנוכחי
    currentPropertyId = null;
    
    // איפוס כל השדות בטופס
    const form = document.getElementById('addPropertyForm');
    if (form) form.reset();
    
    // איפוס תמונות
    const mainImagePreview = document.getElementById('main-image-preview');
    if (mainImagePreview) mainImagePreview.innerHTML = '<div class="no-image">לא נבחרה תמונה</div>';
    
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
}

// יצוא פונקציות
export {
    loadProperties,
    setupPropertyForm,
    fillPropertyForm,
    deleteProperty,
    resetPropertyForm,
    addPropertyEventListeners
};
