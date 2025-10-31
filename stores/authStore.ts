import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, passcodeService } from '../api/services';
import type { User as ApiUser } from '../api/types';

// Extend the API User type with additional local fields
export interface User extends Omit<ApiUser, 'phone'> {
  fullName?: string;
  phoneNumber?: string;
}

interface AuthState {
  // User & Session
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  lastActivityAt: string | null; // Track last user activity for session timeout
  tokenIssuedAt: string | null; // Track when token was issued (for 7-day expiry)
  tokenExpiresAt: string | null; // Track when token expires (7 days from issuance)
  
  // Onboarding State
  hasCompletedOnboarding: boolean;
  onboardingStatus: string | null;
  currentOnboardingStep: string | null;
  
  // Email Verification
  pendingVerificationEmail: string | null;
  
  // Passcode/Biometric
  hasPasscode: boolean;
  isBiometricEnabled: boolean;
  passcodeSessionToken?: string;
  passcodeSessionExpiresAt?: string;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateLastActivity: () => void;
  checkTokenExpiry: () => boolean; // Check if 7-day token has expired
  clearExpiredSession: () => void; // Clear session if 7-day token expired
  
  // Passcode session management
  clearPasscodeSession: () => void;
  checkPasscodeSessionExpiry: () => boolean;
  setPasscodeSession: (token: string, expiresAt: string) => void;
  
  // Passcode/Biometric
  setPasscode: (passcode: string) => Promise<void>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  enableBiometric: () => void;
  disableBiometric: () => void;
  
  // State Management
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setPendingEmail: (email: string | null) => void;
  setOnboardingStatus: (status: string, step?: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasPasscode: (hasPasscode: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  lastActivityAt: null,
  tokenIssuedAt: null,
  tokenExpiresAt: null,
  hasCompletedOnboarding: false,
  onboardingStatus: null,
  currentOnboardingStep: null,
  pendingVerificationEmail: null,
  hasPasscode: false,
  isBiometricEnabled: false,
  passcodeSessionToken: undefined,
  passcodeSessionExpiresAt: undefined,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Authentication
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            onboardingStatus: response.user.onboardingStatus || null,
            hasPasscode: response.user.hasPasscode || false,
            lastActivityAt: now.toISOString(),
            tokenIssuedAt: now.toISOString(),
            tokenExpiresAt: response.expiresAt || expiresAt.toISOString(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Call API to invalidate tokens on server
          await authService.logout().catch(() => {
            // Ignore errors - still clear local state
          });
          
          // Clear all auth state on logout
          set({
            ...initialState,
            hasPasscode: false,
            hasCompletedOnboarding: false,
          });
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            ...initialState,
            hasPasscode: false,
            hasCompletedOnboarding: false,
            error: error instanceof Error ? error.message : 'Logout failed',
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ email, password });
          
          // Store pending email but DON'T authenticate yet - user needs to verify
          set({
            pendingVerificationEmail: email || response.identifier,
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Session management
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        set({ isLoading: true });
        try {
          const response = await authService.refreshToken({ refreshToken });
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Session refresh failed',
            isLoading: false,
          });
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      // Session activity tracking
      updateLastActivity: () => {
        set({ lastActivityAt: new Date().toISOString() });
      },

      // Check if 7-day token has expired
      checkTokenExpiry: () => {
        const { tokenExpiresAt, isAuthenticated } = get();
        
        // If not authenticated, no token to check
        if (!isAuthenticated) return false;
        
        // If no expiry time set, assume expired
        if (!tokenExpiresAt) return true;
        
        // Check if 7 days have passed since token issuance
        const expiryTime = new Date(tokenExpiresAt).getTime();
        const now = new Date().getTime();
        
        return now >= expiryTime;
      },

      // Clear session if 7-day token has expired
      clearExpiredSession: () => {
        console.log('[AuthStore] 7-day session expired, clearing all auth data');
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          lastActivityAt: null,
          tokenIssuedAt: null,
          tokenExpiresAt: null,
          passcodeSessionToken: undefined,
          passcodeSessionExpiresAt: undefined,
          onboardingStatus: null,
          currentOnboardingStep: null,
        });
      },

