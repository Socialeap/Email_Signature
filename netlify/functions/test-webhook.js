export async function handler(event) {
  console.log("--- TEST WEBHOOK TRIGGERED ---");
  console.log("Received data:", event.body);

  return {
    statusCode: 200,
    body: "Test webhook received."
  };
}
