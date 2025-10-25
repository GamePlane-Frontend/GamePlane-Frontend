import axios from 'axios';
import { baseURL } from '../store/BaseURL.js';

// Debug utility to log token information
const debugToken = (token) => {
  if (!token) {
    console.log('🔍 No token found');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 Token debug info:', {
      userId: payload.userId,
      role: payload.role,
      exp: payload.exp,
      expDate: new Date(payload.exp * 1000).toISOString(),
      currentTime: Math.floor(Date.now() / 1000),
      currentDate: new Date().toISOString(),
      isExpired: payload.exp < Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    console.error('❌ Error parsing token:', error);
  }
};

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if JWT token is expired
const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    // Decode JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('🔍 Token expiration check:', {
      exp: payload.exp,
      currentTime,
      isExpired: payload.exp < currentTime,
      timeUntilExpiry: payload.exp - currentTime
    });
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return true; // Assume expired if we can't parse it
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Debug token information
      debugToken(token);
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn('⚠️ Token is expired, clearing storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding auth header:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token.length,
        authHeader: config.headers.Authorization?.substring(0, 20) + '...'
      });
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('🚨 API Error Response:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      authHeader: error.config?.headers?.Authorization?.substring(0, 20) + '...'
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
      console.warn('403 Error details:', {
        url: error.config?.url,
        authHeader: error.config?.headers?.Authorization?.substring(0, 20) + '...',
        responseData: error.response?.data
      });
      
      // Log detailed backend response for debugging
      console.error('🔍 Backend 403 Response Analysis:', {
        fullResponse: error.response?.data,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        success: error.response?.data?.success,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers
      });
      
      // Check if this is a token-related 403 (expired or invalid token)
      const responseData = error.response?.data;
      if (responseData?.message?.includes('token') || responseData?.message?.includes('expired')) {
        console.warn('🔒 Token-related 403 error, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // Don't redirect for other 403 errors, just log the warning
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network error - check your internet connection and API server');
    } else if (error.response?.status >= 500) {
      console.error('Server error - the API server is experiencing issues');
    }
    
    return Promise.reject(error);
  }
);

export default api;

