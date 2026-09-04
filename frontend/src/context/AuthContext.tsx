import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { API_URL } from "../lib/api";

import type {
  User,
  LoginResponse,
  RegisterResponse,
  MeResponse,
  RefreshResponse,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<RegisterResponse>;

  login: (email: string, password: string) => Promise<LoginResponse>;

  logout: () => Promise<void>;

  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Prevent authentication initialization
  // from running more than once in development.
  const initializationStarted = useRef(false);

  // -------------------------
  // Register
  // -------------------------

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  };

  // -------------------------
  // Login
  // -------------------------

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    setAccessToken(data.accessToken);

    setUser(data.user);

    return data;
  };

  // -------------------------
  // Refresh access token
  // -------------------------

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setAccessToken(null);
        setUser(null);

        return null;
      }

      const data: RefreshResponse = await response.json();

      setAccessToken(data.accessToken);

      return data.accessToken;
    } catch (error) {
      console.error(error);

      setAccessToken(null);
      setUser(null);

      return null;
    }
  }, []);

  // -------------------------
  // Get current user
  // -------------------------

  const getMe = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data: MeResponse = await response.json();

      return data.user;
    } catch (error) {
      console.error(error);

      return null;
    }
  };

  // -------------------------
  // Logout
  // -------------------------

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  // -------------------------
  // Initialize authentication
  // -------------------------

  useEffect(() => {
    // React StrictMode can run effects twice
    // during development.

    if (initializationStarted.current) {
      return;
    }

    initializationStarted.current = true;

    const initializeAuth = async () => {
      try {
        // Step 1:
        // Get a new access token using
        // the HTTP-only refresh token.

        const token = await refreshAccessToken();

        if (!token) {
          return;
        }

        // Step 2:
        // Use the new access token
        // to get the current user.

        const currentUser = await getMe(token);

        if (currentUser) {
          setUser(currentUser);
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error(error);

        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