      // Passcode session management  
      clearPasscodeSession: () => {
        console.log('[AuthStore] Clearing passcode session (keeping user data and tokens for re-auth)');
        // Only clear passcode session tokens, keep access/refresh tokens and isAuthenticated
        // User still has valid 7-day tokens, they just need to verify passcode for UI access
        set({
          passcodeSessionToken: undefined,
          passcodeSessionExpiresAt: undefined,
        });
      },

      checkPasscodeSessionExpiry: () => {
        const { passcodeSessionToken, passcodeSessionExpiresAt, isAuthenticated } = get();
        
        // If not authenticated, no passcode session to check
        if (!isAuthenticated) return false;
        
        // If no passcode session token, it's expired/missing
        if (!passcodeSessionToken || !passcodeSessionExpiresAt) return true;
        
        // Check if passcode session has expired (10 mins)
        const expiryTime = new Date(passcodeSessionExpiresAt).getTime();
        const now = new Date().getTime();
        
        return now >= expiryTime;
      },

      setPasscodeSession: (token: string, expiresAt: string) => {
        set({
          passcodeSessionToken: token,
          passcodeSessionExpiresAt: expiresAt,
        });
      },

      // State Management
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        
        set({ 
          accessToken, 
          refreshToken, 
          isAuthenticated: true,
          lastActivityAt: now.toISOString(),
          tokenIssuedAt: now.toISOString(),
          tokenExpiresAt: expiresAt.toISOString(),
        });
      },

      setPendingEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      setOnboardingStatus: (status: string, step?: string) => {
        set({ 
          onboardingStatus: status,
          currentOnboardingStep: step || null,
        });
      },

      setHasCompletedOnboarding: (completed: boolean) => {
        set({ hasCompletedOnboarding: completed });
      },

      setHasPasscode: (hasPasscode: boolean) => {
        set({ hasPasscode });
      },

      // Passcode/Biometric
      setPasscode: async (passcode: string) => {
        try {
          await passcodeService.createPasscode({ 
            passcode, 
            confirmPasscode: passcode 
          });
          set({ hasPasscode: true });
        } catch (error) {
          console.error('[AuthStore] Failed to set passcode:', error);
          throw error;
        }
      },

      verifyPasscode: async (passcode: string) => {
        try {
          const response = await passcodeService.verifyPasscode({ passcode });
          
          if (response.verified) {
            const now = new Date();
            const tokenExpiresAt = response.expiresAt 
              ? new Date(response.expiresAt)
              : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            
            console.log('[AuthStore] Passcode verified, storing tokens:', {
              hasAccessToken: !!response.accessToken,
              hasRefreshToken: !!response.refreshToken,
              hasPasscodeSessionToken: !!response.passcodeSessionToken,
            });
            
            // Store authentication tokens and passcode session
            set({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              lastActivityAt: now.toISOString(),
              tokenIssuedAt: now.toISOString(),
              tokenExpiresAt: tokenExpiresAt.toISOString(),
              passcodeSessionToken: response.passcodeSessionToken,
              passcodeSessionExpiresAt: response.passcodeSessionExpiresAt,
            });
            
            // Verify tokens were actually set
            const state = get();
            console.log('[AuthStore] Tokens stored, verification:', {
              hasAccessToken: !!state.accessToken,
              hasRefreshToken: !!state.refreshToken,
              isAuthenticated: state.isAuthenticated,
            });
          }
          
          return response.verified;
        } catch (error) {
          console.error('[AuthStore] Failed to verify passcode:', error);
          return false;
        }
      },

      enableBiometric: () => {
        set({ isBiometricEnabled: true });
      },

      disableBiometric: () => {
        set({ isBiometricEnabled: false });
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // User & Session Data
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        lastActivityAt: state.lastActivityAt,
        tokenIssuedAt: state.tokenIssuedAt,
        tokenExpiresAt: state.tokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
        
        // Onboarding State
        hasPasscode: state.hasPasscode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingStatus: state.onboardingStatus,
        currentOnboardingStep: state.currentOnboardingStep,
        
        // Email Verification
        pendingVerificationEmail: state.pendingVerificationEmail,
        
        // Passcode/Biometric
        isBiometricEnabled: state.isBiometricEnabled,
        passcodeSessionToken: state.passcodeSessionToken,
        passcodeSessionExpiresAt: state.passcodeSessionExpiresAt,
      }),
    }
  )
);
