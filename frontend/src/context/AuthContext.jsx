// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    // Firebase Auth Listener (Google Sign-In only)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (!currentUser) {
        const authUserRaw = localStorage.getItem("authUser");
        const token = localStorage.getItem("token");
        if (authUserRaw && token) {
          try {
            const authUser = JSON.parse(authUserRaw);
            setUser(authUser);
          } catch {
            localStorage.removeItem("authUser");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setUser(null);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authUser");
          setUser(null);
        }
        setLoading(false);
        return;
      }

      try {
        if (currentUser.email && !currentUser.emailVerified) {
          setUser(null);
          setLoading(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        const res = await axios.post(`${BASE_URL}/api/users/register`, {
          idToken,
          uid: currentUser.uid,
          name: currentUser.displayName || "User",
          email: currentUser.email,
          photoURL: currentUser.photoURL || "",
          phone: currentUser.phoneNumber || "",
        });

        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data?.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }

        if (res.data?.linkedPhoneUser) {
          localStorage.setItem(
            "mergeNotice",
            "We linked your phone account to this email."
          );
        }

        if (res.data?.user) {
          const mergedUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: res.data.user.name || currentUser.displayName,
            photoURL: res.data.user.photoURL || currentUser.photoURL || "",
            role: res.data.user.role || "user",
          };

          localStorage.setItem("authUser", JSON.stringify(mergedUser));
          setUser(mergedUser);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "Error syncing user to backend:",
          error.response?.data || error.message
        );
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [BASE_URL]);

  const logout = async () => {
    try {
      const current = user || auth.currentUser;
      const payload = {
        uid: current?.uid,
        email: current?.email,
        name: current?.name || current?.displayName || "User",
      };

      if (payload.uid && payload.email) {
        await axios.post(`${BASE_URL}/api/users/logout`, payload);
      }

      const refreshToken = localStorage.getItem("refreshToken");
      await axios.post(`${BASE_URL}/api/auth/logout`, {
        refreshToken,
      });

      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
