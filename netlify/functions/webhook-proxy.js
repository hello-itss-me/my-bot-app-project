const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const requestBody = JSON.parse(event.body);
    const webhookUrl = requestBody.webhook_url;
    const payload = requestBody.payload;

    console.log('Netlify Function received payload:', payload); // Log incoming payload

    if (!webhookUrl || !payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing webhook URL or payload' }),
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `n8n webhook failed: ${response.status} ${errorText}` }),
      };
    }

    const responseData = await response.json(); // Try to parse response as JSON
    console.log('n8n webhook response data:', responseData); // Log n8n response data


    return {
      statusCode: 200,
      body: JSON.stringify(responseData), // Forward n8n response
    };
  } catch (error) {
    console.error('Netlify Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
