// ניהול תמונות

// אתחול ניהול התמונות
function initImages() {
  console.log('אתחול ניהול תמונות');

  // אתחול אירועים הקשורים לתמונות
  setupImageEventListeners();
}

// הגדרת מאזיני אירועים לתמונות
function setupImageEventListeners() {
  // מאזין למחיקת תמונה מתצוגה מקדימה
  document.addEventListener('click', e => {
    if (e.target.classList.contains('delete-image')) {
      e.preventDefault();
      const { imageUrl } = e.target.dataset;
      const { propertyId } = e.target.dataset;
      removeImageFromPreview(imageUrl, propertyId);
    }
  });

  console.log('מאזיני אירועים לתמונות אותחלו בהצלחה');
}

// אתחול תצוגה מקדימה של העלאת תמונות
function setupImageUploadPreview() {
  const fileInput = document.getElementById('property-images');
  const previewContainer = document.getElementById('preview-container');

  if (!fileInput || !previewContainer) return;

  // הסרת מאזין קיים אם קיים
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  // הוספת מאזין חדש
  newFileInput.addEventListener('change', function() {
    const files = Array.from(this.files);

    if (files.length === 0) return;

    // ניקוי תצוגה מקדימה קיימת אם יש
    previewContainer.innerHTML = '';

    // יצירת תצוגה מקדימה לכל קובץ
    files.forEach(file => {
      if (!file.type.match('image.*')) {
        alert('ניתן להעלות קבצי תמונות בלבד');
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
                    <img src="${e.target.result}" alt="תצוגה מקדימה">
                    <button type="button" class="delete-image" data-image-url="${e.target.result}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

        previewContainer.appendChild(preview);
      };

      reader.readAsDataURL(file);
    });
  });

  console.log('תצוגה מקדימה של תמונות אותחלה בהצלחה');
}

// עדכון תצוגה מקדימה של תמונות קיימות
function updateImagePreviews(property) {
  const previewContainer = document.getElementById('preview-container');
  if (!previewContainer || !property.images || property.images.length === 0) return;

  // ניקוי תצוגה מקדימה קיימת
  previewContainer.innerHTML = '';

  // הוספת תמונות קיימות לתצוגה מקדימה
  property.images.forEach(imageUrl => {
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
            <img src="${imageUrl}" alt="תצוגה מקדימה">
            <button type="button" class="delete-image" data-image-url="${imageUrl}" data-property-id="${
      property.id || ''
    }">
                <i class="fas fa-times"></i>
            </button>
        `;

    previewContainer.appendChild(preview);
  });

  console.log('תצוגה מקדימה עודכנה עבור נכס:', property.id);
}

// הסרת תמונה מתצוגה מקדימה ומרשימת התמונות
async function removeImageFromPreview(imageUrl, propertyId) {
  if (!confirm('האם אתה בטוח שברצונך להסיר תמונה זו?')) return;

  try {
    // אם יש מזהה נכס, נסה למחוק את התמונה מהשרת
    if (propertyId) {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCookie('csrfToken') || '',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה במחיקת התמונה מהשרת');
      }

      console.log('התמונה נמחקה מהשרת בהצלחה');
    }

    // הסרת התצוגה המקדימה מהדף
    const previews = document.querySelectorAll('.image-preview');
    previews.forEach(preview => {
      const img = preview.querySelector('img');
      if (img && img.src.includes(imageUrl)) {
        preview.remove();
      }
    });

    // עדכון שדה הקלט של הקבצים
    const fileInput = document.getElementById('property-images');
    if (fileInput) {
      fileInput.value = '';
    }
  } catch (error) {
    console.error('שגיאה במחיקת התמונה:', error);
    alert(`אירעה שגיאה במחיקת התמונה: ${error.message}`);
  }
}

// ייצוא הפונקציות הנדרשות
export { initImages, setupImageUploadPreview, updateImagePreviews, removeImageFromPreview };
