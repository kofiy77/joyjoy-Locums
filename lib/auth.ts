import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple user interface that matches the backend response
interface AuthUser {
  id: string;
  email: string;
  type: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  validateSession: () => Promise<void>;
  clearAuthCache: () => void;
  forceReAuthenticate: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Include cookies for session handling
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          
          const data = await response.json();
          console.log('Login successful, user data:', data);
          
          // Extract token and user from response structure
          const { token, user } = data;
          
          // Store JWT token for API authentication with validation
          if (token && typeof token === 'string' && token.length > 10) {
            localStorage.setItem('auth_token', token);
            console.log('JWT token stored for API authentication');
          } else {
            console.error('Invalid or empty token received from login:', token);
            throw new Error('Authentication failed - invalid token received');
          }
          
          // Set user state with proper persistence
          set({ user, isAuthenticated: true });
          
          // Force immediate persistence for debugging
          console.log('User state set:', user);
          console.log('Authentication completed successfully, token stored:', !!token);
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      
      register: async (userData: any) => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        
        const user = await response.json();
        set({ user, isAuthenticated: true });
      },
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear JWT token from localStorage
        localStorage.removeItem('auth_token');
        console.log('JWT token cleared on logout');
        
        set({ user: null, isAuthenticated: false });
        window.location.href = '/portal';
      },
      
      setUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true });
      },

      // Force clear all authentication state and cached tokens
      clearAuthCache: () => {
        console.log('🧹 Force clearing all authentication cache...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage'); // Clear zustand persist cache
        
        // Also clear any corrupt token strings that might contain "null" or "undefined"
        Object.keys(localStorage).forEach(key => {
          const value = localStorage.getItem(key);
          if ((key.includes('auth') || key.includes('token')) && 
              (value === 'null' || value === 'undefined' || value === '')) {
            localStorage.removeItem(key);
            console.log(`🧹 Removed corrupt token: ${key} = ${value}`);
          }
        });
        
        sessionStorage.clear(); // Clear session storage
        set({ user: null, isAuthenticated: false });
        console.log('✅ Authentication cache cleared');
      },

      // Force re-authentication for current user  
      forceReAuthenticate: async () => {
        console.log('🔄 Force re-authentication started...');
        try {
          // Clear all corrupt tokens first
          get().clearAuthCache();
          
          // Try to get fresh token by calling auth/me endpoint
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token && data.user) {
              localStorage.setItem('auth_token', data.token);
              set({ user: data.user, isAuthenticated: true });
              console.log('✅ Re-authentication successful');
              return;
            }
          }
          
          // If that fails, redirect to login
          console.log('🔄 Redirecting to login page...');
          window.location.href = '/auth';
        } catch (error) {
          console.error('Force re-authentication failed:', error);
          window.location.href = '/auth';
        }
      },
      
      validateSession: async () => {
        try {
          // First check if we have a stored token
          const token = localStorage.getItem('auth_token');
          
          // If no token, silently set unauthenticated state without logging errors
          if (!token) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Session validation successful:', data.user?.email);
            
            // If response includes a new token, update it
            if (data.token) {
              localStorage.setItem('auth_token', data.token);
              console.log('🔄 JWT token refreshed');
            }
            
            // Extract user from response (might be nested)
            const user = data.user || data;
            set({ user, isAuthenticated: true });
          } else {
            console.log('❌ Session validation failed, clearing auth state');
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
