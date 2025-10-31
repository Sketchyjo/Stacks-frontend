# Authentication & Session Management Fix

## Issues Fixed

### 1. **"No refresh token available" Error**
**Problem:** When verifying passcode, the refresh token wasn't being properly stored in the auth store, causing subsequent API calls to fail.

**Solution:**
- Updated `useVerifyPasscode` hook to properly store all token fields including `accessToken`, `refreshToken`, `tokenExpiresAt`, `tokenIssuedAt`
- Added logging to track token storage at each step
- Ensured atomic updates to prevent race conditions

### 2. **Excessive Passcode Re-authentication**
**Problem:** The app was asking for passcode too frequently due to:
- 30-minute inactivity timeout clearing sessions
- Aggressive session validation on every state change
- Health checks running every 5 minutes checking inactivity

**Solution:**
- **Removed all inactivity timeout checks** - The 30-minute inactivity timer has been completely removed
- Passcode session now only clears when:
  - User minimizes or closes the app (app goes to background)
  - Passcode session token expires (10 minutes after being set)
  - Full 7-day authentication token expires

### 3. **Session Management Clarity**
**Problem:** Multiple overlapping session concepts were causing confusion:
- 7-day authentication tokens
- 10-minute passcode session tokens
- 30-minute inactivity timeout

**Solution:** Simplified to two clear session types:

#### **Authentication Session (7 days)**
- Full authentication tokens (`accessToken`, `refreshToken`)
- Expires after 7 days
- When expired: User must fully re-authenticate with email/password
- Stored tokens are cleared, user data is removed

#### **Passcode Session (10 minutes + app background)**
- Short-lived session token for quick re-auth
- Clears when:
  - App goes to background/minimizes
  - 10 minutes pass since verification
- When expired: User enters passcode to get new tokens
- User data remains stored for quick re-auth

## Key Changes

### `stores/authStore.ts`
- Removed `checkSessionTimeout()` method (no more inactivity checks)
- Enhanced `verifyPasscode()` with detailed logging for token storage
- Kept `checkTokenExpiry()` for 7-day token validation only

### `utils/sessionManager.ts`
- Removed `INACTIVITY_TIMEOUT_MS` constant
- Removed `isSessionTimedOut()` method
- Removed `handleInactivityTimeout()` method
- Changed health check interval from 5 minutes to 30 minutes
- Health check now only validates 7-day token expiry, not inactivity

### `hooks/useProtectedRoute.ts`
- Removed all inactivity timeout checks
- App background/foreground transition now only:
  - Clears passcode session when going to background
  - Checks for expired passcode session when returning to foreground
  - Validates 7-day token expiry (not inactivity)

### `api/client.ts`
- Added check for `refreshToken` existence before attempting refresh
- Added `/security/passcode/verify` to list of endpoints that skip retry logic
- Better error handling when refresh token is missing

### `api/hooks/usePasscode.ts`
- Fixed `useVerifyPasscode()` to properly store all token fields
- Added `tokenIssuedAt` and `tokenExpiresAt` fields
- Added comprehensive logging for debugging token storage
- Ensured atomic updates to prevent partial state updates

## User Flow

### Normal Usage
1. User logs in with email/password → Gets 7-day tokens
2. Creates passcode → Can use passcode for quick re-auth
3. Uses app normally → No interruptions
4. Minimizes app → Passcode session clears (security)
5. Returns to app → Enters passcode → Gets new tokens

### After 7 Days
1. 7-day tokens expire
2. User sees login screen (not passcode screen)
3. Must re-authenticate with email/password
4. Gets fresh 7-day tokens

### Token Management
- **Access tokens** are automatically refreshed when needed
- **Refresh tokens** are used to get new access tokens
- **Passcode session tokens** are for quick app re-entry
- All tokens are stored securely in AsyncStorage

## Testing Checklist

- [ ] Verify passcode works on login
- [ ] App can stay open for hours without asking for passcode
- [ ] Minimizing app clears passcode session
- [ ] Returning to app asks for passcode (one time)
- [ ] API calls work after passcode verification
- [ ] No "No refresh token available" errors
- [ ] 7-day token expiry redirects to full login
- [ ] Token refresh works automatically

## Configuration

### Session Durations
- **Authentication Token:** 7 days (`SESSION_TIMEOUT_MS`)
- **Passcode Session:** 10 minutes + app background (`PASSCODE_SESSION_TIMEOUT_MS`)
- **Health Check Interval:** 30 minutes (checks token expiry only)

### Security Measures
- Passcode session always clears on app background
- Access tokens auto-refresh before expiry
- Failed refresh attempts clear all auth state
- Passcode verification doesn't retry on 401 errors

## Production Considerations

1. **Token Security**
   - All tokens stored in encrypted AsyncStorage
   - Tokens never logged in production
   - Automatic cleanup on expiry

2. **Error Handling**
   - Graceful degradation when refresh fails
   - Clear error messages for users
   - Automatic fallback to full re-auth

3. **Performance**
   - Atomic state updates prevent race conditions
   - Minimal health checks (30-minute intervals)
   - No unnecessary token validations

4. **User Experience**
   - Minimal authentication interruptions
   - Clear session state management
   - Predictable passcode prompts (only on app background)
