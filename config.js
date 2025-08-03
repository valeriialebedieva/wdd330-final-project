// Configuration file for Recipe Finder
require('dotenv').config();

module.exports = {
    // API Keys
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
    JOKE_API_BASE_URL: 'https://v2.jokeapi.dev/joke',
    
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Cache Configuration
    CACHE_DURATION: process.env.CACHE_DURATION || 30 * 60 * 1000, // 30 minutes
    
    // API Endpoints
    SPOONACULAR_BASE_URL: 'https://api.spoonacular.com',
    
    // Recipe Search Configuration
    DEFAULT_RECIPE_COUNT: 12,
    
    // Joke Configuration
    JOKE_CATEGORIES: ['Any', 'Misc', 'Pun'],
    JOKE_KEYWORDS: ['food', 'eat', 'cook', 'kitchen', 'chef', 'restaurant', 'meal'],
    
    // Error Messages
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'Spoonacular API key is required. Please add it to your .env file.',
        RECIPE_NOT_FOUND: 'Recipe not found',
        FETCH_ERROR: 'Failed to fetch data from external API',
        JOKE_ERROR: 'Failed to fetch joke'
    }
}; 