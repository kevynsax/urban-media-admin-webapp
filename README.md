# Urbi Admin Web App

A modern React web application for managing Urbi video content. Built with React, TypeScript, Redux Toolkit, and Material-UI.

## Features

### Authentication
- Phone number + password login
- Secure token storage (localStorage)
- Auto-login on app startup (persisted sessions)
- Logout functionality with confirmation

### Video Management
- **List Videos**: View all videos with filtering options
- **Upload Videos**: Create/upload new videos with progress tracking
- **Video Details**: View video details with embedded player
- **Edit Videos**: Update video metadata (publish status, link to action)
- **Delete Videos**: Remove videos with confirmation dialog
- **Filter Videos**: Filter by publish status (All, Published, Internal Only, Unpublished)

### User Interface
- Beautiful gradient design with Material-UI components
- Responsive layout that works on desktop and mobile
- Real-time upload progress bar
- Beautiful animated alert notifications
- Smooth transitions and animations

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client

## Project Structure

```
admin-webapp/
├── src/
│   ├── components/          # Reusable components
│   │   ├── AlertContainer.tsx    # Alert notification system
│   │   └── ProtectedRoute.tsx    # Route guard for auth
│   ├── config/              # Configuration
│   │   └── app.config.ts         # API endpoints and settings
│   ├── hooks/               # Custom React hooks
│   │   └── useAppDispatch.ts     # Typed dispatch hook
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx         # Login screen
│   │   ├── VideosPage.tsx        # Videos list with filtering
│   │   ├── VideoDetailPage.tsx   # Video detail and edit
│   │   └── VideoUploadPage.tsx   # Video upload with progress
│   ├── services/            # API services
│   │   └── api.service.ts        # HTTP client with interceptors
│   ├── store/               # Redux store
│   │   ├── index.ts              # Store configuration
│   │   ├── authSlice.ts          # Auth state management
│   │   ├── videoSlice.ts         # Video state management
│   │   └── alertSlice.ts         # Alert state management
│   ├── types/               # TypeScript types
│   │   └── index.ts              # Shared type definitions
│   ├── App.tsx              # Main app component with routing
│   └── main.tsx             # App entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd admin-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Configuration

The app connects to different API endpoints based on the environment:

- **Production**: `https://urbi.kirschnerklava.com/api`
- **Development**: `http://localhost:8080/api`

Configuration is in `src/config/app.config.ts`

## Key Features Explained

### Authentication Flow
1. App starts → Check localStorage for token and user data
2. If found → Auto-login and redirect to videos page
3. If not found → Show login page
4. After login → Store token and user data, redirect to videos

### Video Upload with Progress
- Select video file (with file type validation)
- Set publish status and link to action
- Real-time upload progress with percentage
- Automatic navigation after successful upload

### Alert System
- Beautiful animated alerts for all operations
- Success, error, warning, and info types
- Auto-dismiss functionality
- Stack multiple alerts
- Slide-in animation from the right

### Video Filtering
- Client-side filtering (all videos loaded once)
- Filter by publish status
- Visual filter indicator with clear button
- Filter state persists during session

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Urbi Project
