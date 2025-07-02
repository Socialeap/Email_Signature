import { getStore } from "@netlify/blobs";

// Your existing generateFinalSignature function remains here.
// Make sure it is complete and correct.
function generateFinalSignature(signatureData) {
  // ... your full HTML generation logic ...
  const { info = {}, buttons = [], socials = [] } = signatureData;
  const phoneLink = (info.phone || "").replace(/[^\d]/g, "");
  const websiteLink = info.website?.startsWith("http")
    ? info.website
    : `https://${info.website || ""}`;

  let btns = "";
  if (buttons.length) {
    btns = '<tr><td colspan="2" style="padding-top:12px;"><table cellpadding="0" cellspacing="0" border="0"><tr>';
    buttons.forEach(b => {
      btns += `<td style="padding-right:8px;"><a href="${b.url}" target="_blank" style="display:inline-block;padding:6px 12px;background-color:${b.color};color:#fff;text-decoration:none;border-radius:18px;font-weight:bold;font-size:12px;text-align:center;">${b.label}</a></td>`;
    });
    btns += "</tr></table></td></tr>";
  }
  
  // Your socials generation logic should also be here...

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#333;width:100%;text-align:left;">
      <tr>
        <td style="padding-right:16px;vertical-align:top;width:90px;height:90px;">
          <img src="${info.image_url}" width="90" height="90" alt="Profile" style="border-radius:50%;display:block;${info.image_style || ''}"/>
        </td>
        <td style="vertical-align:top;padding-top:5px;">
          <div style="font-size:18px;font-weight:bold;color:#195070;line-height:1.2;">${info.name || ""}</div>
          <div style="font-size:14px;color:#555;line-height:1.3;margin-top:2px;">${info.title || ""}${info.company ? " | " + info.company : ""}</div>
          <div style="margin-top:8px;line-height:1.4;">
            ${info.phone ? `<div style="font-size:13px;"><a href="tel:${phoneLink}" style="color:#195070;text-decoration:none;">${info.phone}</a></div>` : ""}
            ${info.website ? `<div style="font-size:13px;"><a href="${websiteLink}" target="_blank" style="color:#195070;text-decoration:none;">${info.website}</a></div>` : ""}
          </div>
        </td>
      </tr>
      ${btns}
    </table>`.trim();
}


// Replace your existing handler function with this one.
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const formData = new URLSearchParams(event.body);
    const encodedData = formData.get("data");

    // 1. Get the sessionId from the form data
    const sessionId = formData.get("sessionId");

    // 2. Check for it
    if (!encodedData || !sessionId) {
      return { statusCode: 400, body: "Missing data or sessionId." };
    }

    const decodedJsonString = Buffer.from(encodedData, "base64").toString("utf8");
    const signatureData = JSON.parse(decodedJsonString);
    const finalHtml = generateFinalSignature(signatureData);

    const signatureStore = getStore("signatures");

    // 3. Use the sessionId as the key to save the signature
    await signatureStore.set(sessionId, finalHtml);

    return {
      statusCode: 200,
      body: "Signature saved successfully.",
    };
  } catch (error) {
    console.error("Webhook Error:", error);
    return { statusCode: 500, body: `Server Error: ${error.message}` };
  }
}
