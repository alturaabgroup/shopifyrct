import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ...

app.post('/api/push/register', async (req, res) => {
  const { token, email } = req.body as { token: string; email?: string };
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    await pool.query(
      `INSERT INTO push_tokens (customer_email, token)
       VALUES ($1, $2)
       ON CONFLICT (token) DO UPDATE SET customer_email = EXCLUDED.customer_email`,
      [email ?? null, token]
    );

    console.log('[FCM] Registered token:', token, 'for email:', email);
    return res.status(204).send();
  } catch (err) {
    console.error('Error storing FCM token', err);
    return res.status(500).json({ error: 'Failed to store token' });
  }
});