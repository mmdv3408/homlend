// ניהול נכסים
import * as config from './config.js';
const { propertiesData } = config;
import { getCookie } from './admin-main.js';
import { setupImageUploadPreview, updateImagePreviews } from './admin-images.js';

// אתחול ניהול הנכסים
function initProperties() {
  console.log('אתחול ניהול נכסים');

  // אתחול טופס הנכס
  setupPropertyForm();

  // טעינת הנכסים אם אנחנו בעמוד הנכסים
  if (document.getElementById('properties-section')) {
    loadProperties();
  }
}

// טעינת נכסים מהשרת
function loadProperties() {
  console.log('טוען נכסים מהשרת...');

  fetch('/api/properties')
    .then(response => {
      if (!response.ok) {
        throw new Error('תגובת רשת לא תקינה מהשרת');
      }
      return response.json();
    })
    .then(properties => {
      propertiesData = properties;
      renderPropertiesTable(properties);
      addPropertyEventListeners();
    })
    .catch(error => {
      console.error('שגיאה בטעינת נכסים:', error);
      alert('אירעה שגיאה בטעינת הנכסים. נסה לרענן את הדף.');
    });
}

// הצגת טבלת הנכסים
function renderPropertiesTable(properties) {
  const tbody = document.querySelector('#properties-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!properties || properties.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="8" class="text-center">לא נמצאו נכסים</td>';
    tbody.appendChild(row);
    return;
  }

  properties.forEach(property => {
    const row = document.createElement('tr');
    row.dataset.id = property.id;

    // יצירת תא תמונה
    const imgCell = document.createElement('td');
    if (property.images && property.images.length > 0) {
      imgCell.innerHTML = `<img src="${property.images[0]}" alt="${property.title}" class="property-thumbnail">`;
    } else {
      imgCell.innerHTML = '<i class="fas fa-home"></i>';
    }

    // יצירת שורת הטבלה עם פרטי הנכס
    row.innerHTML = `
            <td>${property.title || '-'}</td>
            <td>${property.type || '-'}</td>
            <td>${property.price ? `${property.price.toLocaleString()} ₪` : '-'}</td>
            <td>${property.rooms || '-'}</td>
            <td>${property.area ? `${property.area} מ"ר` : '-'}</td>
            <td>${property.address || '-'}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${
                  property.id
                }"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${
                  property.id
                }"><i class="fas fa-trash"></i></button>
            </td>
        `;

    // הוספת תא התמונה לתחילת השורה
    row.prepend(imgCell);
    tbody.appendChild(row);
  });

  console.log('טבלת הנכסים עודכנה בהצלחה');
}

// אתחול טופס הנכס
function setupPropertyForm() {
  const form = document.getElementById('addPropertyForm');
  if (!form) return;

  // אתחול העלאת תמונות
  setupImageUploadPreview();

  // טיפול בשליחת הטופס
  form.addEventListener('submit', handlePropertySubmit);

  console.log('טופס הנכס אותחל בהצלחה');
}

// טיפול בשליחת טופס הנכס
async function handlePropertySubmit(e) {
  e.preventDefault();
  console.log('שליחת טופס נכס');

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  try {
    // השבתת כפתור השליחה
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';

    // העלאת תמונות אם נבחרו
    const imageFiles = Array.from(document.querySelector('#property-images').files);
    let uploadedImages = [];

    if (imageFiles.length > 0) {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const uploadResponse = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('שגיאה בהעלאת התמונות');
      }

      const uploadResult = await uploadResponse.json();
      uploadedImages = uploadResult.urls || [];
    }

    // איסוף נתוני הטופס
    const formData = new FormData(form);
    const propertyData = {};

    // המרת FormData לאובייקט
    for (const [key, value] of formData.entries()) {
      // טיפול בשדות מיוחדים
      if (key === 'features[]') {
        if (!propertyData.features) propertyData.features = [];
        propertyData.features.push(value);
      } else if (key === 'images') {
        // מתעלמים מהקובץ המקורי כי כבר טיפלנו בו
        continue;
      } else {
        propertyData[key] = value;
      }
    }

    // הוספת תמונות חדשות למערך התמונות
    if (uploadedImages.length > 0) {
      propertyData.images = propertyData.images || [];
      if (typeof propertyData.images === 'string') {
        propertyData.images = [propertyData.images];
      }
      propertyData.images = [...propertyData.images, ...uploadedImages];
    }

    // שליחת הנתונים לשרת
    const method = propertyData.id ? 'PUT' : 'POST';
    const url = propertyData.id ? `/api/properties/${propertyData.id}` : '/api/properties';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCookie('csrfToken') || '',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה בשמירת הנכס');
    }

    const result = await response.json();
    console.log('נכס נשמר בהצלחה:', result);

    // הצגת הודעת הצלחה
    alert('הנכס נשמר בהצלחה!');

    // איפוס הטופס
    form.reset();
    document.getElementById('preview-container').innerHTML = '';
    document.getElementById('property-id').value = '';

    // רענון רשימת הנכסים
    loadProperties();
  } catch (error) {
    console.error('שגיאה בשמירת הנכס:', error);
    alert(`אירעה שגיאה בשמירת הנכס: ${error.message}`);
  } finally {
    // החזרת כפתור השליחה למצב רגיל
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// הוספת מאזיני אירועים לכפתורי הנכסים
function addPropertyEventListeners() {
  // מאזין לכפתור עריכה
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function () {
      const propertyId = this.dataset.id;
      editProperty(propertyId);
    });
  });

  // מאזין לכפתור מחיקה
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function () {
      const propertyId = this.dataset.id;
      if (confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) {
        deleteProperty(propertyId);
      }
    });
  });
}

// עריכת נכס
function editProperty(propertyId) {
  const property = propertiesData.find(p => p.id == propertyId);
  if (!property) {
    alert('הנכס לא נמצא');
    return;
  }

  // מעבר ללשונית הוספת נכס
  const addPropertyTab = document.querySelector('[data-section="add-property"]');
  if (addPropertyTab) {
    addPropertyTab.click();
  }

  // מילוי הטופס בנתוני הנכס
  fillPropertyForm(property);

  // גלילה לראש הטופס
  window.scrollTo(0, 0);
}

// מילוי טופס נכס עם נתונים
function fillPropertyForm(property) {
  const form = document.getElementById('addPropertyForm');
  if (!form) return;

  console.log('ממלא טופס עם נתוני נכס:', property);

  // מילוי שדות רגילים
  const fields = [
    'id',
    'title',
    'description',
    'price',
    'area',
    'address',
    'neighborhood',
    'type',
    'rooms',
    'floor',
  ];
  fields.forEach(field => {
    if (form.elements[field]) {
      form.elements[field].value = property[field] || '';
    }
  });

  // מילוי תכונות (features)
  if (property.features && Array.isArray(property.features)) {
    property.features.forEach(feature => {
      const checkbox = form.querySelector(`input[type="checkbox"][value="${feature}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  // עדכון תצוגה מקדימה של תמונות
  if (property.images && property.images.length > 0) {
    updateImagePreviews(property);
  }
}

// מחיקת נכס
async function deleteProperty(propertyId) {
  if (!confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) return;

  try {
    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': getCookie('csrfToken') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה במחיקת הנכס');
    }

    // רענון רשימת הנכסים
    loadProperties();
  } catch (error) {
    console.error('שגיאה במחיקת הנכס:', error);
    alert(`אירעה שגיאה במחיקת הנכס: ${error.message}`);
  }
}

// ייצוא הפונקציות הנדרשות
export {
  initProperties,
  loadProperties,
  renderPropertiesTable,
  setupPropertyForm,
  fillPropertyForm,
  deleteProperty,
  addPropertyEventListeners,
};
