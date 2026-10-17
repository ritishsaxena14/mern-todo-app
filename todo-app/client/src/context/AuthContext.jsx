import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Safely decode payload from JWT token without external libraries
const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64URL decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    // Verify expiration timestamp
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial mount: restore login state strictly from sessionStorage token
  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      const decodedUser = decodeToken(savedToken);
      if (decodedUser) {
        setToken(savedToken);
        setUser(decodedUser);
      } else {
        // Expired or invalid token
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Login handler: ONLY saves the token string in sessionStorage
  const login = (jwtToken, userInfo) => {
    sessionStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    if (userInfo) {
      setUser(userInfo);
    } else {
      setUser(decodeToken(jwtToken));
    }
  };

  // Logout handler: clears token from sessionStorage
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
