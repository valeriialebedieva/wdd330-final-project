const axios = require('axios');

// Configuration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

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
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/cuisines`, {
            params: {
                apiKey: SPOONACULAR_API_KEY
            }
        });

        const cuisines = response.data.map(cuisine => cuisine.cuisine);

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuisines)
        };

    } catch (error) {
        console.error('Error fetching cuisines:', error);
        
        // Return fallback cuisines if API fails
        const fallbackCuisines = ['Italian', 'Asian', 'American', 'Mexican', 'Mediterranean', 'Indian', 'French', 'Japanese', 'Thai', 'Greek'];

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackCuisines)
        };
    }
}; 