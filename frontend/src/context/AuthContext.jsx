import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import api from "../services/api.js";

const AuthContext = createContext(null);

const AUTO_LOGIN_KEY = "stockflow.autologin";
const DEMO_CREDENTIALS = { email: "demo@stockflow.app", password: "demopass123" };

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("stockflow.user", null);
  const [token, setToken] = useLocalStorage("stockflow.token", null);

  useEffect(() => {
    if (!token) {
      if (localStorage.getItem(AUTO_LOGIN_KEY) === "off") return undefined;
      let cancelled = false;
      api
        .post("/auth/login", DEMO_CREDENTIALS)
        .then(({ data }) => {
          if (!cancelled) {
            setToken(data.token);
            setUser(data.user);
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      let cancelled = false;
      api
        .get("/auth/profile")
        .then((response) => {
          if (!cancelled) setUser(response.data.user);
        })
        .catch(() => {
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    return undefined;
  }, [token, user, setToken, setUser]);

  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.removeItem(AUTO_LOGIN_KEY);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data.user;
  };

  const logout = () => {
    localStorage.setItem(AUTO_LOGIN_KEY, "off");
    setToken(null);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser((prev) => ({ ...(prev ?? {}), ...(nextUser ?? {}) }));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: Boolean(token), login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
