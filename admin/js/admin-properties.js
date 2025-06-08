// ניהול נכסים
import { showError, showSuccess, formatPrice, formatDate } from './utils.js';

// פונקציה לאתחול מודול הנכסים
export async function initProperties() {
    console.log('אתחול מודול הנכסים...');
    try {
        // הגדרת טופס נכס
        setupPropertyForm();
        
        // טעינת רשימת נכסים
        await loadProperties();
        
        console.log('מודול הנכסים אותחל בהצלחה');
        return true;
    } catch (error) {
        console.error('שגיאה באתחול מודול הנכסים:', error);
        return false;
    }
}

// פונקציה לטעינת נכסים
export async function loadProperties() {
    try {
        const response = await fetch('/api/properties');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'שגיאה בטעינת הנכסים');
        }
        
        const tableBody = document.getElementById('propertiesTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        data.properties.forEach(property => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${property.mainImage || '/images/no-image.jpg'}" alt="${property.title}" class="property-thumbnail"></td>
                <td>${property.title}</td>
                <td>${property.type}</td>
                <td>${formatPrice(property.price)}</td>
                <td>${formatDate(property.updatedAt)}</td>
                <td><span class="status-badge ${property.status === 'פעיל' ? 'active' : 'draft'}">${property.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="editProperty('${property.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteProperty('${property.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('שגיאה בטעינת נכסים:', error);
        showError('אירעה שגיאה בטעינת הנכסים');
    }
}

// פונקציה להגדרת טופס נכס
export function setupPropertyForm() {
    const form = document.getElementById('addPropertyForm');
    if (!form) return;
    
    // איפוס הטופס
    form.reset();
    
    // הוספת מאזין אירועים לשליחת הטופס
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const propertyId = formData.get('id');
            
            const response = await fetch(`/api/properties${propertyId ? `/${propertyId}` : ''}`, {
                method: propertyId ? 'PUT' : 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess(propertyId ? 'הנכס עודכן בהצלחה' : 'הנכס נוסף בהצלחה');
                form.reset();
                loadProperties();
            } else {
                throw new Error(data.error || 'שגיאה בשמירת הנכס');
            }
            
        } catch (error) {
            console.error('שגיאה בשמירת נכס:', error);
            showError('אירעה שגיאה בשמירת הנכס');
        }
    });
}

// פונקציה לעריכת נכס
export async function editProperty(id) {
    try {
        const response = await fetch(`../api/properties/${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'שגיאה בטעינת פרטי הנכס');
        }
        
        // מעבר ללשונית עריכת נכס
        const addPropertyTab = document.querySelector('[data-section="add-property"]');
        if (addPropertyTab) {
            addPropertyTab.click();
        }
        
        // מילוי הטופס בנתונים
        const form = document.getElementById('addPropertyForm');
        if (form) {
            const property = data.property;
            form.elements['id'].value = property.id;
            form.elements['title'].value = property.title;
            form.elements['description'].value = property.description;
            form.elements['price'].value = property.price;
            form.elements['area'].value = property.area;
            form.elements['address'].value = property.address;
            form.elements['neighborhood'].value = property.neighborhood;
            form.elements['type'].value = property.type;
            form.elements['rooms'].value = property.rooms;
            form.elements['floor'].value = property.floor;
            form.elements['status'].value = property.status;
            form.elements['featured'].value = property.featured;
            
            // סימון מאפיינים
            if (property.features) {
                property.features.forEach(feature => {
                    const checkbox = form.querySelector(`input[value="${feature}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // הצגת תמונות
            updateImagePreviews(property);
        }
        
    } catch (error) {
        console.error('שגיאה בעריכת נכס:', error);
        showError('אירעה שגיאה בטעינת פרטי הנכס');
    }
}

// פונקציה למחיקת נכס
export async function deleteProperty(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) {
        return;
    }
    
    try {
        const response = await fetch(`../api/properties/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('הנכס נמחק בהצלחה');
            loadProperties();
        } else {
            throw new Error(data.error || 'שגיאה במחיקת הנכס');
        }
        
    } catch (error) {
        console.error('שגיאה במחיקת נכס:', error);
        showError('אירעה שגיאה במחיקת הנכס');
    }
}

// פונקציה לעדכון תצוגה מקדימה של תמונות
function updateImagePreviews(property) {
    const mainImagePreview = document.getElementById('main-image-preview');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (mainImagePreview && property.mainImage) {
        mainImagePreview.innerHTML = `
            <img src="${property.mainImage}" alt="תמונה ראשית">
            <button type="button" class="remove-image" onclick="removeMainImage()">
                <i class="fas fa-times"></i>
            </button>
        `;
    }
    
    if (additionalImagesPreview && property.images) {
        additionalImagesPreview.innerHTML = property.images.map((image, index) => `
            <div class="image-preview-item">
                <img src="${image}" alt="תמונה ${index + 1}">
                <button type="button" class="remove-image" onclick="removeAdditionalImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
} 