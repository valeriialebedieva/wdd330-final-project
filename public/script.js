// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cuisineFilter = document.getElementById('cuisineFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const recipesGrid = document.getElementById('recipesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const recipeModal = document.getElementById('recipeModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');
const jokeBtn = document.getElementById('jokeBtn');
const jokeText = document.getElementById('jokeText');

// State
let currentRecipes = [];
let allRecipes = [];
let currentOffset = 0;
let hasMoreRecipes = false;

// API Configuration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any?safe-mode';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
    loadCuisines();
    setupEventListeners();
    setupNavigation();
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality
    cuisineFilter.addEventListener('change', performSearch);
    difficultyFilter.addEventListener('change', performSearch);

    // Modal functionality
    closeModal.addEventListener('click', closeRecipeModal);
    window.addEventListener('click', function(e) {
        if (e.target === recipeModal) {
            closeRecipeModal();
        }
    });

    // Real-time search (optional)
    searchInput.addEventListener('input', debounce(function() {
        performSearch();
    }, 300));

    // Joke functionality
    jokeBtn.addEventListener('click', getRandomJoke);
    
    // Load more functionality
    loadMoreBtn.addEventListener('click', loadMoreRecipes);
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// API Functions
async function loadRecipes() {
    showLoading(true);
    currentOffset = 0;
    try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=12&addRecipeInformation=true&fillIngredients=true&offset=${currentOffset}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const recipes = transformSpoonacularRecipes(data.results);
        allRecipes = recipes;
        currentRecipes = [...allRecipes];
        hasMoreRecipes = data.results.length === 12;
        
        displayRecipes(currentRecipes);
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError('Failed to load recipes. Please try again later.');
    } finally {
        showLoading(false);
    }
}

async function loadCuisines() {
    try {
        // Use a predefined list of cuisines since the API endpoint doesn't work
        const cuisines = ['Italian', 'Asian', 'American', 'Mexican', 'Mediterranean', 'Indian', 'French', 'Japanese', 'Thai', 'Greek'];
        
        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading cuisines:', error);
    }
}

