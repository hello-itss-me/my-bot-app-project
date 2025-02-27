const fetch = require('node-fetch'); //  Используем node-fetch для запросов

exports.handler = async function(event, context) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL; // URL вебхука из переменных окружения Netlify

    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: "N8N_WEBHOOK_URL is not defined in Netlify environment variables."
      };
    }

    const payload = JSON.parse(event.body); // Получаем payload из тела запроса

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Пересылаем payload на n8n
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: `n8n webhook error: ${response.status} ${errorText}`
      };
    }

    const responseData = await response.json(); // Парсим JSON ответ от n8n

    return {
      statusCode: 200,
      body: JSON.stringify(responseData) // Возвращаем JSON ответ от n8n
    };

  } catch (error) {
    console.error("Error proxying to n8n webhook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to proxy request to n8n webhook", details: error.toString() }),
    };
  }
};
