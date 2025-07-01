// netlify/functions/index.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { to, html } = JSON.parse(event.body);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "SignatureBot <noreply@emailsignaturebuilder.com>",
        to,
        subject: "Your Email Signature",
        html
      })
    });

    if (!response.ok) {
      const errorData = await response.text(); // safer than .json in error
      return {
        statusCode: response.status,
        body: errorData
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
