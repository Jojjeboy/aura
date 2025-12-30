/**
 * Test script to send a Push Notification to a device.
 * usage: node test-push.js <FCM_TOKEN>
 *
 * You need a service-account.json file in the same directory.
 * Install dependencies: npm install firebase-admin
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const registrationToken = process.argv[2];

if (!registrationToken) {
  console.error('Please provide a registration token as the first argument.');
  process.exit(1);
}

const message = {
  notification: {
    title: 'Aura - Time to reflect',
    body: 'This is a test background notification! 📝'
  },
  token: registrationToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error sending message:', error);
    process.exit(1);
  });
