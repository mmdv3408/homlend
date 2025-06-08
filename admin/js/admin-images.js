/**
 * admin-images.js
 * מודול לניהול תמונות במערכת הניהול
 */

import { showError } from './admin-utils.js';

// משתנים גלובליים למודול
let uploadedImageUrls = [];

// פונקציה להגדרת תצוגה מקדימה של תמונות
function setupImageUploadPreview() {
    console.log('מגדיר תצוגה מקדימה של תמונות');
    
    // תמונה ראשית
    const mainImageInput = document.getElementById('property-main-image');
    const mainPreview = document.getElementById('main-image-preview');
    
    if (mainImageInput && mainPreview) {
        mainImageInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    mainPreview.innerHTML = `
                        <div class="image-preview-item main-image">
                            <img src="${e.target.result}" alt="תמונה ראשית">
                            <div class="image-actions">
                                <button type="button" class="remove-image" data-target="main"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    `;
                    
                    // אירוע לכפתור הסרת התמונה
                    addRemoveImageListeners();
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // תמונות נוספות
    const additionalImagesInput = document.getElementById('property-additional-images');
    const additionalPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesInput && additionalPreview) {
        additionalImagesInput.addEventListener('change', function(e) {
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imageItem = document.createElement('div');
                        imageItem.className = 'image-preview-item';
                        imageItem.innerHTML = `
                            <img src="${e.target.result}" alt="תמונה נוספת">
                            <div class="image-actions">
                                <button type="button" class="remove-image" data-index="${Date.now()}"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        `;
                        
                        additionalPreview.appendChild(imageItem);
                    };
                    
                    reader.readAsDataURL(file);
                });
                
                // אירוע לכפתור הסרת תמונות
                setTimeout(addRemoveImageListeners, 100);
            }
        });
    }
}

// פונקציה לעדכון תצוגת התמונות מנתוני נכס
function updateImagePreviews(property) {
    if (!property) {
        console.warn('לא התקבל אובייקט נכס תקין');
        return;
    }
    
    try {
        // עדכון תמונה ראשית
        const mainPreview = document.getElementById('main-image-preview');
        if (mainPreview && property.mainImage) {
            mainPreview.innerHTML = `
                <div class="image-preview-item main-image">
                    <img src="${property.mainImage}" alt="תמונה ראשית" onerror="this.src='../images/placeholder.jpg';">
                    <div class="image-actions">
                        <button type="button" class="remove-image" data-target="main"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        } else if (mainPreview) {
            mainPreview.innerHTML = '<div class="no-image">לא נמצאה תמונה ראשית</div>';
        }
        
        // עדכון תמונות נוספות
        const additionalPreview = document.getElementById('additional-images-preview');
        if (additionalPreview && property.additionalImages && Array.isArray(property.additionalImages)) {
            additionalPreview.innerHTML = ''; // ניקוי תמונות קודמות
            
            property.additionalImages.forEach((image, index) => {
                if (!image) return;
                
                const imageItem = document.createElement('div');
                imageItem.className = 'image-preview-item';
                imageItem.innerHTML = `
                    <img src="${image}" alt="תמונה נוספת ${index + 1}" onerror="this.src='../images/placeholder.jpg';">
                    <div class="image-actions">
                        <button type="button" class="remove-image" data-url="${image}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                
                additionalPreview.appendChild(imageItem);
            });
        } else if (additionalPreview) {
            additionalPreview.innerHTML = ''; // ניקוי תצוגה אם אין תמונות
        }
        
        // הוספת אירועים לכפתורי הסרה
        addRemoveImageListeners();
        
    } catch (error) {
        console.error('שגיאה בעדכון תצוגת התמונות:', error);
    }
}

