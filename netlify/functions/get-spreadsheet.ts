import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

export const handler: Handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const spreadsheetId = event.queryStringParameters?.id;
  if (!spreadsheetId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Spreadsheet ID is required' }),
    };
  }

  const rows = Number(event.queryStringParameters?.rows) || 20; // Default grid rows
  const cols = Number(event.queryStringParameters?.cols) || 20; // Default grid columns

  try {
    // Initialize auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `A1:Z1000`, // Large range; will be trimmed dynamically
    });

    // Log the raw response text for debugging purposes
    const responseText = JSON.stringify(response.data);
   

    // Check if the response is JSON
    if (!responseText || responseText.trim().startsWith('<')) {
      throw new Error('Received non-JSON response, possibly HTML error page');
    }

    // Ensure the response contains values
    const values = response.data.values || [];

    // Ensure a uniform grid (rows x cols)
    const formattedValues = Array(rows)
      .fill(null)
      .map((_, rowIndex) => {
        const row = values[rowIndex] || [];
        return Array(cols)
          .fill('')
          .map((_, colIndex) => row[colIndex] || '');
      });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json', // Ensure the content type is JSON
      },
      body: JSON.stringify({ values: formattedValues }),
    };
  } catch (error) {
    // Log error details for better debugging
    console.error('Spreadsheet Fetch Error:', {
      spreadsheetId,
      error: error instanceof Error ? error.stack : error,
    });

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json', // Ensure the content type is JSON
      },
      body: JSON.stringify({
        error: 'Failed to fetch spreadsheet data',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
