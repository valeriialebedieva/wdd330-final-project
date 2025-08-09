const axios = require('axios');

// Configuration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const DEFAULT_RECIPE_COUNT = 12;

// Debug: Log environment variable status (remove in production)
console.log('SPOONACULAR_API_KEY loaded:', SPOONACULAR_API_KEY ? 'Yes' : 'No');

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

        // Debug: Log the first recipe to see available fields
        if (response.data.results && response.data.results.length > 0) {
            console.log('First recipe data:', JSON.stringify(response.data.results[0], null, 2));
        }

        // Transform Spoonacular data to our format
        const recipes = response.data.results.map(recipe => {
            // For now, use a simple approach - Spoonacular doesn't provide difficulty directly
            // We'll use dishTypes as a proxy, but provide better fallback data
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
            
            return {
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
        });

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
            },
            {
                id: 3,
                name: "Simple Toast",
                ingredients: ["bread", "butter"],
                instructions: "Toast bread and spread with butter",
                prepTime: 2,
                cookTime: 3,
                servings: 1,
                difficulty: "Easy",
                cuisine: "International",
                image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400"
            },
            {
                id: 4,
                name: "Beef Wellington",
                ingredients: ["beef fillet", "puff pastry", "mushrooms", "shallots", "garlic", "prosciutto", "dijon mustard", "egg wash"],
                instructions: "Prepare beef, wrap in mushroom mixture and prosciutto, encase in pastry, bake",
                prepTime: 45,
                cookTime: 35,
                servings: 6,
                difficulty: "Hard",
                cuisine: "French",
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"
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