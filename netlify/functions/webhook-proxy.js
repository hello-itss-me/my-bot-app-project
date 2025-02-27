exports.handler = async function(event, context) {
  try {
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default;

    // URL вебхука теперь берется из payload запроса
    const payload = JSON.parse(event.body);
    const webhookUrl = payload.webhook_url;

    if (!webhookUrl) {
      return {
        statusCode: 400,
        body: "Webhook URL is missing in the request payload."
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload.payload) // Пересылаем основной payload на n8n
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: `n8n webhook error: ${response.status} ${errorText}`
      };
    }

    const responseData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error("Error proxying to n8n webhook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to proxy request to n8n webhook", details: error.toString() }),
    };
  }
};
