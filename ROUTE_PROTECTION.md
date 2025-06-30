# Route Protection System

This document outlines the comprehensive route protection system implemented in the EventHub application.

## Overview

The application uses multiple guards and strategies to protect routes and ensure proper authentication flow:

1. **AuthGuard** - Protects authenticated routes
2. **GuestGuard** - Prevents authenticated users from accessing auth pages
3. **RoleGuard** - Role-based access control (extensible)
4. **NavigationGuard** - Comprehensive navigation control

## Protected Routes

### Authenticated Routes (Protected by AuthGuard)
All these routes require user authentication:

- `/` (root) - Redirects to `/events` if authenticated
- `/events` - Event list page
- `/events/create` - Create new event
- `/events/edit/:id` - Edit existing event
- `/events/:id` - View event details

### Guest Routes (Protected by GuestGuard)
These routes are only accessible to non-authenticated users:

- `/auth/login` - Login page
- `/auth/register` - Registration page

## Guard Implementations

### AuthGuard
```typescript
// Protects routes requiring authentication
// Redirects to /auth/login if not authenticated
// Stores attempted URL for post-login redirect
```

### GuestGuard
```typescript
// Prevents authenticated users from accessing auth pages
// Redirects to /events if already authenticated
```

### RoleGuard (Future Extension)
```typescript
// Role-based access control
// Currently supports 'admin' and 'user' roles
// Extensible for future role requirements
```

### NavigationGuard
```typescript
// Comprehensive navigation control
// Handles both authentication and guest scenarios
// Can be used as a single guard for complex routing
```

## Authentication Flow

### Login Process
1. User accesses protected route
2. AuthGuard checks authentication status
3. If not authenticated, redirects to `/auth/login`
4. Stores original URL in localStorage
5. After successful login, redirects to original URL

### Logout Process
1. User clicks logout
2. AuthService clears user session
3. Redirects to `/auth/login`
4. All protected routes become inaccessible

## Features

### Return URL Handling
- When users try to access protected routes while not authenticated
- The original URL is stored and user is redirected after login
- Provides seamless user experience

### Permission Error Handling
- Users with insufficient permissions see error messages
- Clean URL handling removes error parameters
- User-friendly feedback via snackbar notifications

### Session Persistence
- User sessions persist across browser refreshes
- Automatic login restoration from localStorage
- Secure session management

## Default Test Accounts

The system includes default test accounts:

```typescript
// Admin account (full access)
Username: admin
Password: admin123

// Regular user account
Username: user  
Password: user123
```

## Route Configuration

```typescript
export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'events', 
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule) 
  },
  { 
    path: 'events', 
    loadComponent: () => import('./events/event-list/event-list').then(m => m.EventListComponent),
    canActivate: [AuthGuard]
  },
  // ... other protected routes
  { path: '**', redirectTo: 'auth/login' }
];
```

## Security Features

1. **Route Protection** - All sensitive routes require authentication
2. **Guest Route Protection** - Prevents auth page access when logged in
3. **Session Management** - Secure token-based authentication
4. **Return URL** - Seamless redirect after authentication
5. **Error Handling** - User-friendly permission error messages
6. **Clean URLs** - Automatic cleanup of error parameters

## Future Enhancements

1. **JWT Tokens** - Replace localStorage with secure JWT tokens
2. **Role Permissions** - Granular permission system
3. **Route Data Protection** - Protect specific data based on ownership
4. **Multi-factor Authentication** - Enhanced security options
5. **Session Timeout** - Automatic logout after inactivity

## Testing the Protection

1. **Test Unauthenticated Access**:
   - Try accessing `/events` without login
   - Should redirect to `/auth/login`
   - After login, should return to `/events`

2. **Test Authenticated Redirect**:
   - Login successfully
   - Try accessing `/auth/login`
   - Should redirect to `/events`

3. **Test Permission Errors**:
   - Access routes with insufficient permissions
   - Should see error message and redirect

4. **Test Session Persistence**:
   - Login and refresh browser
   - Should remain authenticated
   - Should maintain access to protected routes 