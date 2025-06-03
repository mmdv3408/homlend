// הקובץ server.js - שרת Express של Homeland Real Estate

// יבוא מודולים
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// הגדרת רשימת משתמשים למערכת הניהול
const users = [
  { username: 'admin', password: '1234', name: 'מנהל המערכת' },
  { username: 'eli', password: 'Eli1234', name: 'אלי בלוך' },
  { username: 'yechiel', password: 'Yechiel1234', name: 'יחיאל דויטש' },
  { username: 'moshe', password: 'Moshe1234', name: 'משה בלוך' }
];

// שימוש בקוקיס לאימות המשתמשים

// הגדרת קבצי נתונים
const DATA_DIR = path.join(__dirname, 'data');
const PROPERTIES_DATA_FILE = path.join(DATA_DIR, 'properties.json');
const AGENTS_DATA_FILE = path.join(DATA_DIR, 'agents.json');
const INQUIRIES_DATA_FILE = path.join(DATA_DIR, 'inquiries.json');
const NEWSLETTER_DATA_FILE = path.join(DATA_DIR, 'newsletter.json');

// יצירת תיקיית נתונים אם לא קיימת
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// יצירת תיקיית העלאות אם לא קיימת
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// הגדרת מערכי ברירת מחדל למקרה שקבצי הנתונים לא קיימים
const defaultProperties = [];
const defaultAgents = [];
const defaultInquiries = [];
const defaultNewsletter = [];

// פונקציה לקריאת קובץ נתונים
function readDataFile(filePath, defaultData = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultData;
  } catch (error) {
    console.error(`שגיאה בקריאת קובץ ${filePath}:`, error);
    return defaultData;
  }
}

// פונקציה לשמירת נתונים לקובץ
function writeDataFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`שגיאה בשמירת קובץ ${filePath}:`, error);
    return false;
  }
}

// יצירת אפליקציית Express
const app = express();
const port = process.env.PORT || 5000;

// קונפיגורציית Multer לטיפול בהעלאת קבצים
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// הגדרת middleware
// אפשר גישה מכל מקור
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// הוספת תמיכה בקוקיס
app.use(cookieParser());

app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ניתוב בסיסי
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// הגדרת נתיבים לדפי admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/login.html'));
});

app.get('/admin/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

app.get('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/login.html'));
});

// =========== נקודות קצה לנכסים ===========

