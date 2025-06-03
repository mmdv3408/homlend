// JavaScript ראשי לאתר הום-לנד נכסים

// פונקציה לקבלת הבסיס לנתיבי API
// בזמן פיתוח מקומי או גישה מרחוק, הפונקציה תחזיר את הנתיב הנכון
function getApiBaseUrl() {
    // השתמש בנתיב יחסי כך שיעבוד הן מקומית והן מרחוק
    return '';
}

// פונקציה כללית לשליחת בקשות לשרת
async function fetchApi(endpoint, method = 'GET', data = null) {
    try {
        const url = `${getApiBaseUrl()}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin' // חשוב עבור שליחת עוגיות
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`שגיאה בבקשת API: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // תפריט נייד
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // אפקט גלילה לתפריט
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // חיפוש נכסים
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const propertyType = document.getElementById('property_type').value;
            const area = document.getElementById('area').value;
            const rooms = document.getElementById('rooms').value;
            
            // במקום שימוש ב-alert נשתמש ב-API לחיפוש נכסים
            const searchParams = new URLSearchParams();
            if (propertyType) searchParams.append('type', propertyType);
            if (area) searchParams.append('area', area);
            if (rooms) searchParams.append('rooms', rooms);
            
            // ניתוב לדף חיפוש עם הפרמטרים
            window.location.href = `/properties.html?${searchParams.toString()}`;
        });
    }
    
    // טעינת הנכסים המובחרים
    loadFeaturedProperties();
    
    // טעינת הסוכנים
    loadAgents();
});

// פונקציה לטעינת נכסים מובחרים
async function loadFeaturedProperties() {
    console.log('טוען נכסים מובחרים לדף הבית...');
    const propertiesContainer = document.getElementById('featured-properties');
    if (!propertiesContainer) {
        console.error('לא נמצא מכל לנכסים מובחרים');
        return;
    }
    
    // ניקוי המיכל
    propertiesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> טוען נכסים...</div>';
    
    let propertiesToDisplay = [];
    
    try {
        // טעינת נכסים מהשרת
        const properties = await fetchApi('/api/properties/featured');
        console.log('תשובה מהשרת לנכסים מובחרים:', properties);
        
        if (properties && properties.length > 0) {
            // השתמש בנכסים מהשרת
            console.log(`נמצאו ${properties.length} נכסים מובחרים מהשרת`);
            propertiesToDisplay = properties;
        } else {
            // אם אין נכסים מהשרת, השתמש בנתוני דוגמה
            console.log('אין נכסים מובחרים מהשרת, משתמש בנתוני דוגמה');
            propertiesToDisplay = getDemoProperties();
        }
    } catch (error) {
        console.error('שגיאה בטעינת נכסים מובחרים:', error);
        // במקרה של שגיאה, השתמש בנתוני דוגמה
        propertiesToDisplay = getDemoProperties();
    }
    
    // ניקוי המיכל
    propertiesContainer.innerHTML = '';
    
    if (propertiesToDisplay.length === 0) {
        propertiesContainer.innerHTML = '<div class="no-properties">לא נמצאו נכסים מובחרים</div>';
        return;
    }
    
    // יצירת כרטיסי הנכסים והוספתם
    propertiesToDisplay.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        propertyCard.innerHTML = `
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
                <span class="property-tag">${property.type}</span>
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.address}
                </div>
                <div class="property-details">
                    <div class="property-detail">
                        <span class="detail-value">${property.rooms}</span>
                        <span class="detail-label">חדרים</span>
                    </div>
                    <div class="property-detail">
                        <span class="detail-value">${property.area} מ"ר</span>
                        <span class="detail-label">שטח</span>
                    </div>
                    <div class="property-detail">
                        <span class="detail-value">${property.floor}</span>
                        <span class="detail-label">קומה</span>
                    </div>
                </div>
                <div class="property-price">${property.price}</div>
                <div class="property-agent">
                    <div class="agent-image">
                        <img src="${property.agentImage}" alt="${property.agentName}">
                    </div>
                    <div class="agent-name">${property.agentName}</div>
                </div>
            </div>
        `;
        
        propertyCard.addEventListener('click', function() {
            window.location.href = `/property.html?id=${property.id}`;
        });
        
        propertiesContainer.appendChild(propertyCard);
    });
}