// פונקציה להוספת מאזיני אירועים לכפתורי הסרת תמונות
function addRemoveImageListeners() {
    document.querySelectorAll('.remove-image').forEach(btn => {
        // מניעת הוספה כפולה של מאזינים - הסרה והוספה מחדש
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('data-target');
            const url = this.getAttribute('data-url');
            
            if (target === 'main') {
                // הסרת תמונה ראשית
                const mainPreview = document.getElementById('main-image-preview');
                const mainImageInput = document.getElementById('property-main-image');
                
                if (mainPreview) {
                    mainPreview.innerHTML = '<div class="no-image">לא נבחרה תמונה</div>';
                }
                
                if (mainImageInput) {
                    mainImageInput.value = ''; // איפוס שדה הקלט
                }
                
                // הוספת שדה מוסתר לציון הסרת התמונה הראשית
                const removeMainImageField = document.getElementById('remove-main-image');
                if (!removeMainImageField) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.id = 'remove-main-image';
                    input.name = 'removeMainImage';
                    input.value = 'true';
                    document.getElementById('addPropertyForm').appendChild(input);
                }
            } else if (url) {
                // הסרת תמונה נוספת לפי URL
                this.closest('.image-preview-item').remove();
                
                // הוספת URL לרשימת התמונות להסרה
                const removedImages = document.getElementById('removed-images');
                if (!removedImages) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.id = 'removed-images';
                    input.name = 'removedImages';
                    input.value = JSON.stringify([url]);
                    document.getElementById('addPropertyForm').appendChild(input);
                } else {
                    let images = [];
                    try {
                        images = JSON.parse(removedImages.value);
                        images.push(url);
                        removedImages.value = JSON.stringify(images);
                    } catch (e) {
                        removedImages.value = JSON.stringify([url]);
                    }
                }
            } else {
                // הסרת תמונה נוספת חדשה
                this.closest('.image-preview-item').remove();
            }
        });
    });
}

// פונקציה להעלאת תמונות לשרת
function uploadImages(files, type = 'additional') {
    if (!files || files.length === 0) {
        return Promise.resolve([]);
    }
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('images', file);
    });
    
    return fetch('/api/upload-images', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('שגיאה בהעלאת תמונות');
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.files) {
            uploadedImageUrls = [...uploadedImageUrls, ...data.files];
            return data.files;
        }
        throw new Error('שגיאה בפענוח תגובת שרת');
    })
    .catch(error => {
        console.error('שגיאה בהעלאת תמונות:', error);
        showError(`שגיאה בהעלאת תמונות: ${error.message}`);
        return [];
    });
}

// פונקציה להכנת תמונות לפני שליחת טופס
function prepareImagesForSubmit(form) {
    // אם אין טופס, לא עושים כלום
    if (!form) return;
    
    // תמונה ראשית
    const mainImageInput = document.getElementById('property-main-image');
    const mainImagePromise = mainImageInput && mainImageInput.files.length > 0 
        ? uploadImages([mainImageInput.files[0]], 'main') 
        : Promise.resolve([]);
    
    // תמונות נוספות
    const additionalImagesInput = document.getElementById('property-additional-images');
    const additionalImagesPromise = additionalImagesInput && additionalImagesInput.files.length > 0 
        ? uploadImages(additionalImagesInput.files, 'additional') 
        : Promise.resolve([]);
    
    // החזרת Promise שיושלם כאשר כל התמונות הועלו
    return Promise.all([mainImagePromise, additionalImagesPromise])
        .then(([mainImageUrls, additionalImageUrls]) => {
            // הוספת URL של התמונה הראשית אם הועלתה
            if (mainImageUrls.length > 0) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'mainImageUrl';
                input.value = mainImageUrls[0];
                form.appendChild(input);
            }
            
            // הוספת URLs של תמונות נוספות אם הועלו
            if (additionalImageUrls.length > 0) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'additionalImageUrls';
                input.value = JSON.stringify(additionalImageUrls);
                form.appendChild(input);
            }
            
            return {
                mainImage: mainImageUrls[0] || null,
                additionalImages: additionalImageUrls
            };
        });
}

// פונקציה לאיפוס מצב תמונות
function resetImageState() {
    uploadedImageUrls = [];
}

// יצוא פונקציות
export {
    setupImageUploadPreview,
    updateImagePreviews,
    addRemoveImageListeners,
    uploadImages,
    prepareImagesForSubmit,
    resetImageState
};
