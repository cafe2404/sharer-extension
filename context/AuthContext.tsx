import React, { createContext, useEffect, useState } from "react";

// Tạo context cho Auth
export const AuthContext = createContext({
  user: null,
  token: null,
  refreshToken: null,
  updateToken: (newToken: string) => {}
});
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => null);
  const [token, setToken] = useState(() => null);
  const [refreshToken, setRefreshToken] = useState(() => null);

  useEffect(() => {
    chrome.storage.local.get(["user", "token", "refreshToken"], (result) => {
      if (result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setRefreshToken(result.refreshToken);
      }
    });
  }, []);

  // UseEffect để lưu token vào chrome.storage khi nó thay đổi
  useEffect(() => {
    if (token) {
      chrome.storage.local.set({ token });
    }
  }, [token]);

  // UseEffect để lưu refreshToken vào chrome.storage khi nó thay đổi
  useEffect(() => {
    if (refreshToken) {
      chrome.storage.local.set({ refreshToken });
    }
  }, [refreshToken]);
  const updateToken = (newToken) => {
    setToken(newToken)
    chrome.storage.local.set({ token: newToken });
  };
  return (
    <AuthContext.Provider value={{ user, token, refreshToken,updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

