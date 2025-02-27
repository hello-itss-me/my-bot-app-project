import { supabase } from '../lib/supabase';

// Function to handle incoming webhook responses from AI agents
export async function handleIncomingWebhook(req: any, res: any) {
  try {
    const { chat_id, content, user_id } = req.body;

    if (!chat_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the chat exists and belongs to the user
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chat_id)
      .single();

    if (chatError || !chatData) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Insert the agent's response as a message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id,
        user_id: null, // Agent messages don't have a user_id
        sender_type: 'agent',
        content,
      });

    if (messageError) {
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // Update the chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to send a message to an AI agent's webhook
export async function sendMessageToAgent(message: string, chatId: string, userId: string, webhookUrl: string) {
  console.log('sendMessageToAgent: function entry');
  console.log('sendMessageToAgent called');
  try {
    // Enhanced payload with all required information
    const payload = {
      message,
      chat_id: chatId,
      user_id: userId,
      session_id: chatId, // Using chat_id as session_id for tracking
      timestamp: new Date().toISOString()
    };

    console.log('Sending message to webhook:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload));

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    console.log('Before fetch - about to call fetch');
    console.log('Webhook URL:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload));

    let response;
    try {
      console.log('Inside try block before fetch');
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      console.log('Inside try block after fetch');

      if (!response.ok) {
        console.error('Webhook response status NOT OK:', response.status);
        console.error('Webhook response status text:', response.statusText); // Log status text
        const errorText = await response.text();
        console.error('Webhook response error text:', errorText); // Log response error text
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, errorText: ${errorText}`);
      } else {
        console.log('Webhook response status OK:', response.status); // Log status code for OK response
      }

    } catch (fetchError) {
      console.error('Fetch call failed:', fetchError);
      throw fetchError; // Re-throw the error to be caught in the outer catch block
    } finally {
      console.log('Inside finally block after fetch attempt');
    }
    console.log('After fetch call');


    clearTimeout(timeoutId);


    const responseText = await response.text();
    console.log('Webhook response:', responseText);

    try {
      // Try to parse as JSON if possible
      if (responseText && responseText.trim()) {
        return JSON.parse(responseText);
      } else {
        return { response: 'Received empty response from agent' };
      }
    } catch (e) {
      // If not valid JSON, return the raw text
      return { response: responseText || 'Received response from agent' };
    }
  } catch (error) {
    console.error('Error sending message to agent in sendMessageToAgent:', error);
    throw error;
  }
}
