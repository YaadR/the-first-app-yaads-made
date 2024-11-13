import { Handler } from '@netlify/functions';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0/FROM_PHONE_ID/messages';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { phone, message } = JSON.parse(event.body || '{}');

    if (!phone || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number and message are required' })
      };
    }

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send WhatsApp message' })
    };
  }
};