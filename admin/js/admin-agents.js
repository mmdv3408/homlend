// ניהול סוכנים
import * as config from './config.js';
import { getCookie } from './admin-main.js';
const { agentsData } = config;

// אתחול ניהול הסוכנים
function initAgents() {
  console.log('אתחול ניהול סוכנים');

  // אתחול טופס הסוכן
  setupAgentForm();

  // טעינת הסוכנים אם אנחנו בעמוד הסוכנים
  if (document.getElementById('agents-section')) {
    loadAgents();
  }
}

// טעינת סוכנים מהשרת
function loadAgents() {
  console.log('טוען סוכנים מהשרת...');

  fetch('/api/agents')
    .then(response => {
      if (!response.ok) {
        throw new Error('תגובת רשת לא תקינה מהשרת');
      }
      return response.json();
    })
    .then(agents => {
      config.agentsData = agents;
      renderAgentsTable(agents);
      addAgentEventListeners();
    })
    .catch(error => {
      console.error('שגיאה בטעינת סוכנים:', error);
      alert('אירעה שגיאה בטעינת הסוכנים. נסה לרענן את הדף.');
    });
}

// הצגת טבלת הסוכנים
function renderAgentsTable(agents) {
  const tbody = document.querySelector('#agents-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!agents || agents.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="text-center">לא נמצאו סוכנים</td>';
    tbody.appendChild(row);
    return;
  }

  agents.forEach(agent => {
    const row = document.createElement('tr');
    row.dataset.id = agent.id;

    // יצירת שורת הטבלה עם פרטי הסוכן
    row.innerHTML = `
            <td>${agent.name || '-'}</td>
            <td>${agent.phone || '-'}</td>
            <td>${agent.email || '-'}</td>
            <td>${agent.isAdmin ? 'מנהל' : 'סוכן'}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${agent.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${agent.id}" ${agent.isAdmin ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });

  console.log('טבלת הסוכנים עודכנה בהצלחה');
}

// אתחול טופס הסוכן
function setupAgentForm() {
  const form = document.getElementById('agentForm');
  if (!form) return;

  // טיפול בשליחת הטופס
  form.addEventListener('submit', handleAgentSubmit);

  // מאזין לכפתור הוספת סוכן
  const addAgentBtn = document.getElementById('addAgentBtn');
  if (addAgentBtn) {
    addAgentBtn.addEventListener('click', () => {
      // איפוס הטופס
      form.reset();
      form.elements['id'].value = '';

      // הצגת המודאל
      openAgentModal();
    });
  }

  console.log('טופס הסוכן אותחל בהצלחה');
}

// טיפול בשליחת טופס הסוכן
async function handleAgentSubmit(e) {
  e.preventDefault();
  console.log('שליחת טופס סוכן');

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  try {
    // השבתת כפתור השליחה
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';

    // איסוף נתוני הטופס
    const formData = new FormData(form);
    const agentData = {};

    // המרת FormData לאובייקט
    for (const [key, value] of formData.entries()) {
      agentData[key] = value;
    }

    // שליחת הנתונים לשרת
    const method = agentData.id ? 'PUT' : 'POST';
    const url = agentData.id ? `/api/agents/${agentData.id}` : '/api/agents';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCookie('csrfToken') || '',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה בשמירת הסוכן');
    }

    const result = await response.json();
    console.log('סוכן נשמר בהצלחה:', result);

    // סגירת המודאל
    closeAgentModal();

    // הצגת הודעת הצלחה
    alert('הסוכן נשמר בהצלחה!');

    // רענון רשימת הסוכנים
    loadAgents();
  } catch (error) {
    console.error('שגיאה בשמירת הסוכן:', error);
    alert(`אירעה שגיאה בשמירת הסוכן: ${error.message}`);
  } finally {
    // החזרת כפתור השליחה למצב רגיל
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// פתיחת מודאל סוכן
function openAgentModal(agentId = null) {
  const modal = document.getElementById('agent-modal');
  if (!modal) return;

  // איפוס הטופס
  const form = document.getElementById('agentForm');
  if (form) {
    form.reset();

    // אם סופק מזהה סוכן, טען את פרטי הסוכן
    if (agentId) {
      const agent = agentsData.find(a => a.id == agentId);
      if (agent) {
        fillAgentForm(agent);
      }
    } else {
      // איפוס שדה המזהה
      form.elements['id'].value = '';
    }
  }

  // הצגת המודאל
  modal.style.display = 'block';

  // מניעת גלילה בדף הראשי בעת הצגת המודאל
  document.body.style.overflow = 'hidden';
}

// סגירת מודאל סוכן
function closeAgentModal() {
  const modal = document.getElementById('agent-modal');
  if (!modal) return;

  // הסתרת המודאל
  modal.style.display = 'none';

  // החזרת הגלילה לדף הראשי
  document.body.style.overflow = 'auto';

  // איפוס הטופס
  const form = document.getElementById('agentForm');
  if (form) {
    form.reset();
  }
}

// מילוי טופס סוכן עם נתונים
function fillAgentForm(agent) {
  const form = document.getElementById('agentForm');
  if (!form) return;

  console.log('ממלא טופס עם נתוני סוכן:', agent);

  // מילוי שדות רגילים
  const fields = ['id', 'name', 'phone', 'email', 'isAdmin'];
  fields.forEach(field => {
    if (form.elements[field]) {
      if (field === 'isAdmin') {
        form.elements[field].checked = !!agent[field];
      } else {
        form.elements[field].value = agent[field] || '';
      }
    }
  });

  // אם מדובר בעריכת סוכן קיים, הסתר את שדות הסיסמה
  if (agent.id) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
      field.required = false;
      field.parentElement.style.display = 'none';
    });
  } else {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
      field.required = true;
      field.parentElement.style.display = 'block';
    });
  }
}

// מחיקת סוכן
async function deleteAgent(agentId) {
  if (
    !confirm(
      'האם אתה בטוח שברצונך למחוק סוכן זה? פעולה זו לא תתאפשר אם יש נכסים המשויכים לסוכן זה.'
    )
  )
    return;

  try {
    const response = await fetch(`/api/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': getCookie('csrfToken') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה במחיקת הסוכן');
    }

    // רענון רשימת הסוכנים
    loadAgents();
  } catch (error) {
    console.error('שגיאה במחיקת הסוכן:', error);
    alert(`אירעה שגיאה במחיקת הסוכן: ${error.message}`);
  }
}

// הוספת מאזיני אירועים לכפתורי הסוכנים
function addAgentEventListeners() {
  // מאזין לכפתור עריכה
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function () {
      const agentId = this.dataset.id;
      openAgentModal(agentId);
    });
  });

  // מאזין לכפתור מחיקה
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.disabled) return;
      const agentId = this.dataset.id;
      deleteAgent(agentId);
    });
  });

  // מאזין לכפתור סגירת המודאל
  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAgentModal);
  }

  // סגירת מודאל בלחיצה מחוץ לתוכן
  window.addEventListener('click', e => {
    const modal = document.getElementById('agent-modal');
    if (e.target === modal) {
      closeAgentModal();
    }
  });
}

// ייצוא הפונקציות הנדרשות
export { initAgents, loadAgents, renderAgentsTable, setupAgentForm, fillAgentForm, deleteAgent };
