# Cookly Mobile App

An AI-powered recipe generator mobile app built with Expo and React Native. Generate personalized recipes based on available ingredients using AI.

## 🚀 Features

- **AI-Powered Recipe Generation**: Create unique recipes from your ingredients
- **User Authentication**: Secure account management with JWT tokens
- **Recipe Browsing**: Search and filter recipes by meal type, cuisine, and dietary restrictions
- **Recipe Management**: Save and rate your favorite recipes
- **User Preferences**: Set dietary restrictions and default portions
- **Cross-Platform**: Runs on iOS, Android, and Web

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- [Cookly Backend](https://github.com/its-yeasin/Cookly-Backend)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/its-yeasin/cookly.git
   cd cookly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Edit `lib/config.ts` and update the `API_BASE_URL` to point to your backend server:
   ```typescript
   export const config = {
     API_BASE_URL: 'https://your-backend-url.com', // Update this
     // ... other config
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## 🔧 Configuration

### Backend Configuration

Make sure your backend is running and accessible. The backend should have the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/recipes/generate` - Generate recipes from ingredients
- `GET /api/recipes` - Browse recipes
- `POST /api/recipes/search-by-ingredients` - Search by ingredients
- And more... (see [Backend Documentation](https://github.com/its-yeasin/Cookly-Backend))

### App Configuration

Update `lib/config.ts` to customize:

- API base URL and timeout
- Default servings and max ingredients
- Storage keys and pagination settings

## 📱 App Structure

```
app/
├── (tabs)/          # Tab navigation screens
│   ├── index.tsx    # Home/Recipe generation
│   ├── explore.tsx  # Recipe browsing
│   ├── saved.tsx    # Saved recipes
│   └── profile.tsx  # User profile
├── auth/            # Authentication screens
│   ├── login.tsx
│   └── register.tsx
└── recipe/          # Recipe detail screens
    └── [id].tsx     # Dynamic recipe details

lib/
├── api.ts          # API service
└── config.ts       # App configuration

contexts/
└── auth-context.tsx # Authentication context

types/
└── index.ts        # TypeScript types
```

## 🎨 Design System

The app follows the design guidelines from the `design-system/` folder. Key components include:

- **Themed Components**: Light/dark mode support
- **Icon System**: SF Symbols on iOS, Material Icons on Android/Web
- **Consistent Styling**: Standardized colors, typography, and spacing

## 🔐 Authentication

The app uses JWT-based authentication with AsyncStorage for token persistence. Users can:

- Register with email and password
- Login with existing credentials
- Stay logged in across app sessions
- Update profile information
- Set dietary preferences

## 🍳 Recipe Features

### Recipe Generation
- Add multiple ingredients
- Set serving size and meal type
- Choose difficulty level
- Generate AI-powered recipes

### Recipe Browsing
- Search by ingredients
- Filter by meal type and dietary restrictions
- View recipe details with ingredients and instructions
- See cooking time, difficulty, and ratings

### Recipe Management
- Save favorite recipes
- Rate recipes (1-5 stars)
- View saved recipes collection
- Access recipe history

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
# Web
npm run build

# Native builds require Expo Application Services (EAS)
npm install -g eas-cli
eas build
```

## 📝 Environment Variables

The app connects to your backend server. Make sure your backend has these environment variables configured:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_OPENAI_API_KEY=your-azure-openai-key
# ... see backend documentation for complete list
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the [Backend Repository](https://github.com/its-yeasin/Cookly-Backend) for API documentation
- Create an issue in this repository
- Review the troubleshooting section in the backend docs

---

Built with ❤️ using Expo, React Native, and Azure OpenAI
