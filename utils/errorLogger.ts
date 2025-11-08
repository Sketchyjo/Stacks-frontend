/**
 * Error Logging Utility
 * Centralized error logging for consistent error tracking
 * TODO: Integrate with Sentry or similar service
 */

import { sanitizeObject, sanitizeForLog } from './logSanitizer';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private isProduction = !__DEV__;

  /**
   * Log error with context
   */
  logError(error: Error | unknown, context?: ErrorContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logData = {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      environment: this.isProduction ? 'production' : 'development',
      ...context,
    };

    // Console log in development with sanitization
    if (__DEV__) {
      console.error('[ErrorLogger]', sanitizeObject(logData));
    }

    // TODO: Send to error tracking service in production
    // if (this.isProduction) {
    //   Sentry.captureException(error, { contexts: { custom: context } });
    // }
  }

  /**
   * Log API error
   */
  logApiError(error: any, endpoint: string, method: string): void {
    this.logError(error, {
      component: 'API',
      action: `${method} ${endpoint}`,
      metadata: {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        errorCode: error?.error?.code,
      },
    });
  }

  /**
   * Log authentication error
   */
  logAuthError(error: any, action: string): void {
    this.logError(error, {
      component: 'Auth',
      action,
      metadata: {
        errorCode: error?.error?.code,
      },
    });
  }

  /**
   * Log wallet error
   */
  logWalletError(error: any, action: string): void {
    this.logError(error, {
      component: 'Wallet',
      action,
      metadata: {
        errorCode: error?.error?.code,
      },
    });
  }

  /**
   * Log navigation error
   */
  logNavigationError(error: any, route: string): void {
    this.logError(error, {
      component: 'Navigation',
      action: `Navigate to ${route}`,
    });
  }
}

export const errorLogger = new ErrorLogger();
