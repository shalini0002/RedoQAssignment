const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_URL = 'https://redoqassignment.onrender.com';
  
  try {
    const response = await fetch(`${API_URL}${event.path}`);
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
