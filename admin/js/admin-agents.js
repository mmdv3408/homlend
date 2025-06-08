// ניהול סוכנים
import { showError, showSuccess, formatDate } from './utils.js';

// פונקציה לטעינת סוכנים
export async function loadAgents() {
    try {
        const response = await fetch('/api/agents');
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
                    <button class="btn-edit" onclick="editAgent('${agent.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteAgent('${agent.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
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
            
            const response = await fetch(`/api/agents${agentId ? `/${agentId}` : ''}`, {
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
        const response = await fetch(`../api/agents/${id}`);
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
        const response = await fetch(`../api/agents/${id}`, {
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