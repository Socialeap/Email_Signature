// netlify/functions/send-signature.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, html } = JSON.parse(event.body);
    if (!email || !html) {
      return { statusCode: 400, body: 'Missing email or html payload.' };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: 'Server misconfiguration: no API key.' };
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'YOUR_VERIFIED_SENDER',  // e.g. "noreply@yourdomain.com"
        to:   [ email ],
        subject: 'Your Custom Gmail Signature',
        html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Resend error:', resp.status, text);
      return { statusCode: resp.status, body: text };
    }

    return { statusCode: 200, body: 'Email sent' };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
