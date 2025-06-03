// מנגנון בדיקת הרשאות לפאנל ניהול
document.addEventListener('DOMContentLoaded', function() {
    // בדיקה מול השרת אם המשתמש מחובר (באמצעות קוקיס)
    fetch('/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                // המשתמש לא מחובר - הפניה לדף התחברות
                window.location.href = '/admin/login.html';
            } else {
                // המשתמש מחובר
                console.log('משתמש מחובר:', data.user);
                
                // טעינת שם המשתמש
                const currentAgent = document.getElementById('currentAgent');
                if (currentAgent) {
                    currentAgent.textContent = `שלום, ${data.user.name}`;
                }
            }
        })
        .catch(error => {
            // שגיאה בבדיקת הסשן
            console.error('שגיאה בבדיקת סטטוס התחברות:', error);
            window.location.href = '/admin/login.html';
        });
});
