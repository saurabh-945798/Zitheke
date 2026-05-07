import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/auth.service";
import { STORAGE_KEYS } from "../constants/storageKeys";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (savedToken) {
          setToken(savedToken);
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
      } finally {
        setBooting(false);
      }
    };

    restoreSession();
  }, []);

  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    const nextToken = data?.token || data?.accessToken;
    const nextUser = data?.user || null;
    const nextRefreshToken = data?.refreshToken || "";

    if (!nextToken) {
      throw new Error("Login token missing from API response");
    }

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, nextToken],
      [STORAGE_KEYS.REFRESH_TOKEN, nextRefreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(nextUser)],
    ]);

    setToken(nextToken);
    setUser(nextUser);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
    }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
