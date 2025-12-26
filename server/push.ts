import fetch from 'node-fetch';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY as string; // from Firebase console

export async function sendNotificationToEmail(
  email: string,
  title: string,
  body: string
) {
  // 1) Get tokens for this email
  const { rows } = await pool.query(
    'SELECT token FROM push_tokens WHERE customer_email = $1',
    [email]
  );
  const tokens = rows.map((r) => r.token);
  if (!tokens.length) {
    console.log('[FCM] No tokens for email', email);
    return;
  }

  // 2) Send to each token (for demo; in practice, send to many via `registration_ids`)
  for (const token of tokens) {
    const payload = {
      to: token,
      notification: {
        title,
        body
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // optional, used by some clients
        email
      }
    };

    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[FCM] Error sending notification:', res.status, text);
    } else {
      console.log('[FCM] Notification sent to token:', token);
    }
  }
}