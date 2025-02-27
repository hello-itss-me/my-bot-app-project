const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const requestBody = JSON.parse(event.body);
    const webhookUrl = requestBody.webhook_url;
    const payload = requestBody.payload;

    if (!webhookUrl || !payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing webhook URL or payload" }),
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = `Webhook call failed with status ${response.status} and text: ${await response.text()}`;
      console.error(message);
      return { statusCode: response.status, body: JSON.stringify({ error: message }) };
    }

    const responseData = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Error in webhook-proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
