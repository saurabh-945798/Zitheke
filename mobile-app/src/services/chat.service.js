import api from "./api";

export const chatService = {
  getConversations: async () => {
    const { data } = await api.get("/api/conversations");
    return data;
  },
};

export default chatService;
