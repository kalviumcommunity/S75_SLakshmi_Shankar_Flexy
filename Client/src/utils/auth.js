import Cookie from 'js-cookie';

// Token management utility
export const tokenManager = {
  // Get token from cookies or localStorage
  getToken: () => {
    return Cookie.get('token') || localStorage.getItem('authToken');
  },

  // Set token in both cookies and localStorage
  setToken: (token) => {
    Cookie.set('token', token, { expires: 0.5, sameSite: 'None', secure: true }); // 12 hours
    localStorage.setItem('authToken', token);
  },

  // Remove token from both storage methods
  removeToken: () => {
    Cookie.remove('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('expertId');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getToken();
  }
};

// Create authenticated fetch wrapper
export const authenticatedFetch = async (url, options = {}) => {
  const token = tokenManager.getToken();
  
  const defaultOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include', // CRITICAL: Required for cookies
    ...options
  };

  // Merge headers properly
  if (options.headers) {
    defaultOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      tokenManager.removeToken();
      window.location.href = '/';
      throw new Error('Authentication failed. Please login again.');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Logout utility
export const logout = async () => {
  try {
    await fetch('https://flexy-backend.onrender.com/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    tokenManager.removeToken();
    window.location.href = '/';
  }
};
