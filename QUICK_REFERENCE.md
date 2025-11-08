# Quick Reference Guide - Code Quality Improvements

Quick reference for using the new utilities and patterns.

---

## 🛡️ Error Boundary

### Basic Usage
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Custom Fallback
```typescript
<ErrorBoundary
  fallback={(error, resetError) => (
    <CustomErrorScreen error={error} onRetry={resetError} />
  )}
>
  <YourComponent />
</ErrorBoundary>
```

---

## 📝 Validators

### Email
```typescript
import { validateEmail } from '@/utils/validators';

const result = validateEmail(email);
if (!result.isValid) {
  setError(result.error); // "Please enter a valid email address"
  return;
}
```

### Password
```typescript
import { validatePassword } from '@/utils/validators';

const result = validatePassword(password);
if (!result.isValid) {
  setError(result.error); // "Password must be at least 8 characters"
  return;
}
```

### Passcode (4 digits)
```typescript
import { validatePasscode } from '@/utils/validators';

const result = validatePasscode(passcode, 4);
if (!result.isValid) {
  setError(result.error); // "Passcode must be 4 digits"
  return;
}
```

### Amount
```typescript
import { validateAmount } from '@/utils/validators';

const result = validateAmount(amount, 0, 10000);
if (!result.isValid) {
  setError(result.error); // "Amount must be greater than 0"
  return;
}
```

### Phone Number
```typescript
import { validatePhoneNumber } from '@/utils/validators';

const result = validatePhoneNumber(phone);
if (!result.isValid) {
  setError(result.error);
  return;
}
```

### Wallet Address
```typescript
import { validateWalletAddress } from '@/utils/validators';

// Ethereum
const ethResult = validateWalletAddress(address, 'ethereum');

// Solana
const solResult = validateWalletAddress(address, 'solana');
```

### Name
```typescript
import { validateName } from '@/utils/validators';

const result = validateName(name);
if (!result.isValid) {
  setError(result.error);
  return;
}
```

### Verification Code
```typescript
import { validateVerificationCode } from '@/utils/validators';

const result = validateVerificationCode(code, 6);
if (!result.isValid) {
  setError(result.error);
  return;
}
```

---

## 📊 Error Logger

### General Error
```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  // Your code
} catch (error) {
  errorLogger.logError(error, {
    component: 'Portfolio',
    action: 'fetchData',
    userId: user.id,
    metadata: { portfolioId: '123' }
  });
  throw error;
}
```

### API Error
```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  const response = await apiClient.get('/wallet/balance');
} catch (error) {
  errorLogger.logApiError(error, '/wallet/balance', 'GET');
  throw error;
}
```

### Auth Error
```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  await authService.login(email, password);
} catch (error) {
  errorLogger.logAuthError(error, 'login');
  throw error;
}
```

### Wallet Error
```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  await walletService.transfer(amount, recipient);
} catch (error) {
  errorLogger.logWalletError(error, 'transfer');
  throw error;
}
```

### Navigation Error
```typescript
import { errorLogger } from '@/utils/errorLogger';

try {
  router.push('/portfolio');
} catch (error) {
  errorLogger.logNavigationError(error, '/portfolio');
  throw error;
}
```

---

## 🎯 Error Handling Patterns

### Pattern 1: Validate → Execute → Handle
```typescript
// 1. Validate inputs
const emailResult = validateEmail(email);
if (!emailResult.isValid) {
  setError(emailResult.error);
  return;
}

// 2. Execute operation
setIsLoading(true);
setError('');

try {
  const result = await apiCall(email);
  // Handle success
} catch (error: any) {
  // 3. Handle error
  errorLogger.logError(error, { component: 'Login', action: 'submit' });
  const errorMessage = error?.error?.message || 'Operation failed';
  setError(errorMessage);
} finally {
  setIsLoading(false);
}
```

### Pattern 2: Early Returns
```typescript
function handleSubmit() {
  // Validate and return early
  if (!email) {
    setError('Email is required');
    return;
  }

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    setError(emailResult.error);
    return;
  }

  // Continue with valid data
  submitForm();
}
```

