// הגדרות בסיסיות למערכת
const config = {
    // כתובת בסיס לשרת - שנה את זה לכתובת השרת האמיתית בפרודקשן
    apiUrl: 'http://localhost:5000', 
    
    // גרסת המערכת
    version: '1.0.0',
    
    // האם להשתמש ב-SSL
    useHttps: false,
    
    // הגדרות דפדפן
    debug: true
};

// ייצוא ההגדרות
export default config;
export const API_URL = config.apiUrl;
