const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cache for recipes to avoid hitting API limits
let recipeCache = new Map();
const CACHE_DURATION = config.CACHE_DURATION;

// Helper function to get a random joke from JokeAPI
async function getRandomFoodJoke() {
    try {
        // Use Any category to get random jokes - this ensures variety
        const response = await axios.get(`${config.JOKE_API_BASE_URL}/Any?safe-mode`);
        
        if (response.data.error) {
            throw new Error('API returned error');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching joke from API:', error);
        // Only use fallback if API completely fails
        return {
            error: false,
            type: 'single',
            joke: "Why did the chef go to the doctor? Because he was feeling a little under the weather! 😄"
        };
    }
}

// Helper function to fetch recipes from Spoonacular
async function fetchRecipesFromSpoonacular(params = {}) {
    const cacheKey = JSON.stringify(params);
    const now = Date.now();
    
    // Check cache first
    if (recipeCache.has(cacheKey)) {
        const cached = recipeCache.get(cacheKey);
        if (now - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
    }
    
    try {
        const defaultParams = {
            apiKey: config.SPOONACULAR_API_KEY,
            number: config.DEFAULT_RECIPE_COUNT,
            addRecipeInformation: true,
            fillIngredients: true,
            offset: params.offset || 0,
            ...params
        };
        
        const response = await axios.get(`${config.SPOONACULAR_BASE_URL}/recipes/complexSearch`, {
            params: defaultParams
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
        
        // Cache the results
        recipeCache.set(cacheKey, {
            data: recipes,
            timestamp: now
        });
        
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes from Spoonacular:', error);
        
        // Fallback to sample data if API fails
        return [
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
    }
}

// API Routes
app.get('/api/recipes', async (req, res) => {
    try {
        const { search, cuisine, difficulty, offset = 0 } = req.query;
        let params = {};
        
        if (search) {
            params.query = search;
        }
        
        if (cuisine && cuisine !== 'All') {
            params.cuisine = cuisine;
        }
        
        // Add pagination offset
        params.offset = parseInt(offset);
        
        const recipes = await fetchRecipesFromSpoonacular(params);
        
        // Filter by difficulty on our end since Spoonacular doesn't have this
        let filteredRecipes = recipes;
        if (difficulty && difficulty !== 'All') {
            filteredRecipes = recipes.filter(recipe => 
                recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
            );
        }
        
        // Add pagination info to response
        const response = {
            recipes: filteredRecipes,
            pagination: {
                offset: parseInt(offset),
                limit: config.DEFAULT_RECIPE_COUNT,
                hasMore: filteredRecipes.length === config.DEFAULT_RECIPE_COUNT
            }
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error in /api/recipes:', error);
        res.status(500).json({ error: config.ERROR_MESSAGES.FETCH_ERROR });
    }
});

app.get('/api/recipes/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        
        // Check cache first
        const cacheKey = `recipe_${recipeId}`;
        if (recipeCache.has(cacheKey)) {
            const cached = recipeCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return res.json(cached.data);
            }
        }
        
        const response = await axios.get(`${config.SPOONACULAR_BASE_URL}/recipes/${recipeId}/information`, {
            params: {
                apiKey: config.SPOONACULAR_API_KEY
            }
        });
        
        const recipe = response.data;
        const transformedRecipe = {
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
        };
        
        // Cache the result
        recipeCache.set(cacheKey, {
            data: transformedRecipe,
            timestamp: Date.now()
        });
        
        res.json(transformedRecipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(404).json({ error: config.ERROR_MESSAGES.RECIPE_NOT_FOUND });
    }
});

app.get('/api/cuisines', async (req, res) => {
    try {
        // Get cuisines from Spoonacular
        const response = await axios.get(`${config.SPOONACULAR_BASE_URL}/recipes/cuisines`, {
            params: {
                apiKey: config.SPOONACULAR_API_KEY
            }
        });
        
        const cuisines = response.data.map(cuisine => cuisine.cuisine);
        res.json(cuisines);
    } catch (error) {
        console.error('Error fetching cuisines:', error);
        // Fallback cuisines
        res.json(['Italian', 'Asian', 'American', 'Mexican', 'Mediterranean', 'Indian', 'French', 'Japanese']);
    }
});

// New endpoint for food jokes
app.get('/api/joke', async (req, res) => {
    try {
        const joke = await getRandomFoodJoke();
        res.json(joke);
    } catch (error) {
        console.error('Error fetching joke:', error);
        res.status(500).json({ error: config.ERROR_MESSAGES.JOKE_ERROR });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Recipe Finder server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Spoonacular API: ${config.SPOONACULAR_API_KEY ? 'Configured' : 'Using demo key'}`);
    console.log(`JokeAPI: Configured`);
}); 