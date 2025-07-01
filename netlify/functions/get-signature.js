const { getStore } = require("@netlify/blobs");

exports.handler = async function(event) {
    try {
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
};
