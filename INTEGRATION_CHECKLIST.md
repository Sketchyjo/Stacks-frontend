# Integration Checklist - Code Quality Improvements

Use this checklist to integrate the improvements into your STACK app.

---

## ✅ Phase 1: Core Integration (Required)

### 1. Add Error Boundary to Root Layout
**File**: `app/_layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      {/* Your existing layout code */}
    </ErrorBoundary>
  );
}
```

- [ ] Import ErrorBoundary
- [ ] Wrap root component
- [ ] Test error boundary with intentional error
- [ ] Verify error screen displays correctly

### 2. Update Package Dependencies
**File**: `package.json`

```bash
# Install Sentry (optional but recommended)
npm install @sentry/react-native

# Install testing utilities (if not already installed)
npm install --save-dev @testing-library/react-native jest
```

- [ ] Install Sentry SDK
- [ ] Install testing libraries
- [ ] Run `npm install`
- [ ] Verify no dependency conflicts

### 3. Configure Sentry (Production Error Tracking)
**File**: `app/_layout.tsx` or `index.js`

```typescript
import * as Sentry from '@sentry/react-native';

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: false,
  });
}
```

- [ ] Get Sentry DSN from sentry.io
- [ ] Add DSN to `.env` file
- [ ] Initialize Sentry in app entry
- [ ] Test error reporting in production build

### 4. Update Error Logger with Sentry
**File**: `utils/errorLogger.ts`

```typescript
import * as Sentry from '@sentry/react-native';

// In logError method
if (this.isProduction) {
  Sentry.captureException(error, { 
    contexts: { custom: context } 
  });
}
```

- [ ] Import Sentry
- [ ] Update logError method
- [ ] Test error logging
- [ ] Verify errors appear in Sentry dashboard

---

## ✅ Phase 2: Validation Integration (Recommended)

### 1. Update Sign-Up Form
**File**: `app/(auth)/signup.tsx` or similar

```typescript
import { validateEmail, validatePassword } from '@/utils/validators';

const handleSignUp = () => {
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    setError(emailResult.error);
    return;
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    setError(passwordResult.error);
    return;
  }

  // Proceed with sign-up
};
```

- [ ] Import validators
- [ ] Add email validation
- [ ] Add password validation
- [ ] Test with invalid inputs
- [ ] Verify error messages display

### 2. Update Login Form
**File**: `app/(auth)/signin.tsx` or similar

```typescript
import { validateEmail } from '@/utils/validators';

const handleLogin = () => {
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    setError(emailResult.error);
    return;
  }

  if (!password) {
    setError('Password is required');
    return;
  }

  // Proceed with login
};
```

- [ ] Import validators
- [ ] Add email validation
- [ ] Add password check
- [ ] Test with invalid inputs
- [ ] Verify error messages display

### 3. Update Passcode Screens
Already updated in:
- `app/authorize-transaction.tsx` ✅
- `app/login-passcode.tsx` ✅

- [ ] Verify passcode validation works
- [ ] Test with invalid passcodes
- [ ] Check error messages

### 4. Update Amount Input Screens
**File**: Any screen with amount input

```typescript
import { validateAmount } from '@/utils/validators';

const handleAmountChange = (value: string) => {
  const result = validateAmount(value, 0, maxAmount);
  if (!result.isValid) {
    setError(result.error);
    return;
  }
  
  // Proceed with amount
};
```

- [ ] Import validateAmount
- [ ] Add validation
- [ ] Set appropriate min/max
- [ ] Test edge cases

---

## ✅ Phase 3: Error Logging Integration (Recommended)

### 1. Update API Service Files
**Files**: `api/services/*.ts`

```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  const response = await apiClient.post('/endpoint', data);
  return response;
} catch (error) {
  errorLogger.logApiError(error, '/endpoint', 'POST');
  throw error;
}
```

- [ ] Import errorLogger
- [ ] Add logging to auth service
- [ ] Add logging to wallet service
- [ ] Add logging to portfolio service
- [ ] Test error logging

### 2. Update Store Files
Already updated in:
- `stores/authStore.ts` ✅
- `stores/walletStore.ts` ✅

- [ ] Verify error logging works
- [ ] Check console logs in dev
- [ ] Verify Sentry logs in production

### 3. Update Navigation Hooks
**File**: `hooks/useProtectedRoute.ts`

```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  // Navigation logic
} catch (error) {
  errorLogger.logNavigationError(error, targetRoute);
  throw error;
}
```

- [ ] Import errorLogger
- [ ] Add logging for navigation errors
- [ ] Test error scenarios

