import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api, setAuthToken } from "@/lib/api";

const TOKEN_KEY = "auth_token";

type AuthUser = { id: string; name: string; email: string; shopId: string };
type AuthShop = { id: string; name: string };

type AuthContextValue = {
  loading: boolean;
  token: string | null;
  user: AuthUser | null;
  shop: AuthShop | null;
 login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [shop, setShop] = useState<AuthShop | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!saved) return;
        setAuthToken(saved);
        const me = await api.authMe();
        setToken(saved);
        setUser(me.user);
        setShop(me.shop);
      } catch {
        setAuthToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      token,
      user,
      shop,
      login: async ({ email, password }) => {
        const data = await api.authLogin({ email, password });
        setAuthToken(data.token);
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        setShop(data.shop);
      },
      logout: async () => {
        setAuthToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setShop(null);
      },
    }),
    [loading, shop, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

