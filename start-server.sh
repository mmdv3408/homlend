#!/bin/bash
cd /home/moishi/code/homeland

# הפעלת השרת באמצעות PM2 מקומי
npx pm2 delete homeland 2>/dev/null
npx pm2 start ecosystem.config.js
npx pm2 save
npx pm2 list
