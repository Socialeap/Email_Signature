// netlify/functions/send-signature.js

const fetch = require('node-fetch');  // keep this line

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1️⃣ pull out the properties we're actually sending
    const { email, html } = JSON.parse(event.body);

    if (!email || !html) {
      return { statusCode: 400, body: 'Missing email or html payload.' };
    }

    // 2️⃣ call Resend, using the email variable as the recipient
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        from:    'SignatureBot <noreply@emailsignaturebuilder.com>',
        to:      [ email ],            // ← use email here
        subject: 'Your Custom Gmail Signature',
        html:     html
      }),
    });

    if (!resp.ok) {
      const text = await resp.text(); 
      console.error('Resend error:', resp.status, text);
      return { statusCode: resp.status, body: text };
    }

    return { statusCode: 200, body: 'Email sent' };
  }
  catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: err.message };
  }
};
