export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    TRANSFER: '/wallet/transfer',
    DEPOSIT_ADDRESS: '/wallet/deposit-address',
    ADDRESSES: '/v1/wallets/:chain/address',
  },
  PORTFOLIO: {
    OVERVIEW: '/portfolio/overview',
  },
};
