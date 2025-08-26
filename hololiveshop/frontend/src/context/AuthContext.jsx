import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      return;
    }
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
    }
  }, []);

  function login(u) {
    if (u && u.token) localStorage.setItem("token", u.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
