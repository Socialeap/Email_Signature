exports.handler = async function(event, context) {
  try {
    const { to, html } = JSON.parse(event.body);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_RESEND_API_KEY",
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
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData })
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