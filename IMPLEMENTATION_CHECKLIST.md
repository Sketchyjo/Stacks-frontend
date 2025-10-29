# Implementation Checklist - Zustand Persistence & Session Management

## ✅ Completed Changes

### 1. Auth Store (`stores/authStore.ts`)
- [x] Added `tokenIssuedAt: string | null` field
- [x] Added `tokenExpiresAt: string | null` field
- [x] Added `checkTokenExpiry()` method
- [x] Added `clearExpiredSession()` method
- [x] Updated `login()` to set token timestamps
- [x] Updated `setTokens()` to set token timestamps
- [x] Updated `verifyPasscode()` to set token timestamps
- [x] Updated `partialize` to include all fields:
  - [x] `tokenIssuedAt`
  - [x] `tokenExpiresAt`
  - [x] `currentOnboardingStep`
  - [x] All existing fields

### 2. Auth Hooks (`api/hooks/useAuth.ts`)
- [x] Updated `useVerifyCode()` to set token timestamps
- [x] Calculate 7-day expiry if backend doesn't provide
- [x] Set `tokenIssuedAt` and `tokenExpiresAt`

### 3. Session Manager (`utils/sessionManager.ts`)
- [x] Check `checkTokenExpiry()` on initialization
- [x] Check token expiry in health checks
- [x] Use `clearExpiredSession()` for expired tokens
- [x] Proper handling of 7-day vs 10-min expiry

### 4. Protected Route (`hooks/useProtectedRoute.ts`)
- [x] Skip validation for fresh tokens (< 10 seconds)
- [x] Add 200ms hydration delay
- [x] Check token age before validation

### 5. API Client (`api/client.ts`)
- [x] Enhanced debug logging for missing tokens
- [x] Log full auth state when token missing

### 6. Documentation
- [x] `AUTH_TOKEN_FIX_SUMMARY.md` - Quick fix overview
- [x] `docs/AUTH_TOKEN_PERSISTENCE_FIX.md` - Detailed fix explanation
- [x] `ZUSTAND_PERSISTENCE_SUMMARY.md` - Persistence overview
- [x] `docs/ZUSTAND_PERSISTENCE_GUIDE.md` - Complete guide
- [x] `scripts/test-auth-tokens.ts` - Test script

## 🔍 Verification Steps

### Step 1: Fresh Install Flow
1. [ ] Clear AsyncStorage: `await AsyncStorage.clear()`
2. [ ] Register new account
3. [ ] Verify email with code
4. [ ] Check console logs - should see:
   ```
   [Auth] Token recently issued, skipping validation
   ```
5. [ ] Verify portfolio API call succeeds
6. [ ] Check AsyncStorage contains all fields:
   ```typescript
   {
     user: {...},
     accessToken: "...",
     refreshToken: "...",
     tokenIssuedAt: "2024-...",
     tokenExpiresAt: "2024-...",
     lastActivityAt: "2024-...",
     isAuthenticated: true,
     ...
   }
   ```

### Step 2: App Reload
1. [ ] Close and reopen app
2. [ ] Should stay logged in
3. [ ] Check console - should see:
   ```
   [SessionManager] Initializing session management
   ```
4. [ ] No token validation errors
5. [ ] Portfolio loads successfully

### Step 3: Passcode Session Expiry (10 mins)
1. [ ] Manually set expired passcode session:
   ```typescript
   useAuthStore.setState({
     passcodeSessionExpiresAt: new Date(Date.now() - 1000).toISOString()
   });
   ```
2. [ ] Reload app
3. [ ] Should route to `/login-passcode`
4. [ ] User data should still be present
5. [ ] After entering passcode, should access app

### Step 4: Token Expiry (7 days)
1. [ ] Manually set expired token:
   ```typescript
   useAuthStore.setState({
     tokenExpiresAt: new Date(Date.now() - 1000).toISOString()
   });
   ```
2. [ ] Reload app
3. [ ] Should route to `/(auth)/signin`
4. [ ] User data should be cleared
5. [ ] Must sign in again

### Step 5: Background/Foreground
1. [ ] Open app and authenticate
2. [ ] Background app (Home button)
3. [ ] Wait 5 seconds
4. [ ] Reopen app
5. [ ] Should require passcode re-entry
6. [ ] After passcode, should access app

