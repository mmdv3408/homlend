// ניהול העלאת תמונות ותצוגה מקדימה
import { showError, showSuccess, isValidImageFile, isValidFileSize } from './utils.js';

// פונקציה להגדרת העלאת תמונות
export function setupImageUpload() {
    const mainImageInput = document.getElementById('property-main-image');
    const additionalImagesInput = document.getElementById('property-additional-images');
    
    if (mainImageInput) {
        mainImageInput.addEventListener('change', handleMainImageUpload);
    }
    
    if (additionalImagesInput) {
        additionalImagesInput.addEventListener('change', handleAdditionalImagesUpload);
    }
}

// פונקציה לטיפול בהעלאת תמונה ראשית
async function handleMainImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        // בדיקת תקינות הקובץ
        if (!isValidImageFile(file)) {
            throw new Error('ניתן להעלות קבצי תמונה בלבד (jpg, jpeg, png, gif)');
        }
        
        if (!isValidFileSize(file)) {
            throw new Error('גודל הקובץ חורג מהמותר (10MB מקסימום)');
        }
        
        // הצגת תצוגה מקדימה
        const preview = document.getElementById('main-image-preview');
        if (preview) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="תמונה ראשית">
                    <button type="button" class="remove-image" onclick="removeMainImage()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        }
        
    } catch (error) {
        console.error('שגיאה בהעלאת תמונה ראשית:', error);
        showError(error.message);
        event.target.value = ''; // ניקוי הקובץ שנבחר
    }
}

// פונקציה לטיפול בהעלאת תמונות נוספות
async function handleAdditionalImagesUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    try {
        // בדיקת תקינות הקבצים
        for (const file of files) {
            if (!isValidImageFile(file)) {
                throw new Error('ניתן להעלות קבצי תמונה בלבד (jpg, jpeg, png, gif)');
            }
            
            if (!isValidFileSize(file)) {
                throw new Error('גודל הקובץ חורג מהמותר (10MB מקסימום)');
            }
        }
        
        // הצגת תצוגה מקדימה
        const preview = document.getElementById('additional-images-preview');
        if (preview) {
            const previewItems = await Promise.all(files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        resolve(`
                            <div class="image-preview-item">
                                <img src="${e.target.result}" alt="תמונה נוספת">
                                <button type="button" class="remove-image" onclick="removeAdditionalImage(${preview.children.length})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `);
                    };
                    reader.readAsDataURL(file);
                });
            }));
            
            preview.innerHTML += previewItems.join('');
        }
        
    } catch (error) {
        console.error('שגיאה בהעלאת תמונות נוספות:', error);
        showError(error.message);
        event.target.value = ''; // ניקוי הקבצים שנבחרו
    }
}

// פונקציה להסרת תמונה ראשית
export function removeMainImage() {
    const preview = document.getElementById('main-image-preview');
    const input = document.getElementById('property-main-image');
    
    if (preview) {
        preview.innerHTML = '';
    }
    
    if (input) {
        input.value = '';
    }
}

// פונקציה להסרת תמונה נוספת
export function removeAdditionalImage(index) {
    const preview = document.getElementById('additional-images-preview');
    const input = document.getElementById('property-additional-images');
    
    if (preview && preview.children[index]) {
        preview.children[index].remove();
    }
    
    if (input) {
        input.value = '';
    }
} 