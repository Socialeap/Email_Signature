// This is a Node.js serverless function for Netlify.
// It uses Resend to email the final signature after a Jotform payment.

import { Resend } from 'resend';

// The handler function that Netlify will run
export async function handler(event) {
    // 1. Check if the request is a POST request from Jotform
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Initialize Resend with your API key from Netlify's environment variables
        const resend = new Resend(process.env.RESEND_API_KEY);

        // 2. Parse the incoming data from Jotform
        const formData = new URLSearchParams(event.body);
        const encodedData = formData.get('data'); 
        const customerEmail = formData.get('email'); 

        if (!encodedData || !customerEmail) {
            return { statusCode: 400, body: 'Missing data or email in form submission.' };
        }

        // 3. Decode and parse the signature data
        const decodedJsonString = Buffer.from(encodedData, 'base64').toString('utf8');
        const signatureData = JSON.parse(decodedJsonString);
        
        // 4. Generate the final HTML signature using the received data
        const finalHtml = generateFinalSignature(signatureData);

        // 5. Prepare and send the email to the customer using Resend
        await resend.emails.send({
            from: 'Your Name <onboarding@resend.dev>', // Resend's default sending address
            to: [customerEmail],
            subject: 'Your Custom Gmail Signature is Ready!',
            html: `
                <h1>Thank you for your purchase!</h1>
                <p>You can now copy the HTML code below and paste it into your Gmail signature settings.</p>
                <pre style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word;"><code>${escapeHtml(finalHtml)}</code></pre>
                <p>Thank you,<br>The Signature Team</p>
            `,
        });

        // 6. Return a success response to Jotform
        return {
            statusCode: 200,
            body: 'Successfully processed payment and sent signature.',
        };

    } catch (error) {
        console.error('Error processing webhook:', error);
        return {
            statusCode: 500,
            body: `Server Error: ${error.message}`,
        };
    }
}

// This helper function generates the final, clean HTML
function generateFinalSignature(data) {
    const { info, buttons, socials } = data;
    const socialIcons = {
        'Facebook': 'https://img.icons8.com/fluency/48/000000/facebook-new.png',
        'LinkedIn': 'https://img.icons8.com/fluency/48/000000/linkedin.png',
        'Instagram': 'https://img.icons8.com/fluency/48/000000/instagram-new.png',
        'X/Twitter': 'https://img.icons8.com/ios-filled/50/000000/twitterx.png',
        'TikTok': 'https://img.icons8.com/color/48/000000/tiktok--v1.png',
        'Threads': 'https://img.icons8.com/fluency/48/000000/threads.png',
        'Bluesky': 'https://seeklogo.com/images/B/bluesky-logo-1913610691-seeklogo.com.png'
    };

    const phoneLink = (info.phone || '').replace(/[^\d]/g, '');
    const websiteLink = (info.website || '').startsWith('http') ? info.website : `https://${info.website}`;

    let buttonsHtml = '';
    if (buttons && buttons.length > 0) {
        buttonsHtml = '<tr><td colspan="2" style="padding-top: 12px;"><table border="0" cellpadding="0" cellspacing="0"><tr>';
        buttons.forEach(btn => {
            if (btn.label && btn.url) {
                buttonsHtml += `<td style="padding-right: 8px;"><a href="${btn.url}" target="_blank" style="display:block; padding: 6px 12px; background-color: ${btn.color}; color: #ffffff; text-decoration: none; border-radius: 18px; font-weight: bold; font-size: 12px; text-align: center; font-family: Arial, sans-serif; white-space: nowrap;">${btn.label}</a></td>`;
            }
        });
        buttonsHtml += '</tr></table></td></tr>';
    }

    let socialsHtml = '';
    if (socials && socials.length > 0) {
        socialsHtml = '<tr><td colspan="2" style="padding-top: 10px;"><table border="0" cellpadding="0" cellspacing="0"><tr>';
        const socialImgStyle = "border:0; border-radius:6px; display:block;";
        socials.forEach(social => {
            if (social.url && socialIcons[social.network]) {
                socialsHtml += `<td style="padding-right: 8px;"><a href="${social.url}" target="_blank"><img src="${socialIcons[social.network]}" width="24" height="24" alt="${social.network}" style="${socialImgStyle}"></a></td>`;
            }
        });
        socialsHtml += '</tr></table></td></tr>';
    }

    return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; color: #333333; width: 500px;">
            <tr>
                <td style="padding-right: 16px; vertical-align: top; width: 90px; height: 90px; font-size: 0px; line-height: 0px;">
                    <img src="${info.image_url}" alt="Profile" style="display: block; width: 90px; height: 90px; object-fit: cover; ${info.image_style}">
                </td>
                <td style="vertical-align: top; padding-top: 5px;">
                    <div style="font-size: 18px; font-weight: bold; color: #195070; line-height: 1.2;">${info.name}</div>
                    <div style="font-size: 14px; color: #555555; line-height: 1.3; margin-top:2px;">${info.title} | ${info.company}</div>
                    <div style="margin-top: 8px; line-height: 1.4;">
                        ${info.phone ? `<div style="font-size: 13px;"><a href="tel:${phoneLink}" style="color: #195070; text-decoration: none;">${info.phone}</a></div>` : ''}
                        ${info.website ? `<div style="font-size: 13px;"><a href="${websiteLink}" target="_blank" style="color: #195070; text-decoration: none;">${info.website}</a></div>` : ''}
                    </div>
                </td>
            </tr>
            ${buttonsHtml}
            ${socialsHtml}
        </table>`;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
