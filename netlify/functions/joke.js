const axios = require('axios');

// Configuration
const JOKE_API_BASE_URL = 'https://v2.jokeapi.dev/joke';

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Use Any category to get random jokes - this ensures variety
        const response = await axios.get(`${JOKE_API_BASE_URL}/Any?safe-mode`);
        
        if (response.data.error) {
            throw new Error('API returned error');
        }
        
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('Error fetching joke from API:', error);
        
        // Return fallback joke if API fails
        const fallbackJoke = {
            error: false,
            type: 'single',
            joke: "Why did the chef go to the doctor? Because he was feeling a little under the weather! 😄"
        };

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackJoke)
        };
    }
}; 