import api from "./api";

export const authService = {
  login: async (payload) => {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
  },
};

export default authService;
