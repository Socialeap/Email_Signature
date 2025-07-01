// A simple function to test if Netlify Functions are deploying correctly.

export async function handler(event) {
    return {
        statusCode: 200,
        body: "Hello, World! The function is working.",
    };
}
