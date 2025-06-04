/**
 * כלי להעברת נתונים מהמבנה הישן לחדש
 * קובץ זה עוזר להמיר נתונים מהפורמט הישן לפורמט החדש
 */

/**
 * ממיר נכס מהפורמט הישן לחדש
 * @param {Object} oldProperty - נכס בפורמט הישן
 * @returns {Object} נכס בפורמט החדש
 */
function convertProperty(oldProperty) {
  // המרת נתוני נכס מהפורמט הישן לחדש
  return {
    id: oldProperty.id,
    title: oldProperty.title,
    description: oldProperty.description,
    price: oldProperty.price,
    type: oldProperty.type,
    rooms: oldProperty.rooms,
    floor: oldProperty.floor,
    totalFloors: oldProperty.totalFloors,
    area: oldProperty.area,
    neighborhood: oldProperty.neighborhood,
    city: oldProperty.city,
    address: oldProperty.address,
    features: oldProperty.features || [],
    images: oldProperty.images || [],
    status: oldProperty.status || 'draft',
    createdAt: oldProperty.createdAt || new Date().toISOString(),
    updatedAt: oldProperty.updatedAt || new Date().toISOString(),
    agentId: oldProperty.agentId || null,
  };
}

/**
 * ממיר סוכן מהפורמט הישן לחדש
 * @param {Object} oldAgent - סוכן בפורמט הישן
 * @returns {Object} סוכן בפורמט החדש
 */
function convertAgent(oldAgent) {
  return {
    id: oldAgent.id,
    name: oldAgent.name,
    email: oldAgent.email,
    phone: oldAgent.phone,
    image: oldAgent.image || '',
    bio: oldAgent.bio || '',
    role: oldAgent.role || 'agent',
    isActive: oldAgent.isActive !== undefined ? oldAgent.isActive : true,
    lastLogin: oldAgent.lastLogin || null,
    createdAt: oldAgent.createdAt || new Date().toISOString(),
    updatedAt: oldAgent.updatedAt || new Date().toISOString(),
  };
}

/**
 * מאחד נתונים ישנים עם נתונים חדשים
 * @param {Object} oldData - נתונים בפורמט הישן
 * @param {Object} newData - נתונים בפורמט החדש
 * @returns {Object} נתונים מאוחדים בפורמט החדש
 */
function mergeData(oldData, newData) {
  // אם אין נתונים חדשים, נחזיר את הישנים
  if (!newData) {
    return {
      properties: oldData.properties.map(convertProperty),
      agents: oldData.agents.map(convertAgent),
      // הוספת נתונים נוספים לפי הצורך
      settings: oldData.settings || {},
      version: '2.0.0',
      migratedAt: new Date().toISOString(),
    };
  }

  // אם יש נתונים חדשים, נמזג אותם עם הישנים
  return {
    properties: [
      ...(newData.properties || []),
      ...(oldData.properties || [])
        .map(convertProperty)
        .filter(newProp => !(newData.properties || []).some(p => p.id === newProp.id)),
    ],
    agents: [
      ...(newData.agents || []),
      ...(oldData.agents || [])
        .map(convertAgent)
        .filter(newAgent => !(newData.agents || []).some(a => a.id === newAgent.id)),
    ],
    settings: {
      ...(oldData.settings || {}),
      ...(newData.settings || {}),
    },
    version: '2.0.0',
    migratedAt: new Date().toISOString(),
  };
}

// ייצוא הפונקציות לשימוש חיצוני
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertProperty,
    convertAgent,
    mergeData,
  };
}

// הוספת הפונקציות לאובייקט הגלובלי לשימוש בדפדפן
if (typeof window !== 'undefined') {
  window.HomelandMigrate = {
    convertProperty,
    convertAgent,
    mergeData,
  };

  console.log('כלי ההעברה טעון. השתמש ב-HomelandMigrate לגישה לפונקציות.');
}