// פונקציה שמחזירה נכסי דוגמה כאשר אין נכסים מהשרת
function getDemoProperties() {
    return [
        {
            id: 1,
            title: "דירת 4 חדרים מפוארת",
            address: "רחוב הרצל 15, ירושלים",
            price: "₪1,950,000",
            type: "מכירה",
            image: "images/properties/property1.jpg",
            rooms: 4,
            area: 95,
            floor: 3,
            agentName: "אלי בלוך",
            agentImage: "images/agents/agent1.jpg"
        },
        {
            id: 2,
            title: "פנטהאוז 5 חדרים עם נוף",
            address: "רחוב יפו 80, ירושלים",
            price: "₪3,200,000",
            type: "מכירה",
            image: "images/properties/property2.jpg",
            rooms: 5,
            area: 120,
            floor: 8,
            agentName: "יחיאל דויטש",
            agentImage: "images/agents/agent2.jpg"
        },
        {
            id: 3,
            title: "דירת 3 חדרים משופצת",
            address: "רחוב בן יהודה 45, ירושלים",
            price: "₪4,500",
            type: "השכרה",
            image: "images/properties/property3.jpg",
            rooms: 3,
            area: 75,
            floor: 2,
            agentName: "משה בלוך",
            agentImage: "images/agents/agent3.jpg"
        }
    ];
}

// פונקציה לטעינת הסוכנים
async function loadAgents() {
    const agentsContainer = document.querySelector('.agents-grid');
    if (!agentsContainer) return;
    
    try {
        // טעינת סוכנים מהשרת
        const agents = await fetchApi('/api/agents');
        if (agents && agents.length > 0) {
            // יש לנו סוכנים מהשרת - נשתמש בהם
            renderAgents(agents, agentsContainer);
            return;
        }
    } catch (error) {
        console.error('שגיאה בטעינת סוכנים:', error);
    }
    
    // נתוני סוכנים לדוגמה - נשתמש בהם אם אין נתונים מהשרת
    const demoAgents = [
        {
            id: 1,
            name: "אלי בלוך",
            title: "סוכן נדל\"ן בכיר",
            phone: "052-123-4567",
            email: "eli@home-jlm.co.il",
            image: "images/agents/agent1.jpg"
        },
        {
            id: 2,
            name: "יחיאל דויטש",
            title: "סוכן נדל\"ן",
            phone: "054-789-0123",
            email: "yd@home-jlm.co.il",
            image: "images/agents/agent2.jpg"
        },
        {
            id: 3,
            name: "משה בלוך",
            title: "סוכן נדל\"ן",
            phone: "052-765-0116",
            email: "moshe@home-jlm.co.il",
            image: "images/agents/agent3.jpg"
        },
        {
            id: 4,
            name: "שרה לוי",
            title: "יועצת נדל\"ן",
            phone: "050-555-4321",
            email: "sara@home-jlm.co.il",
            image: "images/agents/agent4.jpg"
        }
    ];
    
    // ניקוי המיכל
    agentsContainer.innerHTML = '';
    
    // יצירת כרטיסי הסוכנים והוספתם
    demoAgents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-photo">
                <img src="${agent.image}" alt="${agent.name}">
            </div>
            <div class="agent-info">
                <h3 class="agent-name">${agent.name}</h3>
                <p class="agent-title">${agent.title}</p>
                <div class="agent-contact">
                    <a href="tel:${agent.phone}" title="התקשר"><i class="fas fa-phone"></i></a>
                    <a href="mailto:${agent.email}" title="שלח אימייל"><i class="fas fa-envelope"></i></a>
                    <a href="https://wa.me/${agent.phone.replace(/\D/g,'')}" title="WhatsApp" target="_blank"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        `;
        
        agentsContainer.appendChild(agentCard);
    });
}

// פונקציה להצגת סוכנים
function renderAgents(agents, container) {
    // ריקון המכל לפני הוספת הסוכנים החדשים
    container.innerHTML = '';
    
    // הוספת כל סוכן למכל
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        
        agentCard.innerHTML = `
            <div class="agent-photo">
                <img src="${agent.image || '/images/agents/default.jpg'}" alt="${agent.name}">
            </div>
            <div class="agent-info">
                <h3 class="agent-name">${agent.name}</h3>
                <p class="agent-title">${agent.title || 'סוכן נדל"ן'}</p>
                <div class="agent-contact">
                    <a href="tel:${agent.phone}" title="התקשר"><i class="fas fa-phone"></i></a>
                    <a href="mailto:${agent.email}" title="שלח אימייל"><i class="fas fa-envelope"></i></a>
                    <a href="https://wa.me/${agent.phone.replace(/\D/g,'')}" title="WhatsApp" target="_blank"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        `;
        
        container.appendChild(agentCard);
    });
}

// טיפול בטופס צור קשר
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        
        // כאן תהיה שליחת הטופס לשרת במערכת האמיתית
        alert(`תודה ${name}! הודעתך התקבלה בהצלחה. נחזור אליך בהקדם.`);
        contactForm.reset();
    });
}

// גלילה חלקה למעבר בין אזורים
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
