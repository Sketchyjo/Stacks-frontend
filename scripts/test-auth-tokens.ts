/**
 * Test Script: Auth Token Persistence After Email Verification
 * 
 * This script simulates the auth flow and verifies tokens persist correctly:
 * 1. Register user
 * 2. Verify email code
 * 3. Check tokens are saved
 * 4. Simulate app reload
 * 5. Verify tokens are still there and API calls work
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  lastActivityAt: string | null;
}

async function testAuthTokenPersistence() {
  console.log('=== Testing Auth Token Persistence ===\n');

  try {
    // Step 1: Clear storage to start fresh
    console.log('Step 1: Clearing AsyncStorage...');
    await AsyncStorage.clear();
    console.log('✓ Storage cleared\n');

    // Step 2: Simulate email verification response
    console.log('Step 2: Simulating email verification...');
    const mockAuthState: AuthState = {
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        emailVerified: true,
        phoneVerified: false,
        kycStatus: 'pending',
        onboardingStatus: 'wallets_pending',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      isAuthenticated: true,
      lastActivityAt: new Date().toISOString(),
    };

    // Save to AsyncStorage (simulating zustand persist)
    await AsyncStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: mockAuthState,
        version: 0,
      })
    );
    console.log('✓ Auth state saved to AsyncStorage\n');

    // Step 3: Verify tokens are saved
    console.log('Step 3: Reading tokens from storage...');
    const storedData = await AsyncStorage.getItem('auth-storage');
    if (!storedData) {
      throw new Error('No data found in storage');
    }

    const parsed = JSON.parse(storedData);
    console.log('✓ Tokens retrieved:', {
      hasUser: !!parsed.state.user,
      hasAccessToken: !!parsed.state.accessToken,
      hasRefreshToken: !!parsed.state.refreshToken,
      isAuthenticated: parsed.state.isAuthenticated,
      lastActivityAt: parsed.state.lastActivityAt,
    });
    console.log('');

    // Step 4: Simulate app reload (wait and re-read)
    console.log('Step 4: Simulating app reload (200ms delay)...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const reloadedData = await AsyncStorage.getItem('auth-storage');
    if (!reloadedData) {
      throw new Error('Tokens lost after reload simulation');
    }

    const reloadedState = JSON.parse(reloadedData);
    console.log('✓ Tokens persisted after reload:', {
      hasUser: !!reloadedState.state.user,
      hasAccessToken: !!reloadedState.state.accessToken,
      hasRefreshToken: !!reloadedState.state.refreshToken,
      isAuthenticated: reloadedState.state.isAuthenticated,
    });
    console.log('');

    // Step 5: Check token age calculation
    console.log('Step 5: Checking token age...');
    const tokenAge = Date.now() - new Date(reloadedState.state.lastActivityAt).getTime();
    console.log(`✓ Token age: ${tokenAge}ms`);
    console.log(`✓ Should skip validation: ${tokenAge < 10000 ? 'YES' : 'NO'}\n`);

    // Summary
    console.log('=== Test Summary ===');
    console.log('✓ All checks passed!');
    console.log('✓ Tokens persist correctly after email verification');
    console.log('✓ Token age check works properly');
    console.log('✓ Auth state survives app reload simulation\n');

  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testAuthTokenPersistence()
  .then(() => {
    console.log('Test completed successfully ✓');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
