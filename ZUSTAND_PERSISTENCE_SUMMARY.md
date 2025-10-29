# Zustand Persistence Summary

## What's Persisted

**ALL authentication and user data** is now persisted to AsyncStorage:

### ✅ Persisted Fields
- `user` - Full user profile
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token  
- `tokenIssuedAt` - When token was issued
- `tokenExpiresAt` - When token expires (7 days)
- `lastActivityAt` - Last activity timestamp
- `isAuthenticated` - Authentication status
- `hasPasscode` - Passcode setup status
- `hasCompletedOnboarding` - Onboarding completion
- `onboardingStatus` - Current onboarding stage
- `currentOnboardingStep` - Current step
- `pendingVerificationEmail` - Email awaiting verification
- `isBiometricEnabled` - Biometric setting
- `passcodeSessionToken` - 10-min session token
- `passcodeSessionExpiresAt` - Passcode session expiry

### ❌ NOT Persisted (Temporary)
- `isLoading` - Loading states
- `error` - Error messages

## Session Expiry

### 7-Day Token Expiry
**Clears:** ALL data including user profile
**User must:** Sign in with email/password again

```typescript
checkTokenExpiry() // Returns true after 7 days
clearExpiredSession() // Clears everything
```

### 10-Minute Passcode Session
**Clears:** Only passcode session tokens
**Preserves:** User data, main tokens
**User must:** Re-enter passcode

```typescript
checkPasscodeSessionExpiry() // Returns true after 10 mins
clearPasscodeSession() // Only clears passcode session
```

## Implementation

### Store Setup
```typescript
// stores/authStore.ts
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({ /* state */ }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // All fields listed above
      }),
    }
  )
);
```

### Session Checks
```typescript
// On app initialization
SessionManager.initialize();
  - checkTokenExpiry() → 7 days
  - checkSessionTimeout() → 30 min inactivity  
  - checkPasscodeSessionExpiry() → 10 mins

// Every 5 minutes
scheduleHealthCheck();
  - Revalidates all timeouts
```

## Usage Examples

### Setting Tokens (Email Verification)
```typescript
const now = new Date();
const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

useAuthStore.setState({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  tokenIssuedAt: now.toISOString(),
  tokenExpiresAt: expiresAt.toISOString(),
  lastActivityAt: now.toISOString(),
  user: response.user,
  isAuthenticated: true,
});
```

### Clearing Sessions
```typescript
// Full 7-day session expired
useAuthStore.getState().clearExpiredSession();

// Just passcode session expired
useAuthStore.getState().clearPasscodeSession();
```

### Checking Expiry
```typescript
// Check if user needs to re-authenticate
const tokenExpired = useAuthStore.getState().checkTokenExpiry();
const passcodeExpired = useAuthStore.getState().checkPasscodeSessionExpiry();
const inactive = useAuthStore.getState().checkSessionTimeout();
```

## Files Modified

1. **stores/authStore.ts**
   - Added `tokenIssuedAt`, `tokenExpiresAt`
   - Added `checkTokenExpiry()`, `clearExpiredSession()`
   - Updated `partialize` to persist all fields
   - Set token expiry on login, verification, passcode auth

2. **utils/sessionManager.ts**
   - Check `checkTokenExpiry()` on initialization
   - Check token expiry in health checks
   - Use `clearExpiredSession()` for 7-day expiry

3. **api/hooks/useAuth.ts**
   - Set `tokenIssuedAt` and `tokenExpiresAt` on verification
   - Calculate 7-day expiry if not provided by backend

## Testing

```bash
# Run app and verify persistence
npm start

# Check AsyncStorage
await AsyncStorage.getItem('auth-storage')

# Test expiry manually
useAuthStore.setState({
  tokenExpiresAt: new Date(Date.now() - 1000).toISOString()
});
```

## Migration

If updating from previous version:
1. Clear AsyncStorage once: `await AsyncStorage.clear()`
2. Sign in again to populate new fields
3. Verify `tokenExpiresAt` is being set

## See Also
- `docs/ZUSTAND_PERSISTENCE_GUIDE.md` - Full documentation
- `docs/AUTH_TOKEN_PERSISTENCE_FIX.md` - Token persistence fix details
- `AUTH_TOKEN_FIX_SUMMARY.md` - Quick fix overview
