/**
 * קובץ לאימות טעינת המודולים
 * קובץ זה בודק שכל המודולים נטענים כראוי
 */

// רשימת המודולים שיש לאמת
const modules = [
  'admin-main',
  'admin-auth',
  'admin-ui',
  'admin-properties',
  'admin-agents',
  'admin-images',
  'admin-dashboard',
];

// פונקציה לאימות טעינת מודול
async function verifyModule(moduleName) {
  try {
    // ננסה לטעון את המודול
    await import(`./${moduleName}.js`);
    console.log(`✅ ${moduleName} נטען בהצלחה`);
    return true;
  } catch (error) {
    console.error(`❌ שגיאה בטעינת ${moduleName}:`, error);
    return false;
  }
}

// פונקציה ראשית לאימות כל המודולים
async function verifyAllModules() {
  console.log('מתחיל אימות טעינת מודולים...');

  const results = await Promise.all(modules.map(verifyModule));
  const successCount = results.filter(Boolean).length;

  console.log('\nסיכום אימות:');
  console.log(`✅ ${successCount} מתוך ${modules.length} מודולים נטענו בהצלחה`);

  if (successCount < modules.length) {
    console.warn(`⚠️  ${modules.length - successCount} מודולים לא נטענו כראוי`);
  }

  return successCount === modules.length;
}

// הפעלת האימות כאשר הדף נטען
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    verifyAllModules().then(success => {
      if (success) {
        console.log('🎉 כל המודולים נטענו בהצלחה!');
      } else {
        console.error('❌ ישנן בעיות בטעינת חלק מהמודולים');
      }
    });
  });
}

// ייצוא לפונקציות לבדיקות
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyAllModules,
    verifyModule,
  };
}
