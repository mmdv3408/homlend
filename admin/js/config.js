// הגדרות בסיסיות למערכת
const config = {
    // כתובת בסיס לשרת - ריק כדי לעבוד תמיד עם אותו דומיין
    apiUrl: '', 
    
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
