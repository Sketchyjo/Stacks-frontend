/**
 * Session Manager
 * Handles token refresh, expiry checks, and session lifecycle
 */

import { useAuthStore } from '../stores/authStore';
import { authService } from '../api/services';

export class SessionManager {
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static passcodeSessionTimer: NodeJS.Timeout | null = null;
  private static initialized = false;
  private static readonly SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (for token expiry)
  private static readonly PASSCODE_SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: string): boolean {
    const expiryTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    return expiryTime <= now;
  }


  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(expiresAt: string): number {
    const expiryTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    return Math.max(0, expiryTime - now);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<void> {
    const { refreshToken, isAuthenticated } = useAuthStore.getState();
    
    if (!refreshToken || !isAuthenticated) {
      console.warn('[SessionManager] No refresh token available or not authenticated');
      this.handleSessionExpired();
      return;
    }

    try {
      console.log('[SessionManager] Refreshing access token...');
      const response = await authService.refreshToken({ refreshToken });
      
      useAuthStore.setState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      console.log('[SessionManager] Token refreshed successfully');
      
      // Schedule next refresh if expiresAt is available
      if (response.expiresAt) {
        this.scheduleTokenRefresh(response.expiresAt);
      }
    } catch (error) {
      console.error('[SessionManager] Token refresh failed:', error);
      this.handleSessionExpired();
    }
  }

  /**
   * Schedule automatic token refresh
   * Refreshes 5 minutes before expiry
   */
  static scheduleTokenRefresh(expiresAt: string): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const timeUntilExpiry = this.getTimeUntilExpiry(expiresAt);
    
    // Refresh 5 minutes (300000ms) before expiry
    const REFRESH_BUFFER = 5 * 60 * 1000;
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BUFFER);

    if (refreshTime > 0) {
      console.log(
        `[SessionManager] Scheduling token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`
      );
      
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    } else {
      // Token is already expired or expires very soon
      console.log('[SessionManager] Token expired or expiring soon, refreshing immediately');
      this.refreshToken();
    }
  }

  /**
   * Handle session expiration (7-day token expiry)
   * Clears ALL auth data including user data - requires full re-authentication
   */
  static handleSessionExpired(): void {
    console.log('[SessionManager] 7-day session expired, clearing all auth data');
    
    // Clear any refresh timers
    this.cleanup();
    
    // Use the store's clearExpiredSession method
    const { clearExpiredSession } = useAuthStore.getState();
    clearExpiredSession();
  }

  /**
   * Handle passcode session expiration
   * Only clears the passcode session, not the full auth session
   */
  static handlePasscodeSessionExpired(): void {
    console.log('[SessionManager] Passcode session expired, clearing passcode session token');
    
    // Clear passcode session timer
    if (this.passcodeSessionTimer) {
      clearTimeout(this.passcodeSessionTimer);
      this.passcodeSessionTimer = null;
    }
    
    // Clear only the passcode session tokens
    const { clearPasscodeSession } = useAuthStore.getState();
    clearPasscodeSession();
  }

  /**
   * Check if passcode session is expired
   */
  static isPasscodeSessionExpired(): boolean {
    const { checkPasscodeSessionExpiry } = useAuthStore.getState();
    return checkPasscodeSessionExpiry();
  }

  /**
   * Schedule passcode session expiration check
   * Passcode session lasts 10 minutes
   */
  static schedulePasscodeSessionExpiry(expiresAt: string): void {
    // Clear existing timer
    if (this.passcodeSessionTimer) {
      clearTimeout(this.passcodeSessionTimer);
      this.passcodeSessionTimer = null;
    }

    const timeUntilExpiry = this.getTimeUntilExpiry(expiresAt);
    
    if (timeUntilExpiry > 0) {
      console.log(
        `[SessionManager] Scheduling passcode session expiry in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`
      );
      
      this.passcodeSessionTimer = setTimeout(() => {
        this.handlePasscodeSessionExpired();
      }, timeUntilExpiry);
    } else {
      // Passcode session is already expired
      console.log('[SessionManager] Passcode session already expired');
      this.handlePasscodeSessionExpired();
    }
  }


  /**
   * Initialize session management
   * Call this on app start
   */
  static initialize(): void {
    if (this.initialized) {
      console.log('[SessionManager] Already initialized');
      return;
    }

    const { accessToken, refreshToken, isAuthenticated, passcodeSessionExpiresAt, checkTokenExpiry } = useAuthStore.getState();
    
    if (!isAuthenticated || !accessToken || !refreshToken) {
      console.log('[SessionManager] No active session to initialize');
      return;
    }

    console.log('[SessionManager] Initializing session management');
    
    // Check if 7-day token has expired
    if (checkTokenExpiry()) {
      console.log('[SessionManager] 7-day token expired');
      this.handleSessionExpired();
      return;
    }
    
    // Check if passcode session has expired
    if (passcodeSessionExpiresAt) {
      if (this.isPasscodeSessionExpired()) {
        console.log('[SessionManager] Passcode session expired');
        this.handlePasscodeSessionExpired();
      } else {
        // Schedule passcode session expiry
        this.schedulePasscodeSessionExpiry(passcodeSessionExpiresAt);
      }
    }
    
    // Update last activity to current time since app is being opened
    const { updateLastActivity } = useAuthStore.getState();
    updateLastActivity();
    
    // Schedule periodic health check
    this.scheduleHealthCheck();
    
    this.initialized = true;
  }

  /**
   * Schedule periodic health check
   */
  private static scheduleHealthCheck(): void {
    // Check session health every 30 minutes for token expiry only
    const CHECK_INTERVAL = 30 * 60 * 1000;
    
    setTimeout(() => {
      const { isAuthenticated, accessToken, checkTokenExpiry } = useAuthStore.getState();
      
      if (isAuthenticated && accessToken) {
        console.log('[SessionManager] Running session health check');
        
        // Check if 7-day token has expired
        if (checkTokenExpiry()) {
          console.log('[SessionManager] 7-day token expired during health check');
          this.handleSessionExpired();
          return;
        }
        
        // Attempt to refresh token to ensure it's still valid
        this.refreshToken();
      }
      
      // Schedule next check if still initialized
      if (this.initialized) {
        this.scheduleHealthCheck();
      }
    }, CHECK_INTERVAL);
  }

  /**
   * Cleanup and reset session manager
   */
  static cleanup(): void {
    console.log('[SessionManager] Cleaning up');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.passcodeSessionTimer) {
      clearTimeout(this.passcodeSessionTimer);
      this.passcodeSessionTimer = null;
    }
    
    this.initialized = false;
  }

  /**
   * Force refresh token now
   */
  static forceRefresh(): Promise<void> {
    return this.refreshToken();
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(): boolean {
    const { isAuthenticated, accessToken, refreshToken } = useAuthStore.getState();
    return isAuthenticated && !!accessToken && !!refreshToken;
  }
}

// Auto-initialize on module load if there's an active session
if (typeof window !== 'undefined') {
  // Wait for store to hydrate from localStorage
  setTimeout(() => {
    SessionManager.initialize();
  }, 100);
}

export default SessionManager;