// מחיקת נכס
app.delete('/api/properties/:id', (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת מחיקה של נכס עם מזהה ${idParam}`);
    
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    
    // חיפוש הנכס לפי מזהה
    const propertyIndex = properties.findIndex(p => String(p.id) === String(idParam));
    
    if (propertyIndex === -1) {
      console.log(`לא נמצא נכס עם מזהה ${idParam} למחיקה`);
      return res.status(404).json({ success: false, error: 'הנכס לא נמצא' });
    }
    
    // מחיקת הנכס מהמערך
    properties.splice(propertyIndex, 1);
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(PROPERTIES_DATA_FILE, properties);
    
    if (saved) {
      console.log(`הנכס עם מזהה ${idParam} נמחק בהצלחה`);
      res.json({ success: true, message: 'הנכס נמחק בהצלחה' });
    } else {
      console.error(`שגיאה בשמירת הנתונים לאחר מחיקת נכס`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הנתונים' });
    }
  } catch (error) {
    console.error('שגיאה במחיקת נכס:', error);
    res.status(500).json({ success: false, error: 'שגיאה במחיקת הנכס', details: error.message });
  }
});

// קבלת נכסים מומלצים לדף הבית
app.get('/api/properties/featured', (req, res) => {
  try {
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    
    // סינון נכסים פעילים בלבד
    const activeProperties = properties.filter(p => p.status === 'פעיל');
    
    // בחירת עד 6 נכסים אחרונים
    const featuredProperties = activeProperties
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
    
    // הוספת פרטי סוכן לכל נכס
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    const enrichedProperties = featuredProperties.map(property => {
      const agent = agents.find(a => String(a.id) === String(property.agentId)) || {};
      return {
        ...property,
        agentName: agent.name || 'לא צוין',
        agentImage: agent.image || '/images/agents/default.jpg'
      };
    });
    
    console.log(`שליחת ${enrichedProperties.length} נכסים מומלצים`);
    res.json(enrichedProperties);
  } catch (error) {
    console.error('שגיאה בטעינת נכסים מומלצים:', error);
    res.status(500).json({ error: 'שגיאה בטעינת נכסים מומלצים', details: error.message });
  }
});

// קבלת כל הנכסים
app.get('/api/properties', (req, res) => {
  try {
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    res.json(properties);
  } catch (error) {
    console.error('שגיאה בטעינת נכסים:', error);
    res.status(500).json({ error: 'שגיאה בטעינת נכסים', details: error.message });
  }
});

// קבלת נכס בודד לפי מזהה
app.get('/api/properties/:id', (req, res) => {
  try {
    const idParam = req.params.id;
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    const property = properties.find(p => String(p.id) === String(idParam));
    
    if (!property) {
      console.log(`לא נמצא נכס עם מזהה ${idParam}`);
      return res.status(404).json({ error: 'הנכס לא נמצא' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('שגיאה בטעינת הנכס:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הנכס', details: error.message });
  }
});

// הוספת נכס חדש
app.post('/api/properties', upload.fields([{ name: 'images', maxCount: 10 }]), (req, res) => {
  try {
    console.log(`בקשה להוספת נכס חדש התקבלה:`, req.body);
    
    // קריאת רשימת הנכסים הקיימים
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    
    // יצירת מזהה ייחודי עבור הנכס החדש
    const newId = properties.length > 0 ? 
      Math.max(...properties.map(p => parseInt(p.id) || 0)) + 1 : 
      1;
    
    // טיפול בתמונות אם הועלו
    let imagePaths = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      imagePaths = req.files.images.map(file => '/uploads/' + file.filename);
      console.log(`תמונות חדשות הועלו: ${imagePaths.join(', ')}`);
    } else if (req.body.images) {
      // במקרה שנשלח מערך תמונות כמחרוזת JSON
      try {
        imagePaths = typeof req.body.images === 'string' ? 
          JSON.parse(req.body.images) : 
          req.body.images;
      } catch (e) {
        console.error('שגיאה בפענוח מערך תמונות:', e);
        imagePaths = [];
      }
    }
    
    // עיבוד שדות נוספים שנשלחו כמערכים
    let features = [];
    if (req.body.features) {
      try {
        features = typeof req.body.features === 'string' ? 
          JSON.parse(req.body.features) : 
          req.body.features;
      } catch (e) {
        console.error('שגיאה בפענוח מאפיינים:', e);
      }
    }
    
    // יצירת אובייקט הנכס החדש
    const newProperty = {
      id: String(newId),
      title: req.body.title || '',
      address: req.body.address || '',
      description: req.body.description || '',
      price: req.body.price || '0',
      formattedPrice: req.body.formattedPrice || `₪${req.body.price || '0'}`,
      type: req.body.type || 'מכירה',
      images: imagePaths,
      rooms: req.body.rooms || '0',
      area: req.body.area || '0',
      floor: req.body.floor || '0',
      features: features,
      neighborhood: req.body.neighborhood || '',
      status: req.body.status || 'פעיל',
      agentId: req.body.agentId || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // הוספת הנכס החדש למערך
    properties.push(newProperty);
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(PROPERTIES_DATA_FILE, properties);
    
    if (saved) {
      console.log(`נכס חדש נוסף בהצלחה עם מזהה ${newId}`);
      res.json({ success: true, message: 'הנכס נוסף בהצלחה', property: newProperty });
    } else {
      console.error(`שגיאה בשמירת הנכס החדש`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הנכס החדש' });
    }
  } catch (error) {
    console.error(`שגיאה בהוספת נכס חדש:`, error);
    res.status(500).json({ success: false, error: 'שגיאה בהוספת נכס חדש', details: error.message });
  }
});

// עדכון נכס קיים (PUT)
app.put('/api/properties/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת PUT לעדכון נכס עם מזהה ${idParam} התקבלה:`);
    console.log('Body:', req.body);
    console.log('Files:', req.files ? Object.keys(req.files) : 'none');
    
    // קריאת רשימת הנכסים הקיימים
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    
    // חיפוש הנכס לפי מזהה - השוואת מחרוזות להתמודדות עם הבדלי טיפוסים
    const propertyIndex = properties.findIndex(p => String(p.id) === String(idParam));
    
    if (propertyIndex === -1) {
      console.log(`לא נמצא נכס עם מזהה ${idParam}`);
      return res.status(404).json({ success: false, error: 'הנכס לא נמצא' });
    }
    
    // טיפול בתמונות
    let imagePaths = properties[propertyIndex].images || [];
    console.log('תמונות קיימות במסד הנתונים:', imagePaths);
    
    // טיפול בתמונות קיימות
    console.log('בדיקת שדות תמונות קיימות:', req.body.existingImages);
    
    // איתחול מערך נתיבי תמונות
    imagePaths = [];
    
    // בדיקה אם קיימים שדות existingImages
    if (req.body.existingImages) {
      try {
        // אם התקבל מערך של תמונות (כאשר שולחים multiple fields עם אותו שם)
        if (Array.isArray(req.body.existingImages)) {
          imagePaths = req.body.existingImages;
        } 
        // אם יש מספר שדות עם אותו שם, Express משתמש במערך
        else if (req.body.existingImages && Array.isArray(req.body.existingImages)) {
          imagePaths = req.body.existingImages;
        }
        // אם התקבל ערך בודד
        else if (typeof req.body.existingImages === 'string') {
          const trimmed = req.body.existingImages.trim();
          // בדיקה אם זה מערך ב-JSON
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const parsed = JSON.parse(trimmed);
              imagePaths = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              console.log('שגיאה בפענוח JSON, משתמשים בערך המקורי');
              imagePaths = [trimmed];
            }
          } else {
            // אם זה לא JSON, נבדוק אם יש פסיקים
            if (trimmed.includes(',')) {
              imagePaths = trimmed.split(',').map(img => img.trim()).filter(img => img);
            } else {
              imagePaths = [trimmed];
            }
          }
        }
        
        console.log('נמצאו תמונות קיימות לאחר עיבוד:', imagePaths);
      } catch (e) {
        console.error('שגיאה בעיבוד נתיבי תמונות קיימות:', e);
      }
    }
    
    // ניקוי מערך התמונות
    imagePaths = imagePaths
      .filter(img => img && typeof img === 'string' && img.trim() !== '')
      .map(img => img.trim())
      .filter(img => !img.includes('[') && !img.includes(']'));
    
    console.log('נתיבי תמונות סופיים לאחר ניקוי:', imagePaths);
    
    // בדיקה אם הועלו תמונות חדשות
    let hasNewImages = false;
    if (req.files) {
      // תמונה ראשית חדשה
      if (req.files.image && req.files.image.length > 0 && req.files.image[0].size > 0) {
        const mainImagePath = '/uploads/' + req.files.image[0].filename;
        console.log(`הועלה תמונה ראשית חדשה:`, mainImagePath);
        
        // מחליף את התמונה הראשית אם קיימת, או מוסיף אם אין תמונות
        if (imagePaths.length > 0) {
          imagePaths[0] = mainImagePath;
        } else {
          imagePaths.push(mainImagePath);
        }
        hasNewImages = true;
      }
      
      // תמונות נוספות חדשות
      if (req.files.additional_images && req.files.additional_images.length > 0) {
        // סינון רק תמונות בגודל גדול מ-0
        const validAdditionalImages = req.files.additional_images.filter(file => file.size > 0);
        
        if (validAdditionalImages.length > 0) {
          const additionalImagePaths = validAdditionalImages.map(file => '/uploads/' + file.filename);
          console.log(`הועלו ${additionalImagePaths.length} תמונות נוספות חדשות:`, additionalImagePaths);
          
          // הוספת תמונות נוספות למערך התמונות
          if (imagePaths.length > 0) {
            // משמרים את התמונה הראשית ומחליפים את כל התמונות הנוספות
            const mainImage = imagePaths[0];
            imagePaths = [mainImage, ...additionalImagePaths];
          } else {
            // אין תמונות קיימות, נשתמש בתמונות הנוספות בלבד
            imagePaths = additionalImagePaths;
          }
          hasNewImages = true;
        }
      }
      
      // אם לא הועלו תמונות חדשות, נשאיר את התמונות מ-existingImages
      if (!hasNewImages && req.body.existingImages) {
        console.log('לא הועלו תמונות חדשות, משתמש בקיימות:', imagePaths);
      }
    } else {
      console.log('לא התקבלו קבצי תמונות חדשים');
    }
    
    // הכנת הנתונים לעדכון
    const propertyData = { ...req.body };
    
    // מחיקת שדות מיוחדים שלא צריכים להישמר באובייקט הנכס
    delete propertyData.existingImages;
    delete propertyData._method;
    
    // טיפול במאפיינים אם נשלחו כמחרוזת JSON
    if (propertyData.features && typeof propertyData.features === 'string') {
      try {
        propertyData.features = JSON.parse(propertyData.features);
      } catch (e) {
        console.error('שגיאה בפענוח מאפיינים:', e);
        // אם לא מצליח לפענח כ-JSON, בדיקה אם זו מחרוזת בודדת
        if (propertyData.features && propertyData.features.trim()) {
          propertyData.features = [propertyData.features];
        } else {
          propertyData.features = [];
        }
      }
    }
    
    // וידוא שנוצר מערך למאפיינים
    if (!Array.isArray(propertyData.features)) {
      propertyData.features = [];
    }
    
    // טיפול בשדה featured הבוליאני
    console.log('ערך שדה featured לפני המרה:', propertyData.featured, typeof propertyData.featured);
    if ('featured' in propertyData) {
      if (typeof propertyData.featured === 'string') {
        propertyData.featured = propertyData.featured === 'true' || propertyData.featured === '1';
      } else if (typeof propertyData.featured === 'number') {
        propertyData.featured = propertyData.featured === 1;
      }
    }
    console.log('ערך שדה featured לאחר המרה:', propertyData.featured, typeof propertyData.featured);
    
    // עדכון אובייקט הנכס
    const updatedProperty = {
      ...properties[propertyIndex],
      ...propertyData,
      images: imagePaths,
      updatedAt: new Date().toISOString()
    };
    
    console.log('נכס מעודכן:', updatedProperty);
    
    // עדכון המערך
    properties[propertyIndex] = updatedProperty;
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(PROPERTIES_DATA_FILE, properties);
    
    if (saved) {
      console.log(`הנכס עודכן בהצלחה דרך PUT`);
      res.json({ success: true, message: 'הנכס עודכן בהצלחה', property: updatedProperty });
    } else {
      console.error(`שגיאה בשמירת הנכס המעודכן`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הנכס' });
    }
  } catch (error) {
    console.error(`שגיאה בעדכון נכס (PUT):`, error);
    res.status(500).json({ success: false, error: 'שגיאה בעדכון הנכס', details: error.message });
  }
});