### Step 6: Inactivity Timeout (30 mins)
1. [ ] Open app and authenticate
2. [ ] Don't interact for 30+ minutes
3. [ ] Try to navigate or make API call
4. [ ] Should require passcode re-entry

## 🧪 Manual Testing Commands

### Check AsyncStorage Contents
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const authData = await AsyncStorage.getItem('auth-storage');
console.log(JSON.parse(authData));
```

### Test Token Expiry
```typescript
import { useAuthStore } from './stores/authStore';

// Test 7-day expiry
useAuthStore.setState({
  tokenExpiresAt: new Date(Date.now() - 1000).toISOString()
});
console.log(useAuthStore.getState().checkTokenExpiry()); // true

// Test passcode expiry
useAuthStore.setState({
  passcodeSessionExpiresAt: new Date(Date.now() - 1000).toISOString()
});
console.log(useAuthStore.getState().checkPasscodeSessionExpiry()); // true

// Test inactivity
useAuthStore.setState({
  lastActivityAt: new Date(Date.now() - 31 * 60 * 1000).toISOString()
});
console.log(useAuthStore.getState().checkSessionTimeout()); // true
```

### Clear Session Manually
```typescript
// Clear only passcode session
useAuthStore.getState().clearPasscodeSession();

// Clear entire session
useAuthStore.getState().clearExpiredSession();

// Full reset
useAuthStore.getState().reset();
```

## 🚨 Common Issues & Solutions

### Issue: Tokens not persisting after verification
**Check:**
- `tokenIssuedAt` and `tokenExpiresAt` are being set
- `partialize` includes these fields
- AsyncStorage has write permissions

**Solution:**
- Verify `useVerifyCode` hook sets all fields
- Check console for AsyncStorage errors

### Issue: User logged out immediately
**Check:**
- Token age calculation in `useProtectedRoute`
- `lastActivityAt` is being set properly

**Solution:**
- Should skip validation if token < 10 seconds old
- Verify 200ms hydration delay

### Issue: Passcode session clearing user data
**Check:**
- `clearPasscodeSession()` method
- Only passcode fields should be cleared

**Solution:**
- Use `clearPasscodeSession()` NOT `clearExpiredSession()`
- Verify user data preserved after passcode expiry

### Issue: 7-day expiry not working
**Check:**
- `tokenExpiresAt` is being set correctly
- `checkTokenExpiry()` is being called

**Solution:**
- Verify expiry date is 7 days in future
- Check SessionManager initialization

## 📊 Expected Behavior Matrix

| Scenario | User Data | Tokens | Passcode Session | Action Required |
|----------|-----------|--------|------------------|-----------------|
| Fresh install | ❌ | ❌ | ❌ | Sign up + verify email |
| After verification | ✅ | ✅ | ✅ | Access granted |
| App reload (< 7 days) | ✅ | ✅ | Check expiry | Enter passcode if expired |
| App backgrounded | ✅ | ✅ | ❌ Cleared | Enter passcode |
| 30 min inactive | ✅ | ✅ | ❌ Cleared | Enter passcode |
| 7 days passed | ❌ Cleared | ❌ Cleared | ❌ Cleared | Sign in again |

## 🎯 Success Criteria

### Must Pass
- [ ] Email verification → tokens persist → portfolio loads
- [ ] App reload → stays logged in (if < 7 days)
- [ ] Passcode session expires → user data preserved
- [ ] 7-day expiry → user data cleared
- [ ] All fields persist to AsyncStorage
- [ ] No 401 errors after verification

### Should Pass
- [ ] Background/foreground → passcode required
- [ ] 30 min inactivity → passcode required
- [ ] Token refresh works correctly
- [ ] Health checks run every 5 minutes

## 📝 Next Steps After Verification

1. [ ] Test on physical device (not just simulator)
2. [ ] Test with slow network conditions
3. [ ] Test with app killed and restarted (force quit)
4. [ ] Monitor crash reports for AsyncStorage errors
5. [ ] Add analytics for session expiry events
6. [ ] Consider adding user notification before expiry

## 🔗 Related Documentation

- `ZUSTAND_PERSISTENCE_SUMMARY.md` - Quick reference
- `docs/ZUSTAND_PERSISTENCE_GUIDE.md` - Full guide
- `AUTH_TOKEN_FIX_SUMMARY.md` - Token fix overview
- `docs/AUTH_TOKEN_PERSISTENCE_FIX.md` - Detailed fix docs
