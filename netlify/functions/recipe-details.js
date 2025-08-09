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
        const recipeId = event.path.split('/').pop(); // Extract recipe ID from path

        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information`, {
            params: {
                apiKey: SPOONACULAR_API_KEY
            }
        });

        const recipe = response.data;
        
        // Use the same difficulty logic as the recipes function
        let difficulty = 'Medium'; // Default
        
        // If we have dishTypes, use them to determine difficulty
        if (recipe.dishTypes && recipe.dishTypes.length > 0) {
            const dishType = recipe.dishTypes[0].toLowerCase();
            // Some dish types indicate difficulty
            if (dishType.includes('salad') || dishType.includes('soup') || dishType.includes('sandwich')) {
                difficulty = 'Easy';
            } else if (dishType.includes('cake') || dishType.includes('bread') || dishType.includes('pastry')) {
                difficulty = 'Hard';
            } else {
                difficulty = 'Medium';
            }
        }
        
        const transformedRecipe = {
            id: recipe.id,
            name: recipe.title,
            ingredients: recipe.extendedIngredients?.map(ing => ing.name) || [],
            instructions: recipe.instructions || 'Instructions not available',
            prepTime: recipe.preparationMinutes || 15,
            cookTime: recipe.cookingMinutes || 20,
            servings: recipe.servings || 4,
            difficulty: difficulty,
            cuisine: recipe.cuisines?.length > 0 ? recipe.cuisines[0] : 'International',
            image: recipe.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'
        };

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transformedRecipe)
        };

    } catch (error) {
        console.error('Error fetching recipe details:', error);
        
        return {
            statusCode: 404,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Recipe not found' })
        };
    }
}; 