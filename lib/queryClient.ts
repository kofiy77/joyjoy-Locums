import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle authentication errors by clearing invalid tokens
    if (res.status === 401) {
      console.log('❌ Token expired or invalid, clearing stored tokens...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth-storage');
      // Redirect to login page
      window.location.href = '/auth';
      return;
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: { method?: string; body?: string | FormData | object } | string,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle both old and new API formats
  let method: string;
  let requestData: unknown;
  
  if (typeof options === 'string') {
    // Old format: apiRequest(url, method, data)
    method = options;
    requestData = data;
  } else if (options && typeof options === 'object') {
    // New format: apiRequest(url, { method, body })
    method = options.method || 'GET';
    requestData = options.body;
  } else {
    method = 'GET';
    requestData = data;
  }
  
  const headers: Record<string, string> = {};
  
  // Only set JSON content-type if we're not sending FormData
  if (requestData && !(requestData instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Simple, reliable token retrieval - try both storage locations
  let token = localStorage.getItem('auth_token');
  
  // If auth_token not found, try getting from auth-storage (Zustand persist)
  if (!token || token === 'null' || token === 'undefined') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.user?.token) {
          token = parsed.state.user.token;
          // Also store it as auth_token for consistency
          if (token) {
            localStorage.setItem('auth_token', token);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth-storage:', e);
    }
  }
  
  // Basic validation to prevent "null" string corruption
  if (token === 'null' || token === 'undefined' || !token || token.trim().length < 10) {
    token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth-storage');
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No valid authentication token for API request:', url);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: requestData instanceof FormData ? requestData : 
          typeof requestData === 'string' ? requestData :
          requestData ? JSON.stringify(requestData) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const headers: Record<string, string> = {};
      
      // Token-based authentication with fallback logic (matching apiRequest)
      let token = localStorage.getItem('auth_token');
      
      // If no token found, try alternative storage keys
      if (!token) {
        token = localStorage.getItem('auth-storage');
        if (token) {
          try {
            const parsed = JSON.parse(token);
            token = parsed.state?.token || null;
          } catch (e) {
            token = null;
          }
        }
      }
      
      console.log('🔑 Query token retrieval:', { url: queryKey[0], hasToken: !!token, tokenLength: token?.length });
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No authentication token found for query:', queryKey[0]);
      }

      const res = await fetch(queryKey[0] as string, {
        headers,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`✅ Query ${queryKey[0]} successful:`, { dataLength: Array.isArray(data) ? data.length : 'not array', preview: Array.isArray(data) ? data.slice(0, 2) : data });
      return data;
    } catch (error) {
      console.error(`❌ Query ${queryKey[0]} failed:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
