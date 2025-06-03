import { loadProperties, initPropertyForm } from './properties.js';
import { loadAgents, initAgentForm } from './agents.js';
import { getCookie, showError } from './utils.js';

// Global state
let currentUser = null;

/**
 * Initialize the admin panel
 */
export async function initAdmin() {
    // Check if user is logged in
    await checkAuth();
    
    // Initialize UI components
    initUI();
    
    // Initialize forms
    initPropertyForm();
    initAgentForm();
    
    // Load initial data
    loadProperties();
    loadAgents();
    
    // Add event listeners
    addEventListeners();
}

/**
 * Check if user is authenticated
 */
async function checkAuth() {
    try {
        const token = getCookie('authToken');
        if (!token) {
            // Redirect to login if no token
            window.location.href = '/admin/login.html';
            return;
        }
        
        // Verify token with server
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Session expired');
        }
        
        const data = await response.json();
        currentUser = data.user;
        
        // Update UI with user info
        updateUserInfo();
        
    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = '/admin/login.html';
    }
}

/**
 * Update UI with current user info
 */
function updateUserInfo() {
    if (!currentUser) return;
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
    }
}

/**
 * Initialize UI components
 */
function initUI() {
    // Initialize sidebar menu
    const menuItems = document.querySelectorAll('.admin-menu li');
    const adminSections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            adminSections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update page title
            const adminTitle = document.querySelector('.admin-title h1');
            if (adminTitle) {
                const titleText = this.textContent.trim();
                adminTitle.textContent = titleText;
            }
            
            // Load data if needed
            if (section === 'properties') {
                loadProperties();
            } else if (section === 'agents') {
                loadAgents();
            }
        });
    });
    
    // Set initial active section
    const defaultSection = menuItems[0];
    if (defaultSection) {
        defaultSection.click();
    }
    
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            menuToggle.classList.toggle('collapsed');
        });
    }
    
    // Initialize tooltips
    initTooltips();
}

/**
 * Add event listeners
 */
function addEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add new property/agent buttons
    const addButtons = document.querySelectorAll('.add-new-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const form = document.getElementById(`${target}-form`);
            
            if (form) {
                form.reset();
                
                // Reset form mode
                const formSection = form.closest('.admin-section');
                if (formSection) formSection.classList.remove('editing');
                
                // Scroll to form
                form.scrollIntoView({ behavior: 'smooth' });
                
                // Focus first input
                const firstInput = form.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }
        });
    });
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        // Position tooltip
        element.style.position = 'relative';
        element.appendChild(tooltip);
        
        // Show/hide on hover
        element.addEventListener('mouseenter', () => {
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    });
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Send logout request to server
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Clear client-side auth
        document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // Redirect to login
        window.location.href = '/admin/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showError('אירעה שגיאה בהתנתקות. אנא נסה שוב.');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);
