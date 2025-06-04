// קובץ JavaScript לפאנל הניהול - הום-לנד נכסים

// משתנים גלובליים
let propertiesData = [];
let agentsData = [];

// פונקציה לאתחול הלשוניות
function initTabsMenu() {
    console.log('מאתחל את התפריט והלשוניות');
    
    // ניהול תפריט
    const menuItems = document.querySelectorAll('.admin-menu li');
    const adminSections = document.querySelectorAll('.admin-section');
    const adminTitle = document.querySelector('.admin-title h1');
    
    if (menuItems.length === 0 || adminSections.length === 0 || !adminTitle) {
        console.log('אלמנטי התפריט או האזורים לא נמצאו, מנסה שוב עוד מעט');
        setTimeout(initTabsMenu, 100); // ננסה שוב בעוד 100 מילישניות
        return;
    }
    
    console.log('נמצאו', menuItems.length, 'פריטי תפריט ו-', adminSections.length, 'אזורים');
    
    // ניקוי מאזיני אירועים קיימים
    menuItems.forEach(item => {
        item.style.cursor = 'pointer'; // וידוא שהסמן הוא מצביע
        
        // הסרת מאזין אירועים קיים אם יש
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function() {
            console.log('נלחץ פריט תפריט:', this.textContent.trim());
            
            // מציאת ה-section המתאים
            const sectionId = this.getAttribute('data-section');
            if (!sectionId) {
                console.error('חסר מאפיין data-section בפריט התפריט');
                return;
            }
            
            // הסרת הדגשה מכל פריטי התפריט
            menuItems.forEach(i => i.classList.remove('active'));
            
            // הדגשת הפריט הנוכחי
            this.classList.add('active');
            
            // הסתרת כל האזורים
            adminSections.forEach(section => section.classList.remove('active'));
            
            // הצגת האזור המתאים
            const currentSection = document.getElementById(sectionId + '-section');
            if (currentSection) {
                currentSection.classList.add('active');
                
                // עדכון כותרת העמוד
                switch(sectionId) {
                    case 'dashboard':
                        adminTitle.textContent = 'לוח בקרה';
                        loadDashboardData();
                        break;
                    case 'properties':
                        adminTitle.textContent = 'ניהול נכסים';
                        loadProperties();
                        break;
                    case 'agents':
                        adminTitle.textContent = 'ניהול סוכנים';
                        loadAgents();
                        break;
                    case 'add-property':
                        adminTitle.textContent = 'הוספת נכס';
                        setupPropertyForm();
                        break;
                    case 'add-agent':
                        adminTitle.textContent = 'הוספת סוכן';
                        break;
                    default:
                        adminTitle.textContent = 'פאנל ניהול';
                }
            } else {
                console.error(`לא נמצא אזור עם ID: ${sectionId}-section`);
            }
        });
    });
    
    // בדיקה אם יש פרמטר בכתובת המציין לשונית להצגה
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section) {
        // לחיצה אוטומטית על הלשונית המתאימה
        const targetMenuItem = document.querySelector(`[data-section="${section}"]`);
        if (targetMenuItem) {
            targetMenuItem.click();
        } else {
            // אם אין פרמטר או הפרמטר לא תקין - לחיצה על לשונית ברירת מחדל
            const defaultMenuItem = document.querySelector('[data-section="dashboard"]');
            if (defaultMenuItem) defaultMenuItem.click();
        }
    } else {
        // אם אין פרמטר - לחיצה על לשונית ברירת מחדל
        const defaultMenuItem = document.querySelector('[data-section="dashboard"]');
        if (defaultMenuItem) defaultMenuItem.click();
    }
}

// פונקציה לאתחול אזור ניהול
function initAdmin() {
    console.log('אתחול מערכת הניהול');
    
    // אתחול תפריט וניווט
    initTabsMenu();
    
    // בדיקת המשתמש המחובר
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const username = getCookie('username');
        const name = getCookie('name');
        
        if (username && name) {
            usernameElement.textContent = name;
        }
    }
    
    // אתחול כפתור התנתקות
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/admin/login.html';
                }
            })
            .catch(error => {
                console.error('שגיאה בהתנתקות:', error);
            });
        });
    }
}

