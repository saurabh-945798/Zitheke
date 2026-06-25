import api from "../api/axios";

export const getPublicCategories = async () => {
  const { data } = await api.get("/categories");
  return Array.isArray(data?.categories) ? data.categories : [];
};
