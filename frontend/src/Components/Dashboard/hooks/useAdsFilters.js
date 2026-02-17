import { useMemo } from "react";

export default function useAdsFilters({
  ads,
  favorites,
  unreadMessagesCount,
  activeTab,
  query,
}) {
  const totalViews = useMemo(
    () => ads.reduce((acc, ad) => acc + (ad.views || 0), 0),
    [ads]
  );

  const totalFavorites = useMemo(() => favorites.length, [favorites]);

  const activeAdsCount = useMemo(
    () => ads.filter((ad) => (ad.status || "Active") !== "Sold").length,
    [ads]
  );

  const sortedAds = useMemo(() => {
    return [...ads].sort((a, b) => {
      const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [ads]);

  const recentAds = useMemo(() => sortedAds.slice(0, 4), [sortedAds]);

  const filteredAds = useMemo(() => {
    let list = [...sortedAds];

    if (activeTab === "active") {
      list = list.filter((a) => (a.status || "Active") !== "Sold");
    }
    if (activeTab === "sold") {
      list = list.filter((a) => (a.status || "Active") === "Sold");
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q) ||
          (a.city || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [sortedAds, activeTab, query]);

  return {
    totalViews,
    totalFavorites,
    activeAdsCount,
    messagesCount: unreadMessagesCount,
    recentAds,
    filteredAds,
  };
}

