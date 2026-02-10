# Frontend Library

Reusable frontend library for Foundation-SDK applications, providing authentication, user management, and utility functions.

## Installation

```bash
npm install frontend-lib
```

## Usage

### Authentication

```typescript
import { useLogin, useAuth } from 'frontend-lib';

// Login Form Component
function LoginForm() {
  const { login, isLoading, error } = useLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Login successful - user is automatically stored
    } catch (error) {
      // Handle login error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

// Auth State Management
function App() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          Welcome, {user?.first_name}!
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
```

### API Calls

```typescript
import { authApi } from 'frontend-lib';

// Direct API usage
const handleLogin = async () => {
  try {
    const response = await authApi.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (response.success) {
      console.log('User logged in:', response.user);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Storage Utilities

```typescript
import { storage } from 'frontend-lib';

// Manual storage management
storage.setUser(userData);
const user = storage.getUser();
storage.clearUser();
const hasSession = storage.hasValidSession();
```

### Logging

```typescript
import { getLogger } from 'frontend-lib';

const logger = getLogger('MyComponent');

logger.info('Component mounted');
logger.error('Something went wrong', { details: 'error info' });
```

## Features

- ✅ Authentication (login, register, logout)
- ✅ Session management with localStorage
- ✅ Type-safe API calls
- ✅ React hooks for easy integration
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ TypeScript support

## API Reference

### Hooks

- `useLogin()` - Login and registration functionality
- `useAuth()` - Authentication state management

### API Functions

- `authApi.login(credentials)` - Authenticate user
- `authApi.register(userData)` - Register new user
- `authApi.logout()` - Logout current user
- `authApi.getProfile()` - Get user profile

### Utilities

- `storage` - localStorage management
- `getLogger(context)` - Logging utility

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
```

## Development

```bash
npm run dev    # Watch mode
npm run build  # Build for production
npm run clean  # Clean build files
```
