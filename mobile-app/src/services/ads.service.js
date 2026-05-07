import api from "./api";

export const adsService = {
  getAds: async (params = {}) => {
    const { data } = await api.get("/api/ads", { params });
    return data;
  },
  getAdById: async (id) => {
    const { data } = await api.get(`/api/ads/${id}`);
    return data;
  },
};

export default adsService;
