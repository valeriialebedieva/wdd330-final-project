# Recipe Finder

A modern, responsive web application for discovering and exploring delicious recipes from around the world. Built with Node.js, Express, and vanilla JavaScript.

## 🌟 Features

- **Smart Search**: Search recipes by name or ingredients
- **Advanced Filtering**: Filter by cuisine type and difficulty level
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Recipe Details**: Detailed view with ingredients and instructions
- **Mobile Friendly**: Fully responsive design for all devices
- **Real-time Search**: Instant search results as you type

## 🎯 Target Audience

- Home cooks looking for new recipes
- Food enthusiasts exploring different cuisines
- Busy professionals seeking quick meal ideas
- Cooking beginners wanting easy-to-follow recipes

## 🚀 Major Functions

1. **Recipe Search**: Find recipes by name or ingredients
2. **Cuisine Filtering**: Filter by Italian, Asian, American, Mexican, etc.
3. **Difficulty Filtering**: Filter by Easy, Medium, or Hard recipes
4. **Recipe Details**: View complete recipe information in a modal
5. **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Spoonacular Recipe API, JokeAPI (Direct browser calls)
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Deployment**: Netlify (Static hosting)

## 📦 Installation

### For Local Development:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### For Netlify Deployment:

1. **Fork or clone the repository**
2. **Connect to Netlify** from your GitHub repository
3. **Build settings:**
   - Build command: `echo 'Static site - no build required'`
   - Publish directory: `public`
4. **Deploy!** The app will work immediately

**Note:** The app now makes direct API calls to Spoonacular from the browser, so no server-side configuration is needed.

## 🎨 Project Structure

```
recipe-finder/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   └── script.js           # JavaScript functionality
├── server.js               # Express server
├── config.js               # Configuration and environment variables
├── env.example             # Example environment file
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (placeholder)

## ⚙️ Configuration

The application uses a centralized configuration system:

- **`config.js`** - Main configuration file that loads environment variables
- **`env.example`** - Example environment file (copy to `.env`)
- **`.env`** - Your local environment variables (not committed to git)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPOONACULAR_API_KEY` | Your Spoonacular API key | Demo key (limited) |
| `JOKE_API_URL` | JokeAPI endpoint | `https://v2.jokeapi.dev/joke/Food?safe-mode` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CACHE_DURATION` | Cache duration in ms | `1800000` (30 min) |

## 🌐 API Endpoints

- `GET /api/recipes` - Get all recipes (supports query parameters)
- `GET /api/recipes/:id` - Get specific recipe by ID
- `GET /api/cuisines` - Get all available cuisines
- `GET /api/joke` - Get a random food joke

### External APIs Used

- **Spoonacular Recipe API**: Provides recipe data, search, and filtering
- **JokeAPI**: Provides random food jokes for entertainment

### Query Parameters

- `search` - Search recipes by name or ingredients
- `cuisine` - Filter by cuisine type
- `difficulty` - Filter by difficulty level
- `offset` - Pagination offset (number of recipes to skip)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎨 Design Features

- **Modern Gradient Backgrounds**: Beautiful purple gradient theme
- **Card-based Layout**: Clean recipe cards with hover effects
- **Smooth Animations**: CSS transitions and JavaScript animations
- **Modal Dialogs**: Detailed recipe views in popup modals
- **Loading States**: Spinner animations for better UX
- **Error Handling**: User-friendly error messages

## 🔍 Search & Filter Features

- **Real-time Search**: Results update as you type
- **Ingredient Search**: Find recipes containing specific ingredients
- **Cuisine Filtering**: Filter by world cuisines
- **Difficulty Filtering**: Filter by cooking skill level
- **Combined Filters**: Use multiple filters simultaneously
- **Pagination**: Load more recipes with "Load More" button
- **Food Jokes**: Get random food jokes when searching or on demand

## 📊 Sample Data

The application includes sample recipes for:
- Italian cuisine (Spaghetti Carbonara, Margherita Pizza)
- Asian cuisine (Chicken Stir Fry)
- American cuisine (Caesar Salad, Chocolate Chip Cookies)
- Mexican cuisine (Beef Tacos)

## 🚀 Deployment

The application can be deployed to various platforms:

### Heroku
1. Create a Heroku app
2. Set the `PORT` environment variable
3. Deploy using Git

### Vercel
1. Connect your GitHub repository
2. Vercel will automatically detect the Node.js app
3. Deploy with one click

### Netlify
1. Build the project
2. Upload the `public` folder
3. Configure redirects for the API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Recipe images from Unsplash
- Icons from Font Awesome
- Fonts from Google Fonts

---

**Made with ❤️ for food lovers everywhere** 