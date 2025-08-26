import Cookie from 'js-cookie';

// Token management utility
export const tokenManager = {
  // Get token from cookies or localStorage
  getToken: () => {
    return Cookie.get('token') || localStorage.getItem('authToken');
  },

  // Set token in both cookies and localStorage
  setToken: (token) => {
    Cookie.set('token', token, { expires: 0.5 }); // 12 hours
    localStorage.setItem('authToken', token);
  },

  // Remove token from both storage methods
  removeToken: () => {
    Cookie.remove('token');
    localStorage.removeItem('authToken');
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
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include', // Still include credentials for cookie support
    ...options
  };

  // Merge headers properly
  if (options.headers) {
    defaultOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }

  return fetch(url, defaultOptions);
};
