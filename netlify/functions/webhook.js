const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const formData = new URLSearchParams(event.body);
        const encodedData = formData.get('data');
        const submissionID = formData.get('submissionID');

        if (!encodedData || !submissionID) {
            return { statusCode: 400, body: 'Missing data or submissionID.' };
        }

        const decodedJsonString = Buffer.from(encodedData, 'base64').toString('utf8');
        const signatureData = JSON.parse(decodedJsonString);
        const finalHtml = generateFinalSignature(signatureData);

        const filePath = path.join(__dirname, `../public/signatures/${submissionID}.html`);
        fs.writeFileSync(filePath, finalHtml, 'utf8');

        return {
            statusCode: 200,
            body: 'Signature saved successfully.',
        };

    } catch (error) {
        console.error('Webhook Error:', error);
        return { statusCode: 500, body: `Server Error: ${error.message}` };
    }
};

// Use your existing generateFinalSignature() function