### Pattern 3: Error Recovery
```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  errorLogger.logError(error, { component: 'DataFetch' });
  
  // Fallback to cached data
  const cachedData = getCachedData();
  if (cachedData) {
    setData(cachedData);
    setWarning('Using cached data');
  } else {
    setError('Failed to load data');
  }
}
```

---

## 🔒 Security Patterns

### Account Lockout
```typescript
// In authStore.ts - already implemented
const { lockoutUntil } = useAuthStore.getState();
if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
  const remainingMinutes = Math.ceil(
    (new Date(lockoutUntil).getTime() - Date.now()) / 60000
  );
  throw new Error(`Account locked. Try again in ${remainingMinutes} minute(s)`);
}
```

### Password Strength
```typescript
const result = validatePassword(password);
// Checks for:
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
```

### Input Sanitization
```typescript
// Always validate before using
const emailResult = validateEmail(email);
if (!emailResult.isValid) return;

// Email is now safe to use
await authService.login(email, password);
```

---

## 📱 Component Patterns

### Form with Validation
```typescript
function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate
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

    // Execute
    setIsLoading(true);
    setError('');

    try {
      await authService.register({ email, password });
      router.push('/verify-email');
    } catch (error: any) {
      errorLogger.logAuthError(error, 'register');
      setError(error?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button onPress={handleSubmit} disabled={isLoading} />
    </View>
  );
}
```

### Screen with Error Boundary
```typescript
function PortfolioScreen() {
  return (
    <ErrorBoundary>
      <PortfolioContent />
    </ErrorBoundary>
  );
}
```

---

## 🧪 Testing Patterns

### Test Validator
```typescript
import { validateEmail } from '@/utils/validators';

describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = validateEmail('invalid');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Test Error Handling
```typescript
import { errorLogger } from '@/utils/errorLogger';

jest.mock('@/utils/errorLogger');

it('should log error on failure', async () => {
  const error = new Error('Test error');
  mockApiCall.mockRejectedValue(error);

  await expect(fetchData()).rejects.toThrow();
  expect(errorLogger.logError).toHaveBeenCalledWith(
    error,
    expect.objectContaining({ component: 'DataFetch' })
  );
});
```

---

## 💡 Tips & Best Practices

### ✅ DO
- Validate all user inputs
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors with context
- Clear error states after recovery
- Use early returns for validation

### ❌ DON'T
- Don't expose sensitive error details
- Don't use generic error messages
- Don't ignore errors silently
- Don't forget to clear loading states
- Don't skip input validation
- Don't log sensitive data

---

## 🔍 Common Issues

### Issue: Error boundary not catching error
**Solution**: Errors in event handlers need try-catch
```typescript
// ❌ Won't be caught by error boundary
<Button onPress={() => { throw new Error(); }} />

// ✅ Will be handled properly
<Button onPress={() => {
  try {
    // code that might throw
  } catch (error) {
    errorLogger.logError(error);
    setError('Operation failed');
  }
}} />
```

### Issue: Validation not working
**Solution**: Check return value
```typescript
// ❌ Wrong
validateEmail(email);
submitForm();

// ✅ Correct
const result = validateEmail(email);
if (!result.isValid) {
  setError(result.error);
  return;
}
submitForm();
```

### Issue: Error not displaying
**Solution**: Update error state
```typescript
// ❌ Wrong
try {
  await apiCall();
} catch (error) {
  console.error(error);
}

// ✅ Correct
try {
  await apiCall();
} catch (error: any) {
  errorLogger.logError(error);
  setError(error?.error?.message || 'Operation failed');
}
```

---

## 📚 More Resources

- **Full Documentation**: `docs/IMPROVEMENTS.md`
- **Integration Guide**: `INTEGRATION_CHECKLIST.md`
- **Summary**: `IMPROVEMENTS_SUMMARY.md`

---

**Quick Access**: Bookmark this page for fast reference!
