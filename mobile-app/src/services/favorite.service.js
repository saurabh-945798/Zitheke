import api from "./api";

export const favoriteService = {
  getFavorites: async (uid) => {
    const { data } = await api.get(`/api/favorites/${uid}`);
    return data;
  },
};

export default favoriteService;
