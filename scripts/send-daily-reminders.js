/**
 * Script to send daily reminders to all users.
 * Run by GitHub Actions.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import admin from 'firebase-admin';

// Initialize Firebase Admin
// In GitHub Actions, we'll write the secret to this file
// Locally, you must provide it.
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

async function sendReminders() {
  console.log('Starting daily reminder broadcast...');

  try {
    // 1. Fetch all users with an FCM token
    // Note: In a large app, you would paginate this or use cloud functions with pub/sub
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found.');
      return;
    }

    // 1.5. Filter by Time (Hourly Check)
    const currentHour = new Date().getUTCHours();
    console.log(`Current Server Hour (UTC): ${currentHour}`);

    const tokens = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();

      if (!data.fcmToken) return;

      // Default to 20:00 UTC if no preference set
      const userHour = data.reminderHourUTC !== undefined ? data.reminderHourUTC : 20;

      // Check if it's time
      if (userHour === currentHour) {
          tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
        console.log(`No users scheduled for hour ${currentHour}.`);
        return;
    }

    console.log(`Found ${tokens.length} tokens.`);

    // 2. Prepare the message
    const message = {
      notification: {
        title: 'Aura - Time to reflect',
        body: 'Don\'t forget to log your daily entry! 📝'
      },
      tokens: tokens // Multicast
    };

    // 3. Send Multicast
    const response = await messaging.sendEachForMulticast(message);

    console.log(`Successfully sent ${response.successCount} messages.`);
    if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} messages.`);
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                console.error(`Token at index ${idx} failed:`, resp.error);
                // Optional: remove invalid tokens from DB here
            }
        });
    }

  } catch (error) {
    console.error('Error sending reminders:', error);
    process.exit(1);
  }
}

sendReminders();
