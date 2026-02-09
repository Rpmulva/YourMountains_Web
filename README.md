# CAC Platform

A modern outdoor adventure community app built with React Native and Expo.

## 🚀 Quick Start

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
   npx expo start
   ```

3. Open the app
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 🌐 Web (marketing site + app)

Run the project for web to see the YourMountains marketing site first; "Join the Founder's Club" opens the app sign-in.

```bash
npx expo start --web
```

Open the URL in the browser (e.g. http://localhost:8081). On web, unauthenticated users see the landing page; native builds go straight to auth.

## 🗺️ Development build (Map, custom icon & splash)

To use the map (Mapbox) and see your app icon and splash screen, run a development build:

```bash
npm run build:assets
npm run clean
npx expo run:ios
```

For Android: `npx expo run:android`.

## 📚 Documentation

See the [Documentation Index](./docs/README.md) for detailed guides:

- [Authentication Setup](./docs/authentication.md) - User authentication
- [Backend Setup](./docs/backend/setup.md) - Database and backend configuration
- [Scalability Guide](./docs/backend/scalability.md) - Scaling options and comparisons

## 🏗️ Project Structure

- `app/` - Application screens and routing (Expo Router)
- `components/` - Reusable UI components
- `contexts/` - React context providers
- `lib/` - Utility libraries (Supabase client, etc.)
- `services/` - API service layers
- `database/` - Database schemas
- `constants/` - App constants (theme, colors)

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: React Native StyleSheet with custom design system
- **State**: React Context API

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Project Documentation](./docs/README.md)