---

## ✅ Phase 4: Testing (Critical)

### 1. Unit Tests for Validators
**File**: `__tests__/utils/validators.test.ts`

```typescript
import { validateEmail, validatePassword } from '@/utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

- [ ] Create test file
- [ ] Write tests for all validators
- [ ] Run tests: `npm test`
- [ ] Ensure 100% coverage for validators

### 2. Integration Tests for Error Handling
**File**: `__tests__/integration/error-handling.test.ts`

```typescript
describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    // Mock API error
    // Trigger error
    // Verify error message displayed
    // Verify error logged
  });
});
```

- [ ] Create test file
- [ ] Test API error scenarios
- [ ] Test validation errors
- [ ] Test error boundary

### 3. Manual Testing Checklist

#### Authentication Flow
- [ ] Test login with invalid email
- [ ] Test login with invalid password
- [ ] Test login with network error
- [ ] Test account lockout after 5 attempts
- [ ] Test sign-up with weak password
- [ ] Test sign-up with invalid email

#### Passcode Flow
- [ ] Test passcode with < 4 digits
- [ ] Test passcode with > 4 digits
- [ ] Test passcode with letters
- [ ] Test incorrect passcode
- [ ] Test network error during verification

#### Wallet Flow
- [ ] Test wallet load with API error
- [ ] Test wallet with invalid data
- [ ] Test wallet with network error
- [ ] Verify fallback to mock data

#### Error Boundary
- [ ] Trigger intentional error
- [ ] Verify error screen displays
- [ ] Test "Try Again" button
- [ ] Verify error logged

---

## ✅ Phase 5: Environment Configuration

### 1. Update Environment Variables
**File**: `.env`

```env
# Sentry
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# API
EXPO_PUBLIC_API_URL=your_api_url_here

# Feature Flags
EXPO_PUBLIC_ENABLE_ERROR_LOGGING=true
```

- [ ] Add Sentry DSN
- [ ] Add API URL
- [ ] Add feature flags
- [ ] Update `.env.example`

### 2. Update App Configuration
**File**: `app.json`

```json
{
  "expo": {
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps",
          "config": {
            "organization": "your-org",
            "project": "stack-app"
          }
        }
      ]
    }
  }
}
```

- [ ] Add Sentry configuration
- [ ] Configure source maps
- [ ] Test production build

---

## ✅ Phase 6: Documentation Updates

### 1. Update README
**File**: `README.md`

- [ ] Add error handling section
- [ ] Document new utilities
- [ ] Update setup instructions
- [ ] Add troubleshooting guide

### 2. Update Contributing Guide
**File**: `CONTRIBUTING.md`

- [ ] Add error handling guidelines
- [ ] Add validation requirements
- [ ] Add testing requirements
- [ ] Add code review checklist

### 3. Create Developer Guide
**File**: `docs/DEVELOPER_GUIDE.md`

- [ ] Document error handling patterns
- [ ] Document validation usage
- [ ] Document logging usage
- [ ] Add code examples

---

## ✅ Phase 7: Code Review & Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Error boundary integrated
- [ ] Sentry configured
- [ ] Validators integrated
- [ ] Error logging working
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] Team review complete

### Deployment Steps
1. [ ] Create release branch
2. [ ] Run full test suite
3. [ ] Build production app
4. [ ] Test on physical devices
5. [ ] Deploy to staging
6. [ ] Verify Sentry integration
7. [ ] Deploy to production
8. [ ] Monitor error logs

---

## 📊 Success Metrics

After integration, verify:
- [ ] Zero unhandled errors in production
- [ ] All errors logged to Sentry
- [ ] User-friendly error messages displayed
- [ ] No app crashes from errors
- [ ] Error recovery working
- [ ] Validation preventing bad inputs

---

## 🆘 Troubleshooting

### Error Boundary Not Catching Errors
- Ensure ErrorBoundary wraps the component
- Check if error is in event handler (use try-catch)
- Verify ErrorBoundary is in component tree

### Sentry Not Logging Errors
- Check Sentry DSN is correct
- Verify Sentry initialized before errors
- Check network connectivity
- Verify source maps uploaded

### Validators Not Working
- Check import paths
- Verify validator called before submission
- Check error state updated
- Verify error message displayed

---

## 📞 Support

If you encounter issues:
1. Check `docs/IMPROVEMENTS.md` for detailed guide
2. Review this checklist
3. Check error logs
4. Contact development team

---

**Status**: Ready for Integration
**Estimated Time**: 4-6 hours
**Priority**: High (Required for Production)