// עדכון נכס קיים - אלטרנטיבה ל-PUT עבור דפדפנים שלא תומכים בלעדית
app.post('/api/properties/:id', upload.fields([{ name: 'images', maxCount: 10 }]), (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת POST לעדכון נכס עם מזהה ${idParam} התקבלה:`, req.body);
    
    // קריאת רשימת הנכסים הקיימים
    const properties = readDataFile(PROPERTIES_DATA_FILE, defaultProperties);
    
    // חיפוש הנכס לפי מזהה - השוואת מחרוזות להתמודדות עם הבדלי טיפוסים
    const propertyIndex = properties.findIndex(p => String(p.id) === String(idParam));
    
    if (propertyIndex === -1) {
      console.log(`לא נמצא נכס עם מזהה ${idParam}`);
      return res.status(404).json({ success: false, error: 'הנכס לא נמצא' });
    }
    
    // טיפול בתמונות אם הועלו
    let imagePaths = properties[propertyIndex].images || [];
    
    // עדכון אובייקט הנכס
    const updatedProperty = {
      ...properties[propertyIndex],
      ...req.body,
      images: imagePaths,
      updatedAt: new Date().toISOString()
    };
    
    // עדכון המערך
    properties[propertyIndex] = updatedProperty;
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(PROPERTIES_DATA_FILE, properties);
    
    if (saved) {
      console.log(`הנכס עודכן בהצלחה דרך POST`);
      res.json({ success: true, message: 'הנכס עודכן בהצלחה', property: updatedProperty });
    } else {
      console.error(`שגיאה בשמירת הנכס המעודכן`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הנכס' });
    }
  } catch (error) {
    console.error(`שגיאה בעדכון נכס (POST):`, error);
    res.status(500).json({ success: false, error: 'שגיאה בעדכון הנכס', details: error.message });
  }
});

// =========== נקודות קצה לסוכנים ===========

// קבלת כל הסוכנים
app.get('/api/agents', (req, res) => {
  try {
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    res.json(agents);
  } catch (error) {
    console.error('שגיאה בטעינת סוכנים:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סוכנים', details: error.message });
  }
});

// קבלת סוכן בודד לפי מזהה
app.get('/api/agents/:id', (req, res) => {
  try {
    const idParam = req.params.id;
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    
    // השוואת מחרוזות כדי להתמודד עם הבדלי טיפוסים
    const agent = agents.find(a => String(a.id) === String(idParam));
    
    if (!agent) {
      console.log(`לא נמצא סוכן עם מזהה ${idParam}`);
      return res.status(404).json({ error: 'הסוכן לא נמצא' });
    }
    
    res.json(agent);
  } catch (error) {
    console.error('שגיאה בטעינת הסוכן:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הסוכן', details: error.message });
  }
});

// נקודת קצה אלטרנטיבית לקבלת סוכן בודד באמצעות POST
app.post('/api/agents/:id/get', (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת POST לקבלת סוכן עם מזהה:`, idParam);
    
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    const agent = agents.find(a => String(a.id) === String(idParam));
    
    if (!agent) {
      console.log(`לא נמצא סוכן עם מזהה ${idParam}`);
      return res.status(404).json({ error: 'הסוכן לא נמצא' });
    }
    
    console.log(`סוכן נמצא ומוחזר:`, agent);
    res.json(agent);
  } catch (error) {
    console.error(`שגיאה בטעינת הסוכן דרך POST:`, error);
    res.status(500).json({ error: 'שגיאה בטעינת הסוכן', details: error.message });
  }
});

// עדכון סוכן קיים (PUT)
app.put('/api/agents/:id', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת PUT לעדכון סוכן עם מזהה ${idParam} התקבלה:`, req.body);
    
    // קריאת רשימת הסוכנים הקיימים
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    
    // חיפוש הסוכן לפי מזהה - השוואת מחרוזות להתמודדות עם הבדלי טיפוסים
    const agentIndex = agents.findIndex(a => String(a.id) === String(idParam));
    
    if (agentIndex === -1) {
      console.log(`לא נמצא סוכן עם מזהה ${idParam}`);
      return res.status(404).json({ success: false, error: 'הסוכן לא נמצא' });
    }
    
    // טיפול בתמונת סוכן אם הועלתה
    let imagePath = agents[agentIndex].image; // שמירת התמונה הקיימת כברירת מחדל
    
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = '/uploads/' + req.files.image[0].filename;
      console.log(`תמונת סוכן חדשה הועלתה: ${imagePath}`);
    } else if (req.body.image && req.body.image !== agents[agentIndex].image) {
      // בדיקה אם התמונה היא בפורמט base64
      if (req.body.image.startsWith('data:image')) {
        const base64Data = req.body.image.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const filename = `agent-${Date.now()}.jpg`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, imageBuffer);
        imagePath = `/uploads/${filename}`;
        console.log(`תמונת base64 נשמרה בהצלחה: ${imagePath}`);
      } else {
        imagePath = req.body.image;
      }
    }
    
    // עדכון אובייקט הסוכן
    const updatedAgent = {
      ...agents[agentIndex],
      name: req.body.name || agents[agentIndex].name,
      title: req.body.title || agents[agentIndex].title,
      phone: req.body.phone || agents[agentIndex].phone,
      email: req.body.email || agents[agentIndex].email,
      bio: req.body.bio || agents[agentIndex].bio,
      image: imagePath,
      updatedAt: new Date().toISOString()
    };
    
    // עדכון המערך
    agents[agentIndex] = updatedAgent;
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(AGENTS_DATA_FILE, agents);
    
    if (saved) {
      console.log(`הסוכן עודכן בהצלחה`);
      res.json({ success: true, message: 'הסוכן עודכן בהצלחה', agent: updatedAgent });
    } else {
      console.error(`שגיאה בשמירת הסוכן המעודכן`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הסוכן' });
    }
  } catch (error) {
    console.error(`שגיאה בעדכון סוכן:`, error);
    res.status(500).json({ success: false, error: 'שגיאה בעדכון הסוכן', details: error.message });
  }
});

// עדכון סוכן - אלטרנטיבה ל-PUT עבור דפדפנים שלא תומכים בלעדית
app.post('/api/agents/:id/update', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`בקשת POST לעדכון סוכן עם מזהה ${idParam} התקבלה:`, req.body);
    
    // קריאת רשימת הסוכנים הקיימים
    const agents = readDataFile(AGENTS_DATA_FILE, defaultAgents);
    
    // חיפוש הסוכן לפי מזהה - השוואת מחרוזות להתמודדות עם הבדלי טיפוסים
    const agentIndex = agents.findIndex(a => String(a.id) === String(idParam));
    
    if (agentIndex === -1) {
      console.log(`לא נמצא סוכן עם מזהה ${idParam}`);
      return res.status(404).json({ success: false, error: 'הסוכן לא נמצא' });
    }
    
    // טיפול בתמונת סוכן אם הועלתה
    let imagePath = agents[agentIndex].image; // שמירת התמונה הקיימת כברירת מחדל
    
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = '/uploads/' + req.files.image[0].filename;
      console.log(`תמונת סוכן חדשה הועלתה: ${imagePath}`);
    } else if (req.body.image && req.body.image !== agents[agentIndex].image) {
      // בדיקה אם התמונה היא בפורמט base64
      if (req.body.image.startsWith('data:image')) {
        const base64Data = req.body.image.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const filename = `agent-${Date.now()}.jpg`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, imageBuffer);
        imagePath = `/uploads/${filename}`;
        console.log(`תמונת base64 נשמרה בהצלחה: ${imagePath}`);
      } else {
        imagePath = req.body.image;
      }
    }
    
    // עדכון אובייקט הסוכן
    const updatedAgent = {
      ...agents[agentIndex],
      name: req.body.name || agents[agentIndex].name,
      title: req.body.title || agents[agentIndex].title,
      phone: req.body.phone || agents[agentIndex].phone,
      email: req.body.email || agents[agentIndex].email,
      bio: req.body.bio || agents[agentIndex].bio,
      image: imagePath,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`סוכן מעודכן:`, updatedAgent);
    
    // עדכון המערך
    agents[agentIndex] = updatedAgent;
    
    // שמירת הנתונים המעודכנים
    const saved = writeDataFile(AGENTS_DATA_FILE, agents);
    
    if (saved) {
      console.log(`הסוכן עודכן בהצלחה`);
      res.json({ success: true, message: 'הסוכן עודכן בהצלחה', agent: updatedAgent });
    } else {
      console.error(`שגיאה בשמירת הסוכן המעודכן`);
      res.status(500).json({ success: false, error: 'שגיאה בשמירת הסוכן' });
    }
  } catch (error) {
    console.error(`שגיאה בעדכון סוכן:`, error);
    res.status(500).json({ success: false, error: 'שגיאה בעדכון הסוכן', details: error.message });
  }
});

// הגדרת נקודות קצה לאימות משתמשים
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // חיפוש המשתמש
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // התחברות הצליחה - יצירת קוקי
    res.cookie('adminAuth', true, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // קוקי ל-24 שעות
    res.cookie('username', user.username, { maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('name', user.name, { maxAge: 24 * 60 * 60 * 1000 });
    
    // שליחת תשובה חיובית
    res.json({
      success: true,
      message: 'התחברות בוצעה בהצלחה!',
      redirect: '/admin',
      user: {
        username: user.username,
        name: user.name
      }
    });
  } else {
    // התחברות נכשלה
    res.status(401).json({
      success: false,
      message: 'שם משתמש או סיסמה שגויים'
    });
  }
});

// בדיקת סטטוס התחברות
app.get('/api/auth/status', (req, res) => {
  // בדיקה אם יש קוקי של אימות
  if (req.cookies && req.cookies.adminAuth) {
    // המשתמש מחובר
    res.json({
      authenticated: true,
      user: {
        username: req.cookies.username,
        name: req.cookies.name
      }
    });
  } else {
    // המשתמש לא מחובר
    res.json({
      authenticated: false
    });
  }
});

// התנתקות מהמערכת
app.post('/api/auth/logout', (req, res) => {
  // מחיקת הקוקיס
  res.clearCookie('adminAuth');
  res.clearCookie('username');
  res.clearCookie('name');
  
  res.json({
    success: true,
    message: 'התנתקות בוצעה בהצלחה'
  });
});

// האזנה לפורט
app.listen(port, () => {
  console.log(`השרת רץ בפורט ${port}`);
});
