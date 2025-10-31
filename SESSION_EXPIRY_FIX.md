# Session Token Expiry Fix

## Problem
The app was not properly distinguishing between two different types of session expiry:

1. **Passcode Session Expiry** (10 minutes) - Should route to `/login-passcode`
2. **Full Session Token Expiry** (7 days) - Should route to `/(auth)/signin`

Both scenarios were incorrectly routing to `/login-passcode`, causing confusion when the 7-day session expired.

## Root Cause
The routing logic in `routeHelpers.ts` was checking for `!isAuthenticated && user` and always routing to `/login-passcode`, without checking if the refresh token still existed to distinguish between:
- **Passcode session expired** (tokens exist, user data exists)
- **Full session expired** (no tokens, no user data should exist)

## Solution

### 1. Updated Session Expiration Handling (`sessionManager.ts`)

#### `handleSessionExpired()` - Full 7-Day Session Expiry
```typescript
// Clears ALL auth data including user data
// User must do full re-authentication (email/password)
useAuthStore.setState({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null, // ✅ Clear user data - requires full signin
  passcodeSessionToken: undefined,
  passcodeSessionExpiresAt: undefined,
  lastActivityAt: null,
});
```

#### `handleInactivityTimeout()` - 30-Minute Inactivity
```typescript
// Clears passcode session but keeps user data
// User can use passcode to re-authenticate
useAuthStore.setState({
  isAuthenticated: false,
  passcodeSessionToken: undefined,
  passcodeSessionExpiresAt: undefined,
  lastActivityAt: null,
  user: user, // ✅ Keep user data for passcode re-auth
});
```

#### `handlePasscodeSessionExpired()` - 10-Minute Passcode Expiry
```typescript
// Only clears the passcode session tokens
clearPasscodeSession(); // Clears passcodeSessionToken & passcodeSessionExpiresAt
```

### 2. Updated Routing Logic (`routeHelpers.ts`)

#### `handleStoredCredentials()`
Now checks if `refreshToken` exists to distinguish between scenarios:

```typescript
const handleStoredCredentials = (
  authState: AuthState,
  config: RouteConfig,
  hasSessionExpired: boolean // ✅ New parameter
): string | null => {
  const { user } = authState;
  
  // Scenario 1: Full 7-day session expired (no tokens, no user)
  if (hasSessionExpired && !user) {
    return '/(auth)/signin'; // ✅ Route to signin for full re-auth
  }
  
  // Scenario 2: Passcode session expired (tokens exist, user exists)
  if (user) {
    return '/login-passcode'; // ✅ Route to passcode for quick re-auth
  }
  
  return null;
};
```

#### `determineRoute()`
Now passes `hasSessionExpired` flag based on `refreshToken` presence:

```typescript
if (!isAuthenticated && user) {
  // If no refresh token, the 7-day session has fully expired
  const hasSessionExpired = !refreshToken;
  return handleStoredCredentials(authState, config, hasSessionExpired);
}
```

### 3. Updated Type Definitions (`routing.types.ts`)
Added `refreshToken` to `AuthState` interface:

```typescript
export interface AuthState {
  user: any;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null; // ✅ Added
  onboardingStatus: string | null;
  pendingVerificationEmail: string | null;
}
```

### 4. Updated Hook (`useProtectedRoute.ts`)
- Added `refreshToken` to auth state
- Delegated expiry handling to `SessionManager`

## Flow Summary

### Scenario 1: Passcode Session Expires (10 mins / app background / 30 min inactivity)
```
User opens app
  → Passcode session expired
  → `isAuthenticated = false` + `user` data exists
  → `refreshToken` still exists
  → Route to `/login-passcode`
  → User enters passcode
  → New session tokens generated
  → User authenticated ✅
```

### Scenario 2: Full Session Expires (7 days)
```
User opens app after 7 days
  → Session tokens expired/invalid
  → SessionManager.handleSessionExpired() called
  → Clears ALL auth data (accessToken, refreshToken, user)
  → `isAuthenticated = false` + `user = null`
  → `refreshToken = null` (hasSessionExpired = true)
  → Route to `/(auth)/signin`
  → User must login with email/password
  → Full authentication flow ✅
```

## Key Changes

1. ✅ **7-day session expiry** → Route to `/(auth)/signin` (full re-auth)
2. ✅ **Passcode session expiry** → Route to `/login-passcode` (quick re-auth)
3. ✅ **30-min inactivity** → Route to `/login-passcode` (preserves user data)
4. ✅ **App backgrounding** → Clears passcode session only
5. ✅ **Clear separation** of concerns in SessionManager

## Testing Checklist

- [ ] User logs in with email/password → Works
- [ ] App goes to background → Routes to `/login-passcode` on return
- [ ] 30 minutes of inactivity → Routes to `/login-passcode`
- [ ] Passcode session expires (10 mins) → Routes to `/login-passcode`
- [ ] Full session expires (7 days) → Routes to `/(auth)/signin`
- [ ] User enters correct passcode → Generates new tokens and authenticates
- [ ] User enters email/password after 7-day expiry → Full authentication works