// פונקציה למילוי טופס נכס עם נתונים
function fillPropertyForm(property) {
    console.log('ממלא טופס עם נתוני נכס:', property);
    
    const form = document.getElementById('addPropertyForm');
    if (!form) {
        console.error('לא נמצא טופס להוספת נכס');
        return;
    }
    
    // מילוי שדות הטופס
    form.elements['id'].value = property.id || '';
    form.elements['title'].value = property.title || '';
    form.elements['description'].value = property.description || '';
    form.elements['price'].value = property.price || '';
    form.elements['area'].value = property.area || '';
    form.elements['address'].value = property.address || '';
    
    // מילוי שדה שכונה אם קיים
    if (form.elements['neighborhood']) {
        form.elements['neighborhood'].value = property.neighborhood || '';
    }
    
    // בחירת סוג עסקה (מכירה/השכרה)
    if (property.type && form.elements['type']) {
        const typeSelect = form.elements['type'];
        for (let i = 0; i < typeSelect.options.length; i++) {
            if (typeSelect.options[i].value === property.type) {
                typeSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // בחירת מספר חדרים
    if (property.rooms && form.elements['rooms']) {
        const roomsSelect = form.elements['rooms'];
        for (let i = 0; i < roomsSelect.options.length; i++) {
            if (roomsSelect.options[i].value === property.rooms) {
                roomsSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // בחירת קומה
    if (property.floor && form.elements['floor']) {
        const floorSelect = form.elements['floor'];
        for (let i = 0; i < floorSelect.options.length; i++) {
            if (floorSelect.options[i].value === property.floor) {
                floorSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // בחירת סטטוס
    if (property.status && form.elements['status']) {
        const statusSelect = form.elements['status'];
        for (let i = 0; i < statusSelect.options.length; i++) {
            if (statusSelect.options[i].value === property.status) {
                statusSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // בחירת האם נכס חם לעמוד הבית
    if (form.elements['featured']) {
        const featuredSelect = form.elements['featured'];
        const isFeatured = property.featured === true || property.featured === 'true';
        for (let i = 0; i < featuredSelect.options.length; i++) {
            if ((featuredSelect.options[i].value === 'true' && isFeatured) || 
                (featuredSelect.options[i].value === 'false' && !isFeatured)) {
                featuredSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // סימון תיבות סימון של מאפיינים
    if (property.features && Array.isArray(property.features)) {
        document.querySelectorAll('.feature-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = property.features.includes(checkbox.value);
        });
    }
    
    // הצגת תמונות קיימות אם יש
    const mainImagePreview = document.getElementById('main-image-preview');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    // שימוש ב-additionalImages אם קיים, אחרת ב-images
    const allImages = property.additionalImages || property.images || [];
    
    if (mainImagePreview) {
        mainImagePreview.innerHTML = '';
        // תמונה ראשית - משתמשים ב-image אם קיים, אחרת ב-allImages[0]
        let mainImageSrc = property.image || allImages[0];
        if (mainImageSrc) {
            const img = document.createElement('img');
            // תיקון נתיב תמונה אם חסר / בהתחלה
            if (mainImageSrc && !mainImageSrc.startsWith('http') && !mainImageSrc.startsWith('/')) {
                mainImageSrc = '/' + mainImageSrc;
            }
            img.src = mainImageSrc;
            img.className = 'preview-image';
            img.onerror = function() {
                console.error('Error loading main image:', mainImageSrc);
                this.style.display = 'none';
            };
            mainImagePreview.appendChild(img);
        }
    }
    
    if (additionalImagesPreview) {
        additionalImagesPreview.innerHTML = '';
        
        // אם יש שדה image נפרד, משתמשים בכל המערך allImages כתמונות נוספות
        // אם אין, משתמשים במערך מ-1 והלאה
        const additionalImages = property.image ? allImages : (allImages.length > 1 ? allImages.slice(1) : []);
        
        // הצגת התמונות הנוספות
        additionalImages.forEach((imgSrc) => {
            if (!imgSrc) return;
            
            const img = document.createElement('img');
            // תיקון נתיב תמונה אם חסר / בהתחלה
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                imgSrc = '/' + imgSrc;
            }
            img.src = imgSrc;
            img.className = 'preview-image';
            img.onerror = function() {
                console.error('Error loading additional image:', imgSrc);
                this.style.display = 'none';
            };
            additionalImagesPreview.appendChild(img);
        });
    }
    
    // שמירת נתיבי התמונות הקיימות בשדה מוסתר
    const imagesInput = document.createElement('input');
    imagesInput.type = 'hidden';
    imagesInput.name = 'images';
    imagesInput.value = JSON.stringify(property.images || property.additionalImages || []);
    form.appendChild(imagesInput);
    
    // עדכון כפתור השליחה
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'עדכן נכס';
    }
}

// פונקציה לאתחול טופס הנכס
function setupPropertyForm() {
    const addPropertyForm = document.getElementById('addPropertyForm');
    if (!addPropertyForm) return;
    
    // איפוס הטופס
    addPropertyForm.reset();
    
    // עדכון כפתור השליחה
    const submitBtn = addPropertyForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'הוסף נכס';
    }
    
    // איפוס שדה ה-ID
    const idField = addPropertyForm.elements['id'];
    if (idField) {
        idField.value = '';
    }
}

// פונקציה להגדרת תצוגה מקדימה של תמונות
function setupImageUploadPreview() {
    // תצוגה מקדימה לתמונה ראשית
    const mainImageInput = document.getElementById('property-main-image');
    const mainImagePreview = document.getElementById('main-image-preview');
    
    if (mainImageInput && mainImagePreview) {
        mainImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                mainImagePreview.innerHTML = ''; // נקה את התצוגה המקדימה הקיימת
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '200px';
                    mainImagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // תצוגה מקדימה לתמונות נוספות
    const additionalImagesInput = document.getElementById('property-additional-images');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesInput && additionalImagesPreview) {
        additionalImagesInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                for (let i = 0; i < this.files.length; i++) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'preview-image';
                        img.style.width = '60px';
                        img.style.height = '60px';
                        img.style.objectFit = 'cover';
                        img.style.border = '1px solid #e0e0e0';
                        img.style.borderRadius = '4px';
                        img.style.padding = '2px';
                        img.style.background = 'white';
                        img.style.margin = '2px';
                        
                        additionalImagesPreview.appendChild(img);
                    };
                    
                    reader.readAsDataURL(this.files[i]);
                }
            }
        });
    }
}

// פונקציה לטעינת נתוני לוח בקרה
function loadDashboardData() {
    console.log('טוען נתונים ללוח בקרה');
    
    // טעינת נתוני נכסים מהשרת
    fetch('/api/properties')
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נכסים');
            }
            return response.json();
        })
        .then(properties => {
            // שמירת נתוני הנכסים
            propertiesData = properties;
            
            // עדכון מספר הנכסים הכולל
            document.getElementById('totalProperties').textContent = properties.length;
            
            // ספירת נכסים פעילים
            const activeProperties = properties.filter(p => p.status === 'פעיל').length;
            document.getElementById('activeProperties').textContent = activeProperties;
            
            // ספירת נכסים שנמכרו
            const soldProperties = properties.filter(p => p.status === 'נמכר').length;
            document.getElementById('soldProperties').textContent = soldProperties;
        })
        .catch(error => {
            console.error('שגיאה בטעינת נתונים ללוח המחוונים:', error);
        });
}

// טעינת נכסים מהשרת לטבלת הנכסים
function loadProperties() {
    const propertiesTableBody = document.getElementById('propertiesTableBody');
    if (!propertiesTableBody) return;

    // איפוס הטבלה והצגת מצב טעינה
    propertiesTableBody.innerHTML = '<tr><td colspan="10" class="loading-row"><div class="loading-spinner"></div> טוען נכסים...</td></tr>';

    // שליפת נתוני נכסים מהשרת
    fetch('/api/properties')
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נכסים');
            }
            return response.json();
        })
        .then(properties => {
            // שמירת הנתונים במשתנה הגלובלי
            propertiesData = Array.isArray(properties) ? properties : [];
            // שמירת המידע במשתנה הגלובלי
            propertiesData = properties;
            
            if (properties && properties.length > 0) {
                // ניקוי הטבלה
                propertiesTableBody.innerHTML = '';
                
                // הצגת הנכסים בטבלה
                let tableHTML = '';
                propertiesData.forEach((property, index) => {
                    let statusClass = 'status-active';
                    if (property.status === 'נמכר') {
                        statusClass = 'status-sold';
                    } else if (property.status === 'טיוטה') {
                        statusClass = 'status-draft';
                    }
                    
                    tableHTML += `
                        <tr>
                            <td><img src="${property.image || '../images/placeholder.jpg'}" alt="${property.title}" class="property-thumbnail"></td>
                            <td>${property.title}</td>
                            <td>${property.type || 'לא צוין'}</td>
                            <td>${property.price}</td>
                            <td>${property.date || new Date().toLocaleDateString()}</td>
                            <td><span class="status-badge ${statusClass}">${property.status || 'פעיל'}</span></td>
                            <td class="table-actions">
                                <button class="action-btn edit-btn" data-id="${property.id}" title="ערוך"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete-btn" data-id="${property.id}" title="מחק"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `;
                });

                propertiesTableBody.innerHTML = tableHTML || '<tr><td colspan="10" class="text-center py-3">לא נמצאו נכסים</td></tr>';
                
                // הוספת אירועי לחיצה לכפתורים
                addPropertyEventListeners();
                
                // עדכון המשתנה הגלובלי
                window.currentProperties = propertiesData;
            } else {
                // אין נכסים
                propertiesTableBody.innerHTML = '<tr><td colspan="10" class="empty-row">לא נמצאו נכסים</td></tr>';
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת נכסים:', error);
            propertiesTableBody.innerHTML = `<tr><td colspan="8" class="error-row">שגיאה בטעינת נכסים: ${error.message}</td></tr>`;
        });
}

// אתחול טופס הוספת ועריכת נכסים
document.addEventListener('DOMContentLoaded', function() {
    console.log('אתחול טופס הוספת נכס');
    
    const addPropertyForm = document.getElementById('addPropertyForm');
    if (addPropertyForm) {
        // הסרת מאזינים קודמים למניעת כפילויות
        const newForm = addPropertyForm.cloneNode(true);
        addPropertyForm.parentNode.replaceChild(newForm, addPropertyForm);
        
        // הוספת מאזין חדש
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('שליחת טופס נכס');
            
            // יצירת אובייקט FormData חדש
            const formData = new FormData();
            const mainImageInput = document.getElementById('property-main-image');
            const additionalImagesInput = document.getElementById('property-additional-images');
            let hasNewImages = false;
            let uploadedImageUrls = [];
            
            // העלאת תמונות אם יש חדשות
            const uploadPromises = [];
            
            // טיפול בתמונות ראשיות חדשות
            if (mainImageInput && mainImageInput.files.length > 0) {
                hasNewImages = true;
                const uploadFormData = new FormData();
                for (let i = 0; i < mainImageInput.files.length; i++) {
                    uploadFormData.append('images', mainImageInput.files[i]);
                }
                
                uploadPromises.push(
                    fetch('/api/upload-images', {
                        method: 'POST',
                        body: uploadFormData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.files) {
                            uploadedImageUrls = [...uploadedImageUrls, ...data.files];
                        }
                    })
                );
            }
            
            // טיפול בתמונות נוספות חדשות
            if (additionalImagesInput && additionalImagesInput.files.length > 0) {
                hasNewImages = true;
                const uploadFormData = new FormData();
                for (let i = 0; i < additionalImagesInput.files.length; i++) {
                    uploadFormData.append('images', additionalImagesInput.files[i]);
                }
                
                uploadPromises.push(
                    fetch('/api/upload-images', {
                        method: 'POST',
                        body: uploadFormData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.files) {
                            uploadedImageUrls = [...uploadedImageUrls, ...data.files];
                        }
                    })
                );
            }
            
            // המתן להשלמת העלאת כל הקבצים
            Promise.all(uploadPromises)
                .then(() => {
                    // יצירת אובייקט FormData חדש
                    const formData = new FormData();
                    
                    // הוספת כל שדות הטופס
                    const formElements = this.elements;
                    for (let i = 0; i < formElements.length; i++) {
                        const element = formElements[i];
                        if (element.name && element.name !== 'images' && element.name !== 'features[]' && element.type !== 'file') {
                            if (element.value !== '') {
                                formData.append(element.name, element.value);
                            }
                        }
                    }
                    
                    // הוספת המאפיינים כמערך JSON
                    const selectedFeatures = [];
                    document.querySelectorAll('.feature-checkbox:checked').forEach(checkbox => {
                        if (checkbox.value) {
                            selectedFeatures.push(checkbox.value);
                        }
                    });
                    
                    formData.append('features', JSON.stringify(selectedFeatures));
                    
                    // הוספת כתובות התמונות שהועלו
                    if (hasNewImages && uploadedImageUrls.length > 0) {
                        formData.append('keepExistingImages', 'false');
                        formData.append('newImages', JSON.stringify(uploadedImageUrls));
                    } else {
                        formData.append('keepExistingImages', 'true');
                    }
                    
                    // שליחת הנתונים לשרת
                    let url = '/api/properties';
                    let method = 'POST';
                    
                    // אם זה עדכון נכס קיים
                    const propertyId = document.getElementById('property-id').value;
                    if (propertyId) {
                        url = `/api/properties/${propertyId}`;
                        method = 'PUT';
                    }
                    
                    // הדפסת נתוני הטופס לבדיקה
                    console.log('שליחת נתוני טופס:');
                    for (let pair of formData.entries()) {
                        console.log(pair[0] + ':', pair[1]);
                    }
                    
                    // שליחת הבקשה לשרת
                    return fetch(url, {
                        method: method,
                        body: formData
                    });
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
                        alert('הנכס נשמר בהצלחה!');
                        
                        // עדכון רשימת הנכסים
                        console.log('טוען מחדש את רשימת הנכסים...');
                        loadProperties().then(() => {
                            console.log('רשימת הנכסים נטענה מחדש');
                            // איפוס הטופס
                            document.getElementById('addPropertyForm').reset();
                            
                            // עדכון תצוגת התמונות
                            updateImagePreviews(data.property);
                            
                            // מעבר לכרטיסיית הנכסים
                            const propertiesTab = document.getElementById('properties-tab');
                            if (propertiesTab) {
                                propertiesTab.click();
                            }
                        });
                    } else {
                        throw new Error(data.error || 'אירעה שגיאה בשמירת הנכס');
                    }
                })
                .catch(error => {
                    console.error('שגיאה בשליחת הנכס:', error);
                    alert('אירעה שגיאה בשמירת הנכס: ' + error.message);
                });
        });
    }
});

// פונקציה לעדכון תצוגת התמונות
function updateImagePreviews(property) {
    console.log('מעדכן תצוגת תמונות עבור נכס:', property);
    
    const mainImagePreview = document.getElementById('main-image-preview');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    // ניקוי התצוגה הנוכחית
    if (mainImagePreview) mainImagePreview.innerHTML = '';
    if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
    
    if (!property || !property.images || !Array.isArray(property.images)) {
        console.log('אין תמונות להציג');
        return;
    }
    
    console.log('תמונות נטענו:', property.images);
    
    // הצגת התמונה הראשית (אם קיימת)
    if (property.images.length > 0 && mainImagePreview) {
        const img = document.createElement('img');
        let imgSrc = property.images[0];
        
        // תיקון נתיב תמונה אם חסר / בהתחלה
        if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
            imgSrc = '/' + imgSrc;
        }
        
        img.src = imgSrc;
        img.className = 'preview-image';
        img.onerror = function() {
            console.error('Error loading main image:', imgSrc);
            this.style.display = 'none';
        };
        mainImagePreview.appendChild(img);
    }
    
    // הצגת שאר התמונות כתמונות נוספות
    if (property.images.length > 1 && additionalImagesPreview) {
        const additionalImages = property.images.slice(1);
        
        additionalImages.forEach((imgSrc, index) => {
            if (!imgSrc) return;
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'additional-image-container';
            
            const img = document.createElement('img');
            
            // תיקון נתיב תמונה אם חסר / בהתחלה
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                imgSrc = '/' + imgSrc;
            }
            
            img.src = imgSrc;
            img.className = 'preview-image';
            img.onerror = function() {
                console.error('Error loading additional image:', imgSrc);
                this.style.display = 'none';
            };
            
            imgContainer.appendChild(img);
            additionalImagesPreview.appendChild(imgContainer);
        });
    }
}

// פונקציה למחיקת נכס
function deleteProperty(propertyId) {
    if (!propertyId) return;
    
    if (confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) {
        // שליחת בקשת מחיקה לשרת
        fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('הנכס נמחק בהצלחה');
                // מחיקת השורה מהטבלה
                const row = document.querySelector(`.delete-btn[data-id="${propertyId}"]`)?.closest('tr');
                if (row) {
                    row.remove();
                }
                // טעינה מחדש של הנכסים
                loadProperties();
            } else {
                alert(`שגיאה במחיקת הנכס: ${data.error || 'אירעה שגיאה לא מוגדרת'}`);
            }
        })
        .catch(error => {
            console.error('שגיאה במחיקת הנכס:', error);
            alert('אירעה שגיאה במחיקת הנכס, נסה שנית מאוחר יותר');
        });
    }
}

// הוספת אירועי לחיצה לכפתורי נכסים
function addPropertyEventListeners() {
    // אירועי לחיצה לכפתורי עריכה
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            console.log(`פתיחת עריכה לנכס ${propertyId}`);
            
            // מעבר לאזור עריכת נכס
            const menuItems = document.querySelectorAll('.admin-menu li');
            const adminSections = document.querySelectorAll('.admin-section');
            const adminTitle = document.querySelector('.admin-title h1');
            
            menuItems.forEach(i => i.classList.remove('active'));
            const addPropertyMenuItem = document.querySelector('[data-section="add-property"]');
            if (addPropertyMenuItem) {
                addPropertyMenuItem.classList.add('active');
            }
            
            adminSections.forEach(s => s.classList.remove('active'));
            const addPropertySection = document.getElementById('add-property-section');
            if (addPropertySection) {
                addPropertySection.classList.add('active');
            }
            
            if (adminTitle) {
                adminTitle.textContent = 'עריכת נכס';
            }
            
            // מציאת הנכס לעריכה - מחפשים במערך המקורי מהשרת
            fetch(`/api/properties/${propertyId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('שגיאה בטעינת פרטי הנכס');
                    }
                    return response.json();
                })
                .then(property => {
                    if (property) {
                        // עדכון המערך המקומי עם הנתונים העדכניים מהשרת
                        const index = propertiesData.findIndex(p => String(p.id) === String(propertyId));
                        if (index !== -1) {
                            propertiesData[index] = property;
                        } else {
                            propertiesData.push(property);
                        }
                        
                        // מילוי הטופס עם נתוני הנכס
                        fillPropertyForm(property);
                    } else {
                        throw new Error('לא נמצאו נתונים עבור נכס זה.');
                    }
                })
                .catch(error => {
                    console.error('שגיאה בטעינת פרטי הנכס:', error);
                    alert('אירעה שגיאה בטעינת פרטי הנכס. נסה לרענן את הדף.');
                });
        });
    });
    
    // אירועי לחיצה לכפתורי מחיקה
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            deleteProperty(propertyId);
        });
    });
}

// טעינת סוכנים מהשרת לטבלת הסוכנים
function loadAgents() {
    const agentsTableBody = document.getElementById('agentsTableBody');
    if (!agentsTableBody) return;

    // איפוס הטבלה והצגת מצב טעינה
    agentsTableBody.innerHTML = '<tr><td colspan="6" class="loading-row"><div class="loading-spinner"></div> טוען סוכנים...</td></tr>';

    // שליפת נתוני סוכנים מהשרת
    fetch('/api/agents')
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת סוכנים');
            }
            return response.json();
        })
        .then(agents => {
            // שמירת המידע במשתנה הגלובלי
            agentsData = agents;
            
            if (agents && agents.length > 0) {
                // ניקוי הטבלה
                agentsTableBody.innerHTML = '';
                
                // הוספת שורות לטבלה
                agents.forEach(agent => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><img src="${agent.image || '../images/agents/placeholder.jpg'}" alt="${agent.name}" class="agent-thumbnail"></td>
                        <td>${agent.name}</td>
                        <td>${agent.phone || 'לא צוין'}</td>
                        <td>${agent.email || 'לא צוין'}</td>
                        <td class="table-actions">
                            <button class="action-btn edit-agent-btn" data-id="${agent.id}" title="ערוך"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-agent-btn" data-id="${agent.id}" title="מחק"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                    
                    agentsTableBody.appendChild(row);
                });
                
                // הוספת אירועי לחיצה לכפתורי עריכה ומחיקה
                addAgentEventListeners();
            } else {
                // אין סוכנים
                agentsTableBody.innerHTML = '<tr><td colspan="6" class="empty-row">לא נמצאו סוכנים</td></tr>';
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת סוכנים:', error);
            agentsTableBody.innerHTML = `<tr><td colspan="6" class="error-row">שגיאה בטעינת סוכנים: ${error.message}</td></tr>`;
        });
}

// הוספת אירועי לחיצה לכפתורי סוכנים
function addAgentEventListeners() {
    document.querySelectorAll('.edit-agent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const agentId = this.getAttribute('data-id');
            alert(`עריכת סוכן מספר ${agentId}`);
            // כאן תהיה פתיחת טופס עריכה עם נתוני הסוכן
        });
    });
    
    document.querySelectorAll('.delete-agent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const agentId = this.getAttribute('data-id');
            if (confirm(`האם אתה בטוח שברצונך למחוק את הסוכן מספר ${agentId}?`)) {
                // כאן תהיה פעולת המחיקה מול השרת
                alert('הסוכן נמחק בהצלחה');
                this.closest('tr').remove();
            }
        });
    });
}

// פונקציה לקבלת ערך עוגייה
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// הפעלת אתחול כאשר הדף נטען
document.addEventListener('DOMContentLoaded', function() {
    // אתחול המערכת
    initAdmin();
    
    // הפעלת טיפול בתמונות
    setupImageUploadPreview();
});
