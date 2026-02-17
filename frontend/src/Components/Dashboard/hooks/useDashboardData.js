import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";

export default function useDashboardData(userId) {
  const [ads, setAds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  const retry = useCallback(() => {
    setReloadTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [adsRes, favRes, convoRes] = await Promise.all([
          api.get(`/ads/user/${userId}`),
          api.get(`/favorites/${userId}`),
          api.get(`/conversations/preview/${userId}`),
        ]);

        if (cancelled) return;

        const adsPayload = adsRes?.data;
        setAds(
          Array.isArray(adsPayload)
            ? adsPayload
            : Array.isArray(adsPayload?.ads)
            ? adsPayload.ads
            : []
        );
        setFavorites(Array.isArray(favRes.data) ? favRes.data : []);

        const unreadTotal = Array.isArray(convoRes.data)
          ? convoRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
          : 0;
        setUnreadMessagesCount(unreadTotal);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching dashboard data:", err);
        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard data right now."
        );
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadTick]);

  return {
    ads,
    favorites,
    unreadMessagesCount,
    loading,
    error,
    retry,
  };
}
