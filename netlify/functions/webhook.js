import { getStore } from "@netlify/blobs";

// IMPORTANT: You must have a function that generates the final signature HTML.
// Place your full HTML generation logic from your original success.html here.
function generateFinalSignature(signatureData) {
  // This is a placeholder for your existing, detailed HTML generation logic.
  // Ensure it's identical to the logic you used on your app's main page.
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
  
  // Add your socials (socs) generation logic here...

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
    </table>`.trim(); // Add ${socs} when ready
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const formData = new URLSearchParams(event.body);
    // Jotform often passes the encoded data in a field. You may need to inspect your webhook
    // payload to find the exact field name (e.g., 'data', 'rawRequest', etc.).
    const encodedData = formData.get("data"); 
    const submissionID = formData.get("submissionID");

    if (!encodedData || !submissionID) {
      return { statusCode: 400, body: "Missing data or submissionID." };
    }
    
    // Decode the data and generate the final signature HTML
    const decodedJsonString = Buffer.from(encodedData, "base64").toString("utf8");
    const signatureData = JSON.parse(decodedJsonString);
    const finalHtml = generateFinalSignature(signatureData);

    // Get the blob store named "signatures"
    const signatureStore = getStore("signatures");
    
    // Save the generated HTML to the store, using the submission ID as the unique key
    await signatureStore.set(submissionID, finalHtml);

    return {
      statusCode: 200,
      body: "Signature saved successfully.",
    };
  } catch (error) {
    console.error("Webhook Error:", error);
    return { statusCode: 500, body: `Server Error: ${error.message}` };
  }
}
