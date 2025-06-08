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
            
            console.log('עריכת נכס:', propertyId);
            
            // שינוי לתצוגת עריכה
            currentPropertyId = propertyId;
            
            // טעינת נתוני הנכס לפני מעבר לטאב העריכה
            fetch(`/api/properties/${propertyId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`קוד שגיאה: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success && data.property) {
                        // מעבר ללשונית עריכה רק אחרי שקיבלנו את הנתונים
                        document.querySelector('[data-section="add-property"]').click();
                        
                        // קצת השהייה כדי לוודא שהטופס מוצג
                        setTimeout(() => {
                            console.log('ממלא טופס עם נתונים:', data.property);
                            document.getElementById('property-id').value = data.property.id || '';
                            
                            // מילוי הטופס עם הנתונים
                            fillPropertyForm(data.property);
                        }, 100);
                    } else {
                        throw new Error(data.error || 'לא ניתן לטעון את נתוני הנכס');
                    }
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
    const propertyId = document.getElementById('property-id').value || currentPropertyId;
    if (propertyId) {
        method = 'PUT';
        url = `/api/properties/${propertyId}`;
        console.log(`עריכת נכס קיים: ${propertyId}`);
    } else {
        console.log('יצירת נכס חדש');
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
    
    if (!property) {
        console.error('לא ניתן למלא טופס עם נתוני נכס לא מוגדרים');
        return;
    }
    
    // איפוס הטופס לפני מילוי
    resetPropertyForm();
    
    // עדכון המזהה הנוכחי
    currentPropertyId = property.id;
    document.getElementById('property-id').value = property.id || '';
    
    // בדיקה ומילוי של כל שדה עם בדיקת קיום
    const fillField = (id, value) => {
        const field = document.getElementById(id);
        if (field && value !== undefined) {
            field.value = value || '';
        }
    };
    
    // מילוי שדות הטופס
    fillField('property-title', property.title);
    fillField('property-description', property.description);
    fillField('property-price', property.price);
    fillField('property-rooms', property.rooms);
    fillField('property-area', property.area || property.size); // התאמה לשם השדה ב-HTML
    fillField('property-floor', property.floor);
    fillField('property-address', property.address);
    fillField('property-neighborhood', property.neighborhood);
    
    // בחירת סוג עסקה
    if (property.dealType) {
        const dealTypeRadio = document.querySelector(`input[name="dealType"][value="${property.dealType}"]`);
        if (dealTypeRadio) {
            dealTypeRadio.checked = true;
        }
    }
    
    // בחירת סוג נכס
    fillField('property-type', property.type);
    
    // בחירת מאפיינים
    if (property.features && Array.isArray(property.features)) {
        property.features.forEach(feature => {
            const checkbox = document.querySelector(`input[name="features[]"][value="${feature}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // עדכון תצוגה מקדימה של תמונות
    try {
        if (typeof updateImagePreviews === 'function') {
            updateImagePreviews(property);
        } else {
            console.warn('פונקציית updateImagePreviews לא נמצאה');
        }
    } catch (error) {
        console.error('שגיאה בהצגת תמונות:', error);
    }
    
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
