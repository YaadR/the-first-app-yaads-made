import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const SIGNAL_API_URL = process.env.SIGNAL_API_URL || 'http://localhost:8081/v2/send';
const SIGNAL_NUMBER = process.env.SIGNAL_NUMBER;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { phone, message } = JSON.parse(event.body || '{}');

    if (!phone || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number and message are required' }),
      };
    }

    if (!SIGNAL_NUMBER) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Signal number is not configured' }),
      };
    }

    console.log('Attempting to send Signal message:', {
      phone,
      message,
      signalNumber: SIGNAL_NUMBER,
      apiUrl: SIGNAL_API_URL,
    });

    const response = await fetch(SIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        number: SIGNAL_NUMBER,
        recipients: [phone]
      }),
    });

    // Handle the response body
    const responseText = await response.text(); // Read the response as text first

    // Log the response status and body
    console.log('Signal API Response Status:', response.status);
    console.log('Signal API Response Body:', responseText);

    // If response is not ok, log the error and return the error details
    if (!response.ok) {
      console.error(`Signal API Error: ${response.status} - ${response.statusText}`);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to send Signal message: ${responseText}` }),
      };
    }

    try {
      // Now parse the response text as JSON if it was successful
      const responseData = JSON.parse(responseText);
      console.log('Signal message sent successfully:', responseData);

      return {
        statusCode: 200,
        body: JSON.stringify(responseData),
      };
    } catch (parseError) {
      // If the response isn't JSON, log the raw text
      console.error('Error parsing JSON response:', parseError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse Signal API response' }),
      };
    }

  } catch (error) {
    console.error('Error occurred while sending Signal message:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An internal error occurred while sending the message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
