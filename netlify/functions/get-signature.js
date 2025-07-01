// This function retrieves a signature from the blob store.

import { getStore } from "@netlify/blobs";

export async function handler(event) {
    try {
        // Get the submission ID from the URL query parameter
        const submissionID = event.queryStringParameters.id;

        if (!submissionID) {
            return { statusCode: 400, body: "Missing submission ID." };
        }

        const signatureStore = getStore("signatures");
        const signatureHtml = await signatureStore.get(submissionID);

        if (!signatureHtml) {
            return { statusCode: 404, body: "Signature not found." };
        }

        return {
            statusCode: 200,
            body: signatureHtml,
            headers: { "Content-Type": "text/html" },
        };
    } catch (error) {
        console.error("Error retrieving signature:", error);
        return { statusCode: 500, body: "Server Error." };
    }
}
