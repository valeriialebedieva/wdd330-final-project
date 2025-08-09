const axios = require('axios');

// Configuration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const DEFAULT_RECIPE_COUNT = 12;

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
        const { search, cuisine, difficulty, offset = 0 } = event.queryStringParameters || {};
        
        // Build query parameters for Spoonacular
        const params = {
            apiKey: SPOONACULAR_API_KEY,
            number: DEFAULT_RECIPE_COUNT,
            addRecipeInformation: true,
            fillIngredients: true,
            offset: parseInt(offset)
        };
        
        if (search) {
            params.query = search;
        }
        
        if (cuisine && cuisine !== 'All') {
            params.cuisine = cuisine;
        }

        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/complexSearch`, {
            params
        });

        // Transform Spoonacular data to our format
        const recipes = response.data.results.map(recipe => ({
            id: recipe.id,
            name: recipe.title,
            ingredients: recipe.extendedIngredients?.map(ing => ing.name) || [],
            instructions: recipe.instructions || 'Instructions not available',
            prepTime: recipe.preparationMinutes || 15,
            cookTime: recipe.cookingMinutes || 20,
            servings: recipe.servings || 4,
            difficulty: recipe.dishTypes?.length > 0 ? 'Medium' : 'Easy',
            cuisine: recipe.cuisines?.length > 0 ? recipe.cuisines[0] : 'International',
            image: recipe.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'
        }));

        // Filter by difficulty on our end since Spoonacular doesn't have this
        let filteredRecipes = recipes;
        if (difficulty && difficulty !== 'All') {
            filteredRecipes = recipes.filter(recipe => 
                recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
            );
        }

        // Add pagination info to response
        const responseData = {
            recipes: filteredRecipes,
            pagination: {
                offset: parseInt(offset),
                limit: DEFAULT_RECIPE_COUNT,
                hasMore: filteredRecipes.length === DEFAULT_RECIPE_COUNT
            }
        };

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('Error fetching recipes:', error);
        
        // Return fallback data if API fails
        const fallbackRecipes = [
            {
                id: 1,
                name: "Spaghetti Carbonara",
                ingredients: ["pasta", "eggs", "bacon", "parmesan", "black pepper"],
                instructions: "Cook pasta, mix eggs with cheese, combine with hot pasta and bacon",
                prepTime: 15,
                cookTime: 20,
                servings: 4,
                difficulty: "Medium",
                cuisine: "Italian",
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400"
            },
            {
                id: 2,
                name: "Chicken Stir Fry",
                ingredients: ["chicken breast", "vegetables", "soy sauce", "ginger", "garlic"],
                instructions: "Stir fry chicken, add vegetables, season with soy sauce and spices",
                prepTime: 10,
                cookTime: 15,
                servings: 4,
                difficulty: "Easy",
                cuisine: "Asian",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"
            }
        ];

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipes: fallbackRecipes,
                pagination: {
                    offset: parseInt(offset || 0),
                    limit: DEFAULT_RECIPE_COUNT,
                    hasMore: false
                }
            })
        };
    }
}; 