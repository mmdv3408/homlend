// ניהול העלאת תמונות ותצוגה מקדימה
import { showError, showSuccess, isValidImageFile, isValidFileSize } from './utils.js';

// פונקציה לאתחול מערכת התמונות
export async function initImages() {
    console.log('אתחול מערכת התמונות...');
    try {
        // הגדרת העלאת תמונות
        setupImageUpload();
        console.log('מערכת התמונות אותחלה בהצלחה');
        return true;
    } catch (error) {
        console.error('שגיאה באתחול מערכת התמונות:', error);
        return false;
    }
}

// פונקציה להגדרת העלאת תמונות
function setupImageUpload() {
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
                    <button type="button" class="remove-image" data-type="main">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // הוספת מאזין אירוע לכפתור הסרת תמונה ראשית
                const removeBtn = preview.querySelector('.remove-image');
                if (removeBtn) {
                    removeBtn.addEventListener('click', removeMainImage);
                }
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
                                <button type="button" class="remove-image" data-index="${preview.children.length}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `);
                    };
                    reader.readAsDataURL(file);
                });
            }));
            
            preview.innerHTML += previewItems.join('');
            
            // הוספת מאזיני אירועים לכפתורי הסרת תמונות נוספות
            const removeButtons = preview.querySelectorAll('.remove-image');
            removeButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    removeAdditionalImage(index);
                });
            });
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