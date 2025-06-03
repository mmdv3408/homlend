import { fetchWithErrorHandling, showSuccess, showError, normalizeImages } from './utils.js';

// Global variables
let propertiesData = [];

/**
 * Load properties from the server and display them in the table
 */
export async function loadProperties() {
    const propertiesTableBody = document.getElementById('propertiesTableBody');
    if (!propertiesTableBody) return;

    // Show loading state
    propertiesTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-row">
                <div class="loading-spinner"></div> טוען נכסים...
            </td>
        </tr>`;

    try {
        // Fetch properties from the server
        const data = await fetchWithErrorHandling('/api/properties');
        propertiesData = data.properties || [];

        if (propertiesData.length > 0) {
            renderPropertiesTable(propertiesTableBody, propertiesData);
        } else {
            propertiesTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">לא נמצאו נכסים</td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        propertiesTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="error-row">
                    שגיאה בטעינת נכסים: ${error.message || 'אירעה שגיאה'}
                </td>
            </tr>`;
    }
}

/**
 * Render properties table
 * @param {HTMLElement} container - Table body element
 * @param {Array} properties - Array of property objects
 */
function renderPropertiesTable(container, properties) {
    container.innerHTML = properties.map(property => {
        const statusClass = getStatusClass(property.status);
        
        return `
            <tr data-id="${property.id}">
                <td>
                    <img src="${property.image || '../images/placeholder.jpg'}" 
                         alt="${property.title}" 
                         class="property-thumbnail">
                </td>
                <td>${property.title}</td>
                <td>${property.type || 'לא צוין'}</td>
                <td>${formatPrice(property.price)}</td>
                <td>${formatDate(property.date)}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${property.status || 'פעיל'}
                    </span>
                </td>
                <td class="table-actions">
                    <button class="action-btn edit-btn" data-id="${property.id}" 
                            title="ערוך">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${property.id}" 
                            title="מחק">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');

    // Add event listeners
    addPropertyEventListeners();
}

/**
 * Get CSS class for status badge
 * @param {string} status - Property status
 * @returns {string} - CSS class
 */
function getStatusClass(status) {
    switch (status) {
        case 'נמכר': return 'status-sold';
        case 'טיוטה': return 'status-draft';
        default: return 'status-active';
    }
}

/**
 * Format price with thousands separator
 * @param {number} price - Property price
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
    if (!price) return '0 ₪';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('ILS', '₪');
}

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString('he-IL');
    return new Date(dateString).toLocaleDateString('he-IL');
}

/**
 * Add event listeners for property actions
 */
function addPropertyEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditProperty);
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteProperty);
    });
}

/**
 * Handle edit property button click
 * @param {Event} e - Click event
 */
async function handleEditProperty(e) {
    const propertyId = e.currentTarget.getAttribute('data-id');
    console.log(`Editing property ${propertyId}`);
    
    try {
        // Show loading state
        const property = await fetchWithErrorHandling(`/api/properties/${propertyId}`);
        
        // Switch to edit mode
        switchToEditMode();
        
        // Fill the form with property data
        fillPropertyForm(property);
        
        // Scroll to form
        document.getElementById('property-form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading property:', error);
        showError(`שגיאה בטעינת פרטי הנכס: ${error.message}`);
    }
}

/**
 * Handle delete property button click
 * @param {Event} e - Click event
 */
async function handleDeleteProperty(e) {
    const propertyId = e.currentTarget.getAttribute('data-id');
    if (!confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) return;
    
    try {
        await fetchWithErrorHandling(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        // Remove from UI
        const row = e.currentTarget.closest('tr');
        if (row) row.remove();
        
        // Show success message
        showSuccess('הנכס נמחק בהצלחה');
    } catch (error) {
        console.error('Error deleting property:', error);
        showError(`שגיאה במחיקת הנכס: ${error.message}`);
    }
}

/**
 * Switch to property edit mode
 */
function switchToEditMode() {
    // Update UI to show we're in edit mode
    const formSection = document.getElementById('property-form-section');
    const formTitle = document.getElementById('property-form-title');
    const submitBtn = document.getElementById('property-submit-btn');
    
    if (formSection) formSection.classList.add('editing');
    if (formTitle) formTitle.textContent = 'עריכת נכס';
    if (submitBtn) submitBtn.textContent = 'עדכן נכס';
    
    // Scroll to form
    formSection?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset property form to add new property mode
 */
export function resetPropertyForm() {
    const form = document.getElementById('property-form');
    if (!form) return;
    
    form.reset();
    
    // Reset file inputs
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => { input.value = ''; });
    
    // Reset image previews
    const previews = form.querySelectorAll('.image-preview');
    previews.forEach(preview => { preview.innerHTML = ''; });
    
    // Reset form mode
    const formSection = document.getElementById('property-form-section');
    const formTitle = document.getElementById('property-form-title');
    const submitBtn = document.getElementById('property-submit-btn');
    
    if (formSection) formSection.classList.remove('editing');
    if (formTitle) formTitle.textContent = 'הוספת נכס חדש';
    if (submitBtn) submitBtn.textContent = 'הוסף נכס';
    
    // Remove any existing ID
    const idInput = form.querySelector('input[name="id"]');
    if (idInput) idInput.value = '';
}

/**
 * Fill property form with data
 * @param {Object} property - Property data
 */
export function fillPropertyForm(property) {
    const form = document.getElementById('property-form');
    if (!form) return;
    
    console.log('Filling form with property:', property);
    
    // Set basic fields
    const fields = ['id', 'title', 'description', 'price', 'area', 'address', 'neighborhood', 'type', 'rooms', 'floor', 'status'];
    fields.forEach(field => {
        const input = form.elements[field];
        if (input && property[field] !== undefined) {
            input.value = property[field];
        }
    });
    
    // Handle featured status
    const featuredSelect = form.elements['featured'];
    if (featuredSelect) {
        const isFeatured = property.featured === true || property.featured === 'true';
        for (let i = 0; i < featuredSelect.options.length; i++) {
            if ((featuredSelect.options[i].value === 'true' && isFeatured) || 
                (featuredSelect.options[i].value === 'false' && !isFeatured)) {
                featuredSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Handle features checkboxes
    if (property.features && Array.isArray(property.features)) {
        document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
            checkbox.checked = property.features.includes(checkbox.value);
        });
    }
    
    // Handle images
    const images = normalizeImages(property.images || []);
    console.log('Normalized images:', images);
    
    const mainImagePreview = document.getElementById('main-image-preview');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    // Clear existing previews and hidden inputs
    if (mainImagePreview) mainImagePreview.innerHTML = '';
    if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
    
    // Remove existing image inputs
    document.querySelectorAll('input[name^="existingImages"]').forEach(input => input.remove());
    
    // Add main image if exists
    if (images[0]) {
        const img = document.createElement('img');
        const imgSrc = images[0].startsWith('/') ? images[0] : `/${images[0]}`;
        img.src = imgSrc;
        img.className = 'preview-image';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '200px';
        img.style.display = 'block';
        
        if (mainImagePreview) {
            mainImagePreview.appendChild(img);
            
            // Add hidden input for existing image
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'existingImages';
            hiddenInput.value = images[0];
            form.appendChild(hiddenInput);
        }
    }
    
    // Add additional images
    if (images.length > 1 && additionalImagesPreview) {
        for (let i = 1; i < images.length; i++) {
            if (!images[i]) continue;
            
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.display = 'inline-block';
            imgContainer.style.margin = '5px';
            
            const img = document.createElement('img');
            const imgSrc = images[i].startsWith('/') ? images[i] : `/${images[i]}`;
            img.src = imgSrc;
            img.className = 'preview-image';
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.display = 'block';
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-10px';
            removeBtn.style.right = '-10px';
            removeBtn.style.background = '#e74c3c';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.padding = 0;
            removeBtn.style.lineHeight = '1';
            
            // Add hidden input for existing image
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'existingImages';
            hiddenInput.value = images[i];
            
            // Add event listener to remove button
            removeBtn.addEventListener('click', () => {
                imgContainer.remove();
                hiddenInput.remove();
            });
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            additionalImagesPreview.appendChild(imgContainer);
            form.appendChild(hiddenInput);
        }
    }
}

/**
 * Handle property form submission
 * @param {Event} e - Form submit event
 */
export async function handlePropertySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const propertyId = formData.get('id');
    const isEdit = !!propertyId;
    
    try {
        // Add features to form data
        const selectedFeatures = [];
        document.querySelectorAll('.feature-checkbox:checked').forEach(checkbox => {
            selectedFeatures.push(checkbox.value);
        });
        formData.set('features', JSON.stringify(selectedFeatures));
        
        // Determine URL and method
        const url = isEdit ? `/api/properties/${propertyId}` : '/api/properties';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';
        }
        
        // Send request
        const response = await fetchWithErrorHandling(url, {
            method,
            body: formData
        });
        
        // Show success message
        showSuccess(isEdit ? 'הנכס עודכן בהצלחה!' : 'הנכס נוסף בהצלחה!');
        
        // Reset form if new property
        if (!isEdit) {
            resetPropertyForm();
        }
        
        // Reload properties list
        await loadProperties();
        
    } catch (error) {
        console.error('Error saving property:', error);
        showError(`שגיאה בשמירת הנכס: ${error.message || 'אירעה שגיאה'}`);
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isEdit ? 'עדכן נכס' : 'הוסף נכס';
        }
    }
}

/**
 * Initialize property form
 */
export function initPropertyForm() {
    const form = document.getElementById('property-form');
    if (!form) return;
    
    // Reset form
    resetPropertyForm();
    
    // Handle form submission
    form.addEventListener('submit', handlePropertySubmit);
    
    // Handle image previews
    setupImageUploadPreview();
    
    // Handle cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetPropertyForm();
        });
    }
}

/**
 * Setup image upload preview
 */
function setupImageUploadPreview() {
    // Main image preview
    const mainImageInput = document.getElementById('mainImage');
    const mainImagePreview = document.getElementById('main-image-preview');
    
    if (mainImageInput && mainImagePreview) {
        mainImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    mainImagePreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '200px';
                    img.style.display = 'block';
                    mainImagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Additional images preview
    const additionalImagesInput = document.getElementById('additionalImages');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesInput && additionalImagesPreview) {
        additionalImagesInput.addEventListener('change', function() {
            if (!this.files || this.files.length === 0) return;
            
            for (let i = 0; i < this.files.length; i++) {
                const reader = new FileReader();
                
                reader.onload = (function(file) {
                    return function(e) {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.position = 'relative';
                        imgContainer.style.display = 'inline-block';
                        imgContainer.style.margin = '5px';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'preview-image';
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        img.style.display = 'block';
                        
                        // Add remove button
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'remove-image-btn';
                        removeBtn.innerHTML = '&times;';
                        removeBtn.style.position = 'absolute';
                        removeBtn.style.top = '-10px';
                        removeBtn.style.right = '-10px';
                        removeBtn.style.background = '#e74c3c';
                        removeBtn.style.color = 'white';
                        removeBtn.style.border = 'none';
                        removeBtn.style.borderRadius = '50%';
                        removeBtn.style.width = '20px';
                        removeBtn.style.height = '20px';
                        removeBtn.style.display = 'flex';
                        removeBtn.style.alignItems = 'center';
                        removeBtn.style.justifyContent = 'center';
                        removeBtn.style.cursor = 'pointer';
                        removeBtn.style.padding = 0;
                        removeBtn.style.lineHeight = '1';
                        
                        // Add event listener to remove button
                        removeBtn.addEventListener('click', () => {
                            imgContainer.remove();
                            
                            // Create a new DataTransfer object to update the files
                            const dataTransfer = new DataTransfer();
                            const { files } = additionalImagesInput;
                            
                            // Add all files except the one being removed
                            for (let j = 0; j < files.length; j++) {
                                if (j !== i) {
                                    dataTransfer.items.add(files[j]);
                                }
                            }
                            
                            // Update the files in the input
                            additionalImagesInput.files = dataTransfer.files;
                        });
                        
                        imgContainer.appendChild(img);
                        imgContainer.appendChild(removeBtn);
                        additionalImagesPreview.appendChild(imgContainer);
                    };
                })(this.files[i]);
                
                reader.readAsDataURL(this.files[i]);
            }
        });
    }
}
