import api from "./api";

export const userService = {
  getProfile: async (uid) => {
    const { data } = await api.get(`/api/users/${uid}`);
    return data;
  },
};

export default userService;
