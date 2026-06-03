import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { getMembershipAccess } from "../services/membership.service.js";

const MembershipAccessContext = createContext(null);

const FREE_ACCESS = {
  userId: null,
  userUid: "",
  plan: {
    id: null,
    name: "FREE",
    slug: "free",
    price: 0,
    currency: "MWK",
    durationDays: 0,
    priorityLevel: 0,
    isActive: true,
    features: ["Standard account access", "Browse and contact sellers"],
  },
  subscription: null,
  isPremium: false,
  hasActiveSubscription: false,
  featureMap: {},
  accessSource: "frontend_fallback",
  requiresExpirySync: false,
  checkedAt: null,
};

export const MembershipAccessProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState(FREE_ACCESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshAccess = useCallback(async () => {
    if (!user) {
      setAccess(FREE_ACCESS);
      setError("");
      setLoading(false);
      return FREE_ACCESS;
    }

    setLoading(true);
    try {
      const nextAccess = await getMembershipAccess();
      const normalized = nextAccess || FREE_ACCESS;
      setAccess(normalized);
      setError("");
      return normalized;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch membership access";
      setError(message);
      setAccess(FREE_ACCESS);
      return FREE_ACCESS;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refreshAccess();
  }, [authLoading, refreshAccess]);

  const value = useMemo(
    () => ({
      access,
      loading,
      error,
      refreshAccess,
      setAccess,
    }),
    [access, loading, error, refreshAccess]
  );

  return (
    <MembershipAccessContext.Provider value={value}>
      {children}
    </MembershipAccessContext.Provider>
  );
};

export const useMembershipAccessContext = () => {
  const context = useContext(MembershipAccessContext);
  if (!context) {
    throw new Error(
      "useMembershipAccessContext must be used within MembershipAccessProvider"
    );
  }
  return context;
};

export { FREE_ACCESS };
