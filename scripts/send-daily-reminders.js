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

// Localization mappings (Simplified for script)
const locales = {
  en: {
    title: 'Aura - Time to reflect',
    body: 'Don\'t forget to log your daily entry! 📝'
  },
  sv: {
    title: 'Aura - Dags för reflektion',
    body: 'Glöm inte att logga ditt dagliga inlägg! 📝'
  }
};

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

    const currentHour = new Date().getUTCHours();
    console.log(`Current Server Hour (UTC): ${currentHour}`);

    const batches = { en: [], sv: [] };
    let totalScheduled = 0;

    usersSnapshot.forEach(doc => {
      const data = doc.data();

      if (!data.fcmToken) return;

      // Default to 20:00 UTC if no preference set
      const userHour = data.reminderHourUTC !== undefined ? data.reminderHourUTC : 20;

      // Check if it's time
      if (userHour === currentHour) {
          const userLocale = data.locale === 'sv' ? 'sv' : 'en'; // Default to en
          batches[userLocale].push(data.fcmToken);
          totalScheduled++;
      }
    });

    if (totalScheduled === 0) {
        console.log(`No users scheduled for hour ${currentHour}.`);
        return;
    }

    console.log(`Found ${totalScheduled} users across locales.`);

    // 2. Send localized batches
    for (const [locale, tokens] of Object.entries(batches)) {
        if (tokens.length === 0) continue;

        console.log(`Sending ${tokens.length} messages for locale: ${locale}`);

        const message = {
          notification: {
            title: locales[locale].title,
            body: locales[locale].body
          },
          tokens: tokens
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log(`[${locale}] Successfully sent ${response.successCount} messages.`);
        if (response.failureCount > 0) {
            console.log(`[${locale}] Failed to send ${response.failureCount} messages.`);
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`[${locale}] Token at index ${idx} failed:`, resp.error);
                    // Optional: remove invalid tokens from DB here
                }
            });
        }
    }

  } catch (error) {
    console.error('Error sending reminders:', error);
    process.exit(1);
  }
}

sendReminders();
