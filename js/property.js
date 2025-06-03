// קוד JavaScript לדף נכס בודד
document.addEventListener('DOMContentLoaded', function() {
    console.log('דף הנכס הבודד נטען');
    // טעינת פרטי הנכס
    loadPropertyDetails();
});

// משתנים גלובליים לגלריית התמונות
let allGalleryImages = [];
let currentImageIndex = 0;

// פונקציה לפתיחת המודל של הגלרייה
function openGalleryModal(index) {
    const modal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const currentImageSpan = document.getElementById('current-image');
    const totalImagesSpan = document.getElementById('total-images');
    
    if (!modal || !modalImage || !currentImageSpan || !totalImagesSpan) {
        console.error('לא נמצאו אלמנטים נדרשים למודל הגלרייה');
        return;
    }
    
    if (index >= 0 && index < allGalleryImages.length) {
        currentImageIndex = index;
        modalImage.src = allGalleryImages[index];
        currentImageSpan.textContent = index + 1;
        totalImagesSpan.textContent = allGalleryImages.length;
        
        // הוספת מאזיני אירועים לכפתורי הניווט
        document.getElementById('prev-image').onclick = showPreviousImage;
        document.getElementById('next-image').onclick = showNextImage;
        
        // הוספת מאזין אירוע לכפתור הסגירה
        document.querySelector('.close-modal').onclick = closeGalleryModal;
        
        // הוספת מאזין אירוע למקשי המקלדת
        document.addEventListener('keydown', handleGalleryKeyPress);
        
        modal.style.display = 'flex';
    }
}

// פונקציה לסגירת המודל
function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.removeEventListener('keydown', handleGalleryKeyPress);
    }
}

// פונקציה להצגת התמונה הבאה
function showNextImage() {
    if (allGalleryImages.length <= 1) return;
    
    currentImageIndex = (currentImageIndex + 1) % allGalleryImages.length;
    updateModalImage();
}

