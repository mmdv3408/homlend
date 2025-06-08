// ניהול סוכנים
import { showError, showSuccess, formatDate } from './utils.js';
import config from './config.js';

// פונקציה לאתחול מודול הסוכנים
export async function initAgents() {
    console.log('אתחול מודול הסוכנים...');
    try {
        // הגדרת טופס סוכן
        setupAgentForm();
        
        // טעינת רשימת סוכנים
        await loadAgents();
        
        console.log('מודול הסוכנים אותחל בהצלחה');
        return true;
    } catch (error) {
        console.error('שגיאה באתחול מודול הסוכנים:', error);
        return false;
    }
}

// פונקציה לטעינת סוכנים
export async function loadAgents() {
    try {
        const response = await fetch(`${config.apiUrl}/api/agents`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'שגיאה בטעינת הסוכנים');
        }
        
        const tableBody = document.getElementById('agentsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        data.agents.forEach(agent => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${agent.name}</td>
                <td>${agent.phone}</td>
                <td>${agent.email}</td>
                <td>${agent.properties || 0}</td>
                <td>${formatDate(agent.joinDate)}</td>
                <td>
                    <button class="btn-edit" data-id="${agent.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-id="${agent.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // הוספת מאזיני אירועים לכפתורים
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                editAgent(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteAgent(id);
            });
        });
    } catch (error) {
        console.error('שגיאה בטעינת סוכנים:', error);
        showError('אירעה שגיאה בטעינת הסוכנים');
    }
}

// פונקציה להגדרת טופס סוכן
export function setupAgentForm() {
    const form = document.getElementById('addAgentForm');
    if (!form) return;
    
    // איפוס הטופס
    form.reset();
    
    // הוספת מאזין אירועים לשליחת הטופס
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const agentId = formData.get('id');
            
            const response = await fetch(`${config.apiUrl}/api/agents${agentId ? `/${agentId}` : ''}`, {
                method: agentId ? 'PUT' : 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess(agentId ? 'הסוכן עודכן בהצלחה' : 'הסוכן נוסף בהצלחה');
                form.reset();
                loadAgents();
            } else {
                throw new Error(data.error || 'שגיאה בשמירת הסוכן');
            }
            
        } catch (error) {
            console.error('שגיאה בשמירת סוכן:', error);
            showError('אירעה שגיאה בשמירת הסוכן');
        }
    });
}

// פונקציה לעריכת סוכן
export async function editAgent(id) {
    try {
        const response = await fetch(`${config.apiUrl}/api/agents/${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'שגיאה בטעינת פרטי הסוכן');
        }
        
        // מעבר ללשונית עריכת סוכן
        const addAgentTab = document.querySelector('[data-section="add-agent"]');
        if (addAgentTab) {
            addAgentTab.click();
        }
        
        // מילוי הטופס בנתונים
        const form = document.getElementById('addAgentForm');
        if (form) {
            const agent = data.agent;
            form.elements['id'].value = agent.id;
            form.elements['name'].value = agent.name;
            form.elements['phone'].value = agent.phone;
            form.elements['email'].value = agent.email;
        }
        
    } catch (error) {
        console.error('שגיאה בעריכת סוכן:', error);
        showError('אירעה שגיאה בטעינת פרטי הסוכן');
    }
}

// פונקציה למחיקת סוכן
export async function deleteAgent(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק סוכן זה?')) {
        return;
    }
    
    try {
        const response = await fetch(`${config.apiUrl}/api/agents/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('הסוכן נמחק בהצלחה');
            loadAgents();
        } else {
            throw new Error(data.error || 'שגיאה במחיקת הסוכן');
        }
        
    } catch (error) {
        console.error('שגיאה במחיקת סוכן:', error);
        showError('אירעה שגיאה במחיקת הסוכן');
    }
} 