import axios from "axios";

const adminApi = axios.create({
  baseURL: "/api/admin",
});

export const listAdminCategories = async (params = {}) => {
  const { data } = await adminApi.get("/categories", { params });
  return Array.isArray(data?.categories) ? data.categories : [];
};

export const createAdminCategory = async (payload) => {
  const { data } = await adminApi.post("/categories", payload);
  return data?.category || null;
};

export const updateAdminCategory = async (categoryId, payload) => {
  const { data } = await adminApi.put(`/categories/${categoryId}`, payload);
  return data?.category || null;
};

export const updateAdminCategoryStatus = async (categoryId, isActive) => {
  const { data } = await adminApi.patch(`/categories/${categoryId}/status`, {
    isActive,
  });
  return data?.category || null;
};

export const deleteAdminCategory = async (categoryId) => {
  const { data } = await adminApi.delete(`/categories/${categoryId}`);
  return data;
};

export const createAdminSubcategory = async (categoryId, payload) => {
  const { data } = await adminApi.post(
    `/categories/${categoryId}/subcategories`,
    payload
  );
  return data?.category || null;
};

export const updateAdminSubcategory = async (
  categoryId,
  subcategoryId,
  payload
) => {
  const { data } = await adminApi.put(
    `/categories/${categoryId}/subcategories/${subcategoryId}`,
    payload
  );
  return data?.category || null;
};

export const updateAdminSubcategoryStatus = async (
  categoryId,
  subcategoryId,
  isActive
) => {
  const { data } = await adminApi.patch(
    `/categories/${categoryId}/subcategories/${subcategoryId}/status`,
    { isActive }
  );
  return data?.category || null;
};

export const deleteAdminSubcategory = async (categoryId, subcategoryId) => {
  const { data } = await adminApi.delete(
    `/categories/${categoryId}/subcategories/${subcategoryId}`
  );
  return data;
};

// 🔐 REQUEST INTERCEPTOR
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR (AUTO LOGOUT)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Admin token expired or invalid");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default adminApi;
