# Recipe Finder

A modern recipe finder application with search and filtering capabilities, built with HTML, CSS, JavaScript, and Node.js.

## Features

- 🔍 **Recipe Search**: Search for recipes by name or ingredients
- 🍽️ **Cuisine Filtering**: Filter recipes by cuisine type
- ⭐ **Difficulty Filtering**: Filter by cooking difficulty level
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 😄 **Food Jokes**: Get random food-related jokes
- 🔄 **Load More**: Pagination for browsing more recipes
- 📋 **Recipe Details**: Detailed view with ingredients and instructions

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **APIs**: Spoonacular Food API, JokeAPI
- **Deployment**: Netlify (Functions + Static Hosting)

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wdd330-final-project-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   SPOONACULAR_API_KEY=your_spoonacular_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Netlify Deployment

This application is configured to deploy on Netlify using Netlify Functions for the backend API calls.

### Environment Variables Setup

1. **Get a Spoonacular API Key**
   - Visit [Spoonacular Food API](https://spoonacular.com/food-api)
   - Sign up for a free account
   - Copy your API key

2. **Set Environment Variables in Netlify**
   - Go to your Netlify dashboard
   - Navigate to your site settings
   - Go to **Environment variables**
   - Add the following variable:
     - **Key**: `SPOONACULAR_API_KEY`
     - **Value**: Your Spoonacular API key

3. **Deploy**
   - Push your changes to your Git repository
   - Netlify will automatically deploy using the configuration in `netlify.toml`

### Netlify Functions

The application uses Netlify Functions to handle API calls securely:
- `/api/recipes` - Search and fetch recipes
- `/api/recipes/:id` - Get individual recipe details
- `/api/cuisines` - Get available cuisines
- `/api/joke` - Get random food jokes

## API Configuration

The application uses the following APIs:
- **Spoonacular Food API**: For recipe data
- **JokeAPI**: For food-related jokes

## Project Structure

```
wdd330-final-project-1/
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── netlify/
│   └── functions/         # Netlify Functions
│       ├── recipes.js     # Recipe search API
│       ├── recipe-details.js # Individual recipe API
│       ├── cuisines.js    # Cuisine list API
│       └── joke.js        # Joke API
├── server.js              # Express server (for local development)
├── config.js              # Configuration file
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies
```

## Security

- API keys are stored securely in environment variables
- No sensitive data is exposed in client-side code
- All external API calls go through secure backend functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 