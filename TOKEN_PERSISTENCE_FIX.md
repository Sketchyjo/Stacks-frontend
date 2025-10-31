# Token Persistence Fix

## Issue
`hasToken` was returning `false` in routing logs even though:
- `isAuthenticated` was `true`
- `hasUser` was `true`  
- The 7-day token expiry hadn't occurred
- User had successfully authenticated

## Root Cause
Two separate issues were causing the problem:

### 1. **Stale State in useProtectedRoute**
The `authState` object at the top of `useProtectedRoute` was created using Zustand selectors that captured values when the component first rendered. These values could be stale because:
- AsyncStorage hydration might not be complete when component first renders
- The 200ms delay wasn't enough for Zustand to hydrate persisted state
- React's render cycle meant the selectors had old values

### 2. **Inconsistent Session Clearing**
When `clearPasscodeSession()` was called on app background, there was confusion about what should be cleared:
- Passcode session tokens should be cleared (10-minute session)
- Access/refresh tokens should remain (7-day session)
- `isAuthenticated` state was inconsistent with token presence

## Solution

### 1. **Use Fresh State in Routing Logic**
Changed the routing check to get fresh state directly from the store instead of using stale selector values:

```typescript
// OLD - uses stale values from component render
const hasValidPasscodeSession = authState.isAuthenticated 
  ? !SessionManager.isPasscodeSessionExpired() 
  : false;

// NEW - gets fresh values from store
const freshAuthState = useAuthStore.getState();
const currentAuthState: AuthState = {
  user: freshAuthState.user,
  isAuthenticated: freshAuthState.isAuthenticated,
  accessToken: freshAuthState.accessToken,
  refreshToken: freshAuthState.refreshToken,
  // ...
};
```

### 2. **Increased Hydration Delay**
Increased AsyncStorage hydration wait time from 200ms to 500ms to ensure Zustand has enough time to load persisted state.

### 3. **Added State Logging After Hydration**
Added comprehensive logging after hydration to track if tokens are properly loaded:

```typescript
console.log('[Auth] State after hydration:', {
  hasUser: !!freshState.user,
  hasAccessToken: !!freshState.accessToken,
  hasRefreshToken: !!freshState.refreshToken,
  isAuthenticated: freshState.isAuthenticated,
});
```

### 4. **Clarified clearPasscodeSession Behavior**
Updated `clearPasscodeSession()` to make it clear that it:
- ✅ Clears `passcodeSessionToken` and `passcodeSessionExpiresAt`
- ✅ Keeps `accessToken` and `refreshToken` intact
- ✅ Keeps `isAuthenticated` as true
- ✅ Keeps user data for quick re-auth

This allows users to verify their passcode and get new passcode session tokens without needing to fetch new access/refresh tokens from the server.

## Session Types Clarification

### **7-Day Authentication Session**
- Stored: `accessToken`, `refreshToken`, `tokenExpiresAt`, `user`
- Duration: 7 days
- Cleared: Only when 7-day expiry occurs or manual logout
- Purpose: Server API authentication

### **10-Minute Passcode Session**  
- Stored: `passcodeSessionToken`, `passcodeSessionExpiresAt`
- Duration: 10 minutes OR until app backgrounds
- Cleared: On app background/minimize OR after 10 minutes
- Purpose: Quick UI access without re-entering passcode

## Files Modified

### `hooks/useProtectedRoute.ts`
- Increased hydration delay from 200ms to 500ms
- Added state logging after hydration
- Changed routing logic to use fresh state from `useAuthStore.getState()`
- Updated logs to show `hasRefreshToken` as well

### `stores/authStore.ts`
- Added clarifying comments to `clearPasscodeSession()`
- Ensured only passcode session tokens are cleared, not auth tokens

### `utils/sessionManager.ts`
- Added detailed state logging on initialization
- Shows presence of all tokens and user data

## Testing

To verify the fix works:

1. **App Restart Test**
   ```
   - Log in with email/password
   - Set up passcode
   - Close app completely
   - Reopen app
   - Check logs: Should show hasToken: true, hasRefreshToken: true
   ```

2. **Background Test**
   ```
   - Log in and use app
   - Minimize app (home button/swipe up)
   - Wait 5 seconds
   - Return to app
   - Check logs: Should show hasToken: true, hasRefreshToken: true
   - Should see passcode screen (passcode session cleared)
   - Enter passcode
   - Should access app without re-login
   ```

3. **Token Expiry Test**
   ```
   - Set system time forward 8 days
   - Open app
   - Should redirect to full login (not passcode)
   - Tokens should be cleared
   ```

## Expected Log Output

### On App Start (Successful Hydration)
```
[Auth] App initializing - checking routing...
[Auth] State after hydration: {
  hasUser: true,
  hasAccessToken: true,
  hasRefreshToken: true,
  isAuthenticated: true
}
[SessionManager] Initializing with state: {
  hasUser: true,
  hasAccessToken: true,
  hasRefreshToken: true,
  isAuthenticated: true,
  hasPasscodeSession: false
}
[Auth] Routing check: {
  currentPath: "/",
  targetRoute: "/login-passcode",
  isAuthenticated: true,
  hasUser: true,
  hasToken: true,
  hasRefreshToken: true,
  hasValidPasscodeSession: false
}
```

### After Backgrounding App
```
[Auth] App going to background - clearing passcode session for security
[AuthStore] Clearing passcode session (keeping user data and tokens for re-auth)
```

### When Returning to App
```
[Auth] App came to foreground - re-validating routing
[Auth] Passcode session expired - need to re-authenticate with passcode
[SessionManager] Passcode session expired, clearing passcode session token
[Auth] Routing check: {
  hasToken: true,
  hasRefreshToken: true,
  hasValidPasscodeSession: false
}
[Auth] Navigating to: /login-passcode
```

## Key Takeaways

1. **Always use `useAuthStore.getState()` for critical decisions** - Zustand selectors at component level can be stale during hydration
2. **Increase hydration delays for AsyncStorage** - 500ms is safer than 200ms for ensuring state is loaded
3. **Log comprehensively during hydration** - Makes debugging token issues much easier
4. **Separate session types clearly** - 7-day auth tokens vs 10-minute passcode session
5. **Be explicit about what gets cleared** - Comments prevent future confusion about session management
