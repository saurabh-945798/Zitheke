import api from "./api";

export const uploadService = {
  uploadMedia: async (formData) => {
    const { data } = await api.post("/api/uploads/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};

export default uploadService;
