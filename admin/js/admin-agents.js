/**
 * admin-agents.js
 * מודול לניהול סוכנים במערכת הניהול
 */

import { showError, showSuccess } from './admin-utils.js';

// משתנים גלובליים למודול
let agentsData = [];
let currentAgentId = null;

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
                        <td>${agent.title || 'סוכן נדל"ן'}</td>
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

// פונקציה למחיקת סוכן
function deleteAgent(agentId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק סוכן זה?')) {
        return Promise.resolve(false);
    }
    
    return fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('שגיאה במחיקת הסוכן');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showSuccess('הסוכן נמחק בהצלחה');
            
            // רענון רשימת הסוכנים
            loadAgents();
            return true;
        } else {
            throw new Error(data.error || 'שגיאה במחיקת הסוכן');
        }
    })
    .catch(error => {
        console.error('שגיאה במחיקת סוכן:', error);
        showError(`שגיאה במחיקת הסוכן: ${error.message}`);
        return false;
    });
}

// הוספת אירועי לחיצה לכפתורי סוכנים
function addAgentEventListeners() {
    // אירועים לכפתור הוספת סוכן
    const addAgentBtn = document.getElementById('addAgentBtn');
    if (addAgentBtn) {
        addAgentBtn.addEventListener('click', function() {
            openAgentModal();
        });
    }
    
    // אירועים לכפתורי עריכה
    document.querySelectorAll('.edit-agent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const agentId = this.getAttribute('data-id');
            openAgentModal(agentId);
        });
    });
    
    // אירועים לכפתורי מחיקה
    document.querySelectorAll('.delete-agent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const agentId = this.getAttribute('data-id');
            deleteAgent(agentId);
        });
    });
    
    // אירועי טופס סוכן במודל
    setupAgentForm();
}

// פתיחת מודל עריכת/הוספת סוכן
function openAgentModal(agentId = null) {
    currentAgentId = agentId;
    
    const modal = document.getElementById('agent-modal');
    const modalTitle = document.getElementById('agent-modal-title');
    
    if (!modal || !modalTitle) return;
    
    // עדכון כותרת המודל
    modalTitle.textContent = agentId ? 'עריכת סוכן' : 'הוספת סוכן חדש';
    
    // איפוס הטופס
    resetAgentForm();
    
    // אם זו עריכה, מילוי הטופס בנתוני הסוכן
    if (agentId) {
        const agent = agentsData.find(a => a.id === agentId);
        if (agent) {
            fillAgentForm(agent);
        } else {
            // אם לא מצאנו את הסוכן במידע המקומי, מביא אותו מהשרת
            fetch(`/api/agents/${agentId}`)
                .then(response => response.json())
                .then(agent => {
                    fillAgentForm(agent);
                })
                .catch(error => {
                    console.error('שגיאה בטעינת פרטי סוכן:', error);
                    showError('שגיאה בטעינת פרטי הסוכן');
                });
        }
    }
    
    // הצגת המודל
    modal.style.display = 'block';
    
    // אירוע סגירה
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    // סגירה בלחיצה מחוץ למודל
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // אירוע לכפתור ביטול
    const cancelBtn = document.getElementById('cancelAgentBtn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
}

// פונקציה להגדרת אירועים לטופס הסוכן
function setupAgentForm() {
    const agentForm = document.getElementById('agentForm');
    if (!agentForm) return;
    
    // אירוע תצוגה מקדימה של תמונת סוכן
    const agentImage = document.getElementById('agent-image');
    const agentPreview = document.getElementById('agent-image-preview');
    
    if (agentImage && agentPreview) {
        agentImage.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    agentPreview.innerHTML = `
                        <img src="${e.target.result}" alt="תמונת סוכן">
                        <button type="button" class="remove-image" id="remove-agent-image"><i class="fas fa-trash-alt"></i></button>
                    `;
                    
                    // אירוע להסרת התמונה
                    const removeBtn = document.getElementById('remove-agent-image');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function() {
                            agentPreview.innerHTML = '<div class="no-image">לא נבחרה תמונה</div>';
                            agentImage.value = '';
                        });
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // אירוע שליחת טופס
    agentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // יצירת אובייקט FormData
        const formData = new FormData(this);
        
        // הגדרת שיטה וכתובת לפי סוג הפעולה
        let method = 'POST';
        let url = '/api/agents';
        
        if (currentAgentId) {
            method = 'PUT';
            url = `/api/agents/${currentAgentId}`;
        }
        
        // שליחת הבקשה
        fetch(url, {
            method: method,
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בשמירת הסוכן');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showSuccess('הסוכן נשמר בהצלחה');
                
                // סגירת המודל
                document.getElementById('agent-modal').style.display = 'none';
                
                // רענון רשימת הסוכנים
                loadAgents();
            } else {
                throw new Error(data.error || 'שגיאה בשמירת הסוכן');
            }
        })
        .catch(error => {
            console.error('שגיאה בשמירת סוכן:', error);
            showError(`שגיאה בשמירת הסוכן: ${error.message}`);
        });
    });
}

// פונקציה למילוי טופס סוכן בנתונים
function fillAgentForm(agent) {
    document.getElementById('agent-id').value = agent.id;
    document.getElementById('agent-name').value = agent.name || '';
    document.getElementById('agent-title').value = agent.title || '';
    document.getElementById('agent-phone').value = agent.phone || '';
    document.getElementById('agent-email').value = agent.email || '';
    document.getElementById('agent-bio').value = agent.bio || '';
    
    // הצגת תמונת הסוכן אם קיימת
    if (agent.image) {
        const agentPreview = document.getElementById('agent-image-preview');
        if (agentPreview) {
            agentPreview.innerHTML = `
                <img src="${agent.image}" alt="${agent.name}" onerror="this.src='../images/agents/placeholder.jpg';">
                <button type="button" class="remove-image" id="remove-agent-image"><i class="fas fa-trash-alt"></i></button>
            `;
            
            // אירוע להסרת התמונה
            const removeBtn = document.getElementById('remove-agent-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    agentPreview.innerHTML = '<div class="no-image">לא נבחרה תמונה</div>';
                    document.getElementById('agent-image').value = '';
                    
                    // הוספת שדה מוסתר לציון הסרת התמונה
                    const removeField = document.createElement('input');
                    removeField.type = 'hidden';
                    removeField.name = 'removeImage';
                    removeField.value = 'true';
                    document.getElementById('agentForm').appendChild(removeField);
                });
            }
        }
    }
}

// פונקציה לאיפוס טופס סוכן
function resetAgentForm() {
    const form = document.getElementById('agentForm');
    if (form) {
        form.reset();
        
        // איפוס מזהה סוכן
        document.getElementById('agent-id').value = '';
        
        // איפוס תצוגה מקדימה של תמונה
        const agentPreview = document.getElementById('agent-image-preview');
        if (agentPreview) {
            agentPreview.innerHTML = '<div class="no-image">לא נבחרה תמונה</div>';
        }
        
        // הסרת שדות מוסתרים שעלולים להיות קיימים
        const hiddenFields = form.querySelectorAll('input[type="hidden"]:not(#agent-id)');
        hiddenFields.forEach(field => field.remove());
    }
}

// יצוא פונקציות
export {
    loadAgents,
    addAgentEventListeners,
    openAgentModal,
    resetAgentForm,
    fillAgentForm,
    deleteAgent
};
