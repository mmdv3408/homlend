import { fetchWithErrorHandling, showSuccess, showError } from './utils.js';

// Global variable to store agents data
let agentsData = [];

/**
 * Load agents from the server and display them in the table
 */
export async function loadAgents() {
    const agentsTableBody = document.getElementById('agentsTableBody');
    if (!agentsTableBody) return;

    // Show loading state
    agentsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-row">
                <div class="loading-spinner"></div> טוען סוכנים...
            </td>
        </tr>`;

    try {
        // Fetch agents from the server
        const data = await fetchWithErrorHandling('/api/agents');
        agentsData = data.agents || [];

        if (agentsData.length > 0) {
            renderAgentsTable(agentsTableBody, agentsData);
        } else {
            agentsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">לא נמצאו סוכנים</td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error loading agents:', error);
        agentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="error-row">
                    שגיאה בטעינת סוכנים: ${error.message || 'אירעה שגיאה'}
                </td>
            </tr>`;
    }
}

/**
 * Render agents table
 * @param {HTMLElement} container - Table body element
 * @param {Array} agents - Array of agent objects
 */
function renderAgentsTable(container, agents) {
    container.innerHTML = agents.map(agent => `
        <tr data-id="${agent.id}">
            <td>
                <img src="${agent.image || '../images/agents/placeholder.jpg'}" 
                     alt="${agent.name}" 
                     class="agent-thumbnail">
            </td>
            <td>${agent.name || 'ללא שם'}</td>
            <td>${agent.phone || 'ללא טלפון'}</td>
            <td>${agent.email || 'ללא אימייל'}</td>
            <td>${agent.propertiesCount || 0} נכסים</td>
            <td class="table-actions">
                <button class="action-btn edit-agent-btn" data-id="${agent.id}" 
                        title="ערוך">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-agent-btn" data-id="${agent.id}" 
                        title="מחק">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`).join('');

    // Add event listeners
    addAgentEventListeners();
}

/**
 * Add event listeners for agent actions
 */
function addAgentEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-agent-btn').forEach(btn => {
        btn.addEventListener('click', handleEditAgent);
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-agent-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteAgent);
    });
}

/**
 * Handle edit agent button click
 * @param {Event} e - Click event
 */
async function handleEditAgent(e) {
    const agentId = e.currentTarget.getAttribute('data-id');
    console.log(`Editing agent ${agentId}`);
    
    try {
        // Show loading state
        const agent = await fetchWithErrorHandling(`/api/agents/${agentId}`);
        
        // Switch to edit mode
        switchToAgentEditMode();
        
        // Fill the form with agent data
        fillAgentForm(agent);
        
        // Scroll to form
        document.getElementById('agent-form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading agent:', error);
        showError(`שגיאה בטעינת פרטי הסוכן: ${error.message}`);
    }
}

/**
 * Handle delete agent button click
 * @param {Event} e - Click event
 */
async function handleDeleteAgent(e) {
    const agentId = e.currentTarget.getAttribute('data-id');
    if (!confirm('האם אתה בטוח שברצונך למחוק סוכן זה? פעולה זו תמחק גם את כל הנכסים המקושרים אליו.')) {
        return;
    }
    
    try {
        await fetchWithErrorHandling(`/api/agents/${agentId}`, {
            method: 'DELETE'
        });
        
        // Remove from UI
        const row = e.currentTarget.closest('tr');
        if (row) row.remove();
        
        // Show success message
        showSuccess('הסוכן נמחק בהצלחה');
    } catch (error) {
        console.error('Error deleting agent:', error);
        showError(`שגיאה במחיקת הסוכן: ${error.message}`);
    }
}

/**
 * Switch to agent edit mode
 */
function switchToAgentEditMode() {
    // Update UI to show we're in edit mode
    const formSection = document.getElementById('agent-form-section');
    const formTitle = document.getElementById('agent-form-title');
    const submitBtn = document.getElementById('agent-submit-btn');
    
    if (formSection) formSection.classList.add('editing');
    if (formTitle) formTitle.textContent = 'עריכת סוכן';
    if (submitBtn) submitBtn.textContent = 'עדכן סוכן';
    
    // Scroll to form
    formSection?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset agent form to add new agent mode
 */
export function resetAgentForm() {
    const form = document.getElementById('agent-form');
    if (!form) return;
    
    form.reset();
    
    // Reset file input
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    
    // Reset image preview
    const preview = form.querySelector('.image-preview');
    if (preview) preview.innerHTML = '';
    
    // Reset form mode
    const formSection = document.getElementById('agent-form-section');
    const formTitle = document.getElementById('agent-form-title');
    const submitBtn = document.getElementById('agent-submit-btn');
    
    if (formSection) formSection.classList.remove('editing');
    if (formTitle) formTitle.textContent = 'הוספת סוכן חדש';
    if (submitBtn) submitBtn.textContent = 'הוסף סוכן';
    
    // Remove any existing ID
    const idInput = form.querySelector('input[name="id"]');
    if (idInput) idInput.value = '';
}

/**
 * Fill agent form with data
 * @param {Object} agent - Agent data
 */
export function fillAgentForm(agent) {
    const form = document.getElementById('agent-form');
    if (!form) return;
    
    console.log('Filling form with agent:', agent);
    
    // Set basic fields
    const fields = ['id', 'name', 'email', 'phone', 'description', 'facebook', 'twitter', 'instagram', 'linkedin'];
    fields.forEach(field => {
        const input = form.elements[field];
        if (input && agent[field] !== undefined) {
            input.value = agent[field] || '';
        }
    });
    
    // Set image preview if exists
    if (agent.image) {
        const preview = form.querySelector('.image-preview');
        if (preview) {
            preview.innerHTML = `
                <img src="${agent.image.startsWith('/') ? agent.image : '/' + agent.image}" 
                     alt="${agent.name}" 
                     class="preview-image"
                     style="max-width: 100%; max-height: 200px; display: block;">`;
        }
    }
}

/**
 * Handle agent form submission
 * @param {Event} e - Form submit event
 */
export async function handleAgentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const agentId = formData.get('id');
    const isEdit = !!agentId;
    
    try {
        // Determine URL and method
        const url = isEdit ? `/api/agents/${agentId}` : '/api/agents';
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
        showSuccess(isEdit ? 'פרטי הסוכן עודכנו בהצלחה!' : 'הסוכן נוסף בהצלחה!');
        
        // Reset form if new agent
        if (!isEdit) {
            resetAgentForm();
        }
        
        // Reload agents list
        await loadAgents();
        
    } catch (error) {
        console.error('Error saving agent:', error);
        showError(`שגיאה בשמירת הסוכן: ${error.message || 'אירעה שגיאה'}`);
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isEdit ? 'עדכן סוכן' : 'הוסף סוכן';
        }
    }
}

/**
 * Initialize agent form
 */
export function initAgentForm() {
    const form = document.getElementById('agent-form');
    if (!form) return;
    
    // Reset form
    resetAgentForm();
    
    // Handle form submission
    form.addEventListener('submit', handleAgentSubmit);
    
    // Handle image preview
    const imageInput = form.querySelector('input[type="file"]');
    const imagePreview = form.querySelector('.image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" 
                             class="preview-image" 
                             style="max-width: 100%; max-height: 200px; display: block;">`;
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Handle cancel button
    const cancelBtn = document.getElementById('cancel-agent-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetAgentForm();
        });
    }
}