// פונקציה להצגת התמונה הקודמת
function showPreviousImage() {
    if (allGalleryImages.length <= 1) return;
    
    currentImageIndex = (currentImageIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
    updateModalImage();
}

// פונקציה לעדכון התמונה במודל
function updateModalImage() {
    const modalImage = document.getElementById('modal-image');
    const currentImageSpan = document.getElementById('current-image');
    
    if (modalImage && currentImageSpan) {
        modalImage.src = allGalleryImages[currentImageIndex];
        currentImageSpan.textContent = currentImageIndex + 1;
    }
}

// פונקציה לטיפול בלחיצות מקשים במודל הגלרייה
function handleGalleryKeyPress(event) {
    if (event.key === 'Escape') {
        closeGalleryModal();
    } else if (event.key === 'ArrowLeft') {
        showNextImage(); // שים לב שבעברית הכיוונים הפוכים
    } else if (event.key === 'ArrowRight') {
        showPreviousImage(); // שים לב שבעברית הכיוונים הפוכים
    }
}

// פונקציה לטעינת פרטי הנכס
async function loadPropertyDetails() {
    // קבלת מזהה הנכס מה-URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    console.log(`מזהה הנכס שהתקבל מה-URL: ${propertyId}`);
    
    if (!propertyId) {
        console.error('לא נמצא מזהה נכס בכתובת');
        showError('לא נמצא מזהה נכס בכתובת');
        return;
    }
    
    // הצגת מסך טעינה
    const loadingOverlay = document.getElementById('property-loading');
    const propertyContainer = document.getElementById('property-container');
    
    if (!loadingOverlay || !propertyContainer) {
        console.error('לא נמצאו אלמנטים נדרשים בדף');
        return;
    }
    
    try {
        console.log(`מתחיל בקשת פרטי נכס עם מזהה: ${propertyId}`);
        
        // בקשת פרטי הנכס מהשרת
        const response = await fetch(`/api/properties/${propertyId}`);
        console.log('תשובה התקבלה מהשרת:', response.status);
        
        if (!response.ok) {
            throw new Error(`הנכס לא נמצא (קוד שגיאה: ${response.status})`);
        }
        
        const property = await response.json();
        console.log('פרטי הנכס התקבלו:', property);
        
        if (!property) {
            throw new Error('התקבלו נתונים ריקים מהשרת');
        }
        
        // יצירת תצוגת הנכס
        renderProperty(property);
        
        // הסתרת מסך הטעינה והצגת תוכן הנכס
        loadingOverlay.style.display = 'none';
        propertyContainer.style.display = 'block';
        
        // טעינת נכסים דומים
        loadSimilarProperties(property);
    } catch (error) {
        console.error('שגיאה בטעינת פרטי הנכס:', error);
        showError(error.message || 'אירעה שגיאה בטעינת פרטי הנכס');
    }
}

// פונקציה להצגת שגיאה
function showError(message) {
    const loadingOverlay = document.getElementById('property-loading');
    const propertyContainer = document.getElementById('property-container');
    
    loadingOverlay.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <a href="properties.html" class="back-button">
                <i class="fas fa-arrow-right"></i>
                חזרה לכל הנכסים
            </a>
        </div>
    `;
}

// פונקציה ליצירת תצוגת הנכס
function renderProperty(property) {
    const propertyContainer = document.getElementById('property-container');
    const propertySection = document.querySelector('.property-details-section');
    
    // טיפול בתמונות - אם אין תמונה, השתמש בתמונת ברירת מחדל
    const mainImage = property.image || 'images/property-placeholder.jpg';
    
    // הכנת מערך של כל התמונות (ראשית + נוספות)
    allGalleryImages = [mainImage];
    // בדיקה גם עבור additionalImages וגם עבור additional_images
    const additionalImages = property.additionalImages || property.additional_images || [];
    if (additionalImages.length > 0) {
        allGalleryImages.push(...additionalImages);
    }
    console.log('נטענו', allGalleryImages.length, 'תמונות בגלרייה');
    
    // פורמט מאפיינים
    const features = property.features || [];
    const featuresHTML = features.length > 0 
        ? features.map(feature => `
            <div class="feature-item">
                <i class="fas fa-check"></i>
                <span>${feature}</span>
            </div>
        `).join('')
        : '<p>אין מאפיינים מיוחדים</p>';
    
    // יצירת Hero Section - נשמר כדי להשתמש בגלריה
    const heroHTML = `
        <div class="property-hero">
            <img src="${mainImage}" alt="${property.title}" class="property-hero-image">
            <div class="property-hero-overlay">
                <div class="property-hero-content">
                    <h1 class="property-hero-title">${property.title || 'נכס ללא כותרת'}</h1>
                    <div class="property-hero-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${property.address || 'כתובת לא ידועה'}
                    </div>
                    <div class="property-hero-price">${property.price || 'מחיר לא ידוע'}</div>
                </div>
            </div>
            <div class="property-view-gallery" onclick="openGalleryModal(0)">
                <i class="fas fa-images"></i>
                צפייה בגלריה
            </div>
        </div>
    `;
    
    // בניית הגלריה
    const galleryHTML = `
        <div class="property-gallery">
            <h2>גלריית תמונות</h2>
            <div class="gallery-grid">
                ${allGalleryImages.map((img, index) => `
                    <div class="gallery-item" onclick="openGalleryModal(${index})">
                        <img src="${img}" alt="${property.title} - תמונה ${index + 1}">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // יצירת תוכן הנכס
    propertyContainer.innerHTML = `
        ${heroHTML}
        
        <div class="back-button-container">
            <a href="properties.html" class="back-button">
                <i class="fas fa-arrow-right"></i>
                חזרה לכל הנכסים
            </a>
        </div>
        
        ${galleryHTML}
        
        <div class="property-content">
            <div class="property-info">
                <div class="property-info-item">
                    <i class="fas fa-home"></i>
                    <span>סוג: ${property.type || 'לא צוין'}</span>
                </div>
                <div class="property-info-item">
                    <i class="fas fa-ruler-combined"></i>
                    <span>שטח: ${property.area || 'לא צוין'} מ"ר</span>
                </div>
                <div class="property-info-item">
                    <i class="fas fa-bed"></i>
                    <span>חדרים: ${property.rooms || 'לא צוין'}</span>
                </div>
                <div class="property-info-item">
                    <i class="fas fa-bath"></i>
                    <span>חדרי רחצה: ${property.bathrooms || 'לא צוין'}</span>
                </div>
            </div>
            
            <div class="property-description">
                <h3>תיאור הנכס</h3>
                <p>${property.description || 'אין תיאור לנכס זה.'}</p>
            </div>
            
            <div class="property-features">
                <h3>מאפיינים</h3>
                <div class="features-list">
                    ${featuresHTML}
                </div>
            </div>
            
            <div class="property-agent">
                <img src="images/agent-placeholder.jpg" alt="תמונת סוכן" class="agent-image">
                <div class="agent-info">
                    <h3>צור קשר עם מתווך</h3>
                    <p>לפרטים נוספים או לתיאום סיור, אנחנו כאן לשירותך</p>
                    <div class="agent-contact">
                        <a href="tel:+972-123456789"><i class="fas fa-phone"></i> התקשר עכשיו</a>
                        <a href="mailto:info@home-lend.co.il"><i class="fas fa-envelope"></i> שלח הודעה</a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- מודל גלריה -->
        <div id="gallery-modal" class="gallery-modal">
            <span class="close-modal">&times;</span>
            <div class="modal-content">
                <img id="modal-image" class="modal-image">
                <div class="modal-navigation">
                    <button id="prev-image" class="nav-button"><i class="fas fa-chevron-right"></i></button>
                    <button id="next-image" class="nav-button"><i class="fas fa-chevron-left"></i></button>
                </div>
                <div class="image-counter">תמונה <span id="current-image">1</span> מתוך <span id="total-images">1</span></div>
            </div>
        </div>
    `;
}