async function loadRecipeDetails(recipeId) {
    try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`);
        const recipe = await response.json();
        return transformSpoonacularRecipe(recipe);
    } catch (error) {
        console.error('Error loading recipe details:', error);
        return null;
    }
}

// Transform Spoonacular data to our format
function transformSpoonacularRecipes(recipes) {
    return recipes.map(recipe => ({
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
}

function transformSpoonacularRecipe(recipe) {
    return {
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
}

// Joke Functions
async function getRandomJoke() {
    const jokeSection = document.querySelector('.joke-section');
    const originalText = jokeText.textContent;
    
    // Show loading state
    jokeSection.classList.add('joke-loading');
    jokeText.textContent = 'Loading a delicious joke...';
    jokeBtn.disabled = true;
    
    try {
        const response = await fetch(JOKE_API_URL);
        const jokeData = await response.json();
        
        if (jokeData.error) {
            jokeText.textContent = jokeData.message || 'Failed to load joke. Try again!';
        } else if (jokeData.type === 'single') {
            jokeText.textContent = jokeData.joke;
        } else if (jokeData.type === 'twopart') {
            jokeText.textContent = `${jokeData.setup}\n\n${jokeData.delivery}`;
        } else {
            jokeText.textContent = 'Why did the chef go to the doctor? Because he was feeling a little under the weather! 😄';
        }
    } catch (error) {
        console.error('Error fetching joke:', error);
        jokeText.textContent = 'Why did the chef go to the doctor? Because he was feeling a little under the weather! 😄';
    } finally {
        // Remove loading state
        jokeSection.classList.remove('joke-loading');
        jokeBtn.disabled = false;
    }
}

// Load More Functions
async function loadMoreRecipes() {
    if (!hasMoreRecipes) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    currentOffset += 12; // Increment offset by the page size
    
    const searchTerm = searchInput.value.trim();
    const selectedCuisine = cuisineFilter.value;
    const selectedDifficulty = difficultyFilter.value;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('apiKey', SPOONACULAR_API_KEY);
    params.append('number', '12');
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');
    params.append('offset', currentOffset);
    
    if (searchTerm) params.append('query', searchTerm);
    if (selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
    
    try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const newRecipes = transformSpoonacularRecipes(data.results);
        hasMoreRecipes = data.results.length === 12;
        
        // Filter by difficulty on client side
        let filteredRecipes = newRecipes;
        if (selectedDifficulty !== 'All') {
            filteredRecipes = newRecipes.filter(recipe => 
                recipe.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
            );
        }
        
        // Append new recipes to existing ones
        currentRecipes = [...currentRecipes, ...filteredRecipes];
        displayRecipes(currentRecipes);
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('Error loading more recipes:', error);
        showError('Failed to load more recipes. Please try again.');
        currentOffset -= 12; // Revert offset on error
    } finally {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Recipes';
    }
}

function updateLoadMoreButton() {
    if (hasMoreRecipes && currentRecipes.length > 0) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Search and Filter Functions
async function performSearch() {
    const searchTerm = searchInput.value.trim();
    const selectedCuisine = cuisineFilter.value;
    const selectedDifficulty = difficultyFilter.value;

    // Reset pagination for new search
    currentOffset = 0;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('apiKey', SPOONACULAR_API_KEY);
    params.append('number', '12');
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');
    params.append('offset', currentOffset);
    
    if (searchTerm) params.append('query', searchTerm);
    if (selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);

    showLoading(true);
    try {
        const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const recipes = transformSpoonacularRecipes(data.results);
        hasMoreRecipes = data.results.length === 12;
        
        // Filter by difficulty on client side
        let filteredRecipes = recipes;
        if (selectedDifficulty !== 'All') {
            filteredRecipes = recipes.filter(recipe => 
                recipe.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
            );
        }
        
        currentRecipes = filteredRecipes;
        displayRecipes(filteredRecipes);
        updateLoadMoreButton();
        
        // Get a random joke when searching (but not on every keystroke)
        if (searchTerm && searchTerm.length > 2) {
            // Only get joke on actual search button click or Enter key
            if (event && (event.type === 'click' || event.key === 'Enter')) {
                setTimeout(() => getRandomJoke(), 1000); // Small delay for better UX
            }
        }
    } catch (error) {
        console.error('Error performing search:', error);
        showError('Failed to search recipes. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display Functions
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        showNoResults();
        updateLoadMoreButton();
        return;
    }

    hideNoResults();
    
    const recipesHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    recipesGrid.innerHTML = recipesHTML;

    // Add click listeners to recipe cards
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', function() {
            const recipeId = this.dataset.recipeId;
            openRecipeModal(recipeId);
        });
    });
    
    updateLoadMoreButton();
}

function createRecipeCard(recipe) {
    const totalTime = recipe.prepTime + recipe.cookTime;
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" loading="lazy">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${totalTime} min</span>
                    <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                    <span><i class="fas fa-star"></i> ${recipe.difficulty}</span>
                </div>
                <p class="recipe-ingredients">
                    <strong>Ingredients:</strong> ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                </p>
            </div>
        </div>
    `;
}

// Modal Functions
async function openRecipeModal(recipeId) {
    const recipe = await loadRecipeDetails(recipeId);
    if (!recipe) {
        showError('Failed to load recipe details.');
        return;
    }

    const modalHTML = createRecipeModalContent(recipe);
    modalContent.innerHTML = modalHTML;
    recipeModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function createRecipeModalContent(recipe) {
    const totalTime = recipe.prepTime + recipe.cookTime;
    
    return `
        <div class="recipe-detail">
            <div class="recipe-detail-header">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-image">
                <div class="recipe-detail-info">
                    <h2>${recipe.name}</h2>
                    <div class="recipe-detail-meta">
                        <span><i class="fas fa-clock"></i> Prep: ${recipe.prepTime} min</span>
                        <span><i class="fas fa-fire"></i> Cook: ${recipe.cookTime} min</span>
                        <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                        <span><i class="fas fa-star"></i> ${recipe.difficulty}</span>
                        <span><i class="fas fa-globe"></i> ${recipe.cuisine}</span>
                    </div>
                </div>
            </div>
            
            <div class="recipe-detail-section">
                <h3><i class="fas fa-list"></i> Ingredients</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            
            <div class="recipe-detail-section">
                <h3><i class="fas fa-utensils"></i> Instructions</h3>
                <p>${recipe.instructions}</p>
            </div>
        </div>
    `;
}

function closeRecipeModal() {
    recipeModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Utility Functions
function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'block';
        recipesGrid.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        recipesGrid.style.display = 'grid';
    }
}

function showNoResults() {
    noResults.style.display = 'block';
    recipesGrid.style.display = 'none';
}

function hideNoResults() {
    noResults.style.display = 'none';
    recipesGrid.style.display = 'grid';
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some nice animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe recipe cards
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Initialize animations when recipes are loaded
const originalDisplayRecipes = displayRecipes;
displayRecipes = function(recipes) {
    originalDisplayRecipes(recipes);
    setTimeout(addScrollAnimations, 100);
}; 