/**
 * קובץ תצורה עבור פאנל הניהול
 * מכיל הגדרות וקונפיגורציות גלובליות
 */

export const CONFIG = {
  // הגדרות API
  API: {
    BASE_URL: '/api',
    ENDPOINTS: {
      AUTH: '/auth',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROPERTIES: '/properties',
      AGENTS: '/agents',
      DASHBOARD: '/dashboard',
      UPLOAD: '/upload',
    },
    TIMEOUT: 30000, // 30 שניות
    RETRY_ATTEMPTS: 3,
  },

  // הגדרות עיצוב
  UI: {
    THEME: {
      PRIMARY_COLOR: '#2c3e50',
      SECONDARY_COLOR: '#3498db',
      SUCCESS_COLOR: '#2ecc71',
      DANGER_COLOR: '#e74c3c',
      WARNING_COLOR: '#f39c12',
      TEXT_COLOR: '#2c3e50',
      BORDER_RADIUS: '4px',
      BOX_SHADOW: '0 2px 10px rgba(0,0,0,0.1)',
    },
    BREAKPOINTS: {
      MOBILE: '576px',
      TABLET: '768px',
      DESKTOP: '992px',
      LARGE_DESKTOP: '1200px',
    },
  },

  // הגדרות שפה
  LANG: {
    DEFAULT: 'he',
    SUPPORTED: ['he', 'en', 'ru', 'ar'],
    DIRECTION: {
      he: 'rtl',
      en: 'ltr',
      ru: 'ltr',
      ar: 'rtl',
    },
  },

  // הגדרות אבטחה
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    SESSION_TIMEOUT: 60 * 60 * 1000, // שעה אחת במילישניות
    CSRF_TOKEN_NAME: 'X-CSRF-Token',
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // הגדרות ברירת מחדל
  DEFAULTS: {
    PROPERTY_IMAGE: '/images/default-property.jpg',
    AGENT_AVATAR: '/images/default-avatar.png',
    ITEMS_PER_PAGE: 10,
    DATE_FORMAT: 'DD/MM/YYYY',
    DATE_TIME_FORMAT: 'DD/MM/YYYY HH:mm',
  },

  // הגדרות דיבאג
  DEBUG: {
    ENABLED: process.env.NODE_ENV !== 'production',
    LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    LOG_PREFIX: '[Homeland Admin]',
  },

  // גרסאות
  VERSION: '2.0.0',
  BUILD_DATE: '2025-06-05T00:00:00+03:00',
};

// ייצוא הקונפיגורציה לשימוש במודולים אחרים
export default CONFIG;
