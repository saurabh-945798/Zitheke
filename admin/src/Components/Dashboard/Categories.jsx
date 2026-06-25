import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FolderOpen,
  Layers3,
  Search,
  Plus,
  PencilLine,
  Power,
  Trash2,
  ListTree,
  LoaderCircle,
  X,
  ChevronRight,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  updateAdminCategoryStatus,
  deleteAdminCategory,
  createAdminSubcategory,
  updateAdminSubcategory,
  updateAdminSubcategoryStatus,
  deleteAdminSubcategory,
} from "../../api/adminApi";

const emptyCategoryForm = {
  name: "",
  keywords: "",
  isActive: true,
};

const emptySubcategoryForm = {
  name: "",
  isActive: true,
};

const buildErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const toKeywordArray = (value = "") =>
  String(value)
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

const toKeywordString = (keywords = []) =>
  Array.isArray(keywords) ? keywords.join(", ") : "";

const statusBadgeClass = (isActive) =>
  isActive
    ? "bg-green-100 text-green-700 border border-green-200"
    : "bg-slate-100 text-slate-700 border border-slate-200";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageError, setPageError] = useState("");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [savingCategory, setSavingCategory] = useState(false);

  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [subcategoryParent, setSubcategoryParent] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subcategoryForm, setSubcategoryForm] = useState(emptySubcategoryForm);
  const [savingSubcategory, setSavingSubcategory] = useState(false);
  const [actionKey, setActionKey] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setPageError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const result = await listAdminCategories(params);
      setCategories(result);
    } catch (error) {
      setCategories([]);
      setPageError(buildErrorMessage(error, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, statusFilter]);

  const totals = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((category) => category.isActive).length;
    const inactive = total - active;
    const subcategories = categories.reduce(
      (count, category) => count + (category.subcategories?.length || 0),
      0
    );
    return { total, active, inactive, subcategories };
  }, [categories]);

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category?.name || "",
      keywords: toKeywordString(category?.keywords),
      isActive: Boolean(category?.isActive),
    });
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (savingCategory) return;
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
  };

  const submitCategory = async (event) => {
    event.preventDefault();

    const trimmedName = categoryForm.name.trim();
    if (!trimmedName) {
      Swal.fire("Missing name", "Category name cannot be empty.", "warning");
      return;
    }

    const payload = {
      name: trimmedName,
      keywords: toKeywordArray(categoryForm.keywords),
      ...(editingCategory ? { isActive: Boolean(categoryForm.isActive) } : {}),
    };

    try {
      setSavingCategory(true);

      if (editingCategory?._id) {
        await updateAdminCategory(editingCategory._id, payload);
      } else {
        await createAdminCategory(payload);
      }

      closeCategoryModal();
      await fetchCategories();

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: editingCategory ? "Category updated" : "Category created",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        buildErrorMessage(error, "Failed to save category."),
        "error"
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const confirmCategoryStatus = async (category, nextIsActive) => {
    const result = await Swal.fire({
      title: `${nextIsActive ? "Activate" : "Deactivate"} category?`,
      text: `This will mark "${category.name}" as ${
        nextIsActive ? "active" : "inactive"
      }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#64748b",
      confirmButtonText: nextIsActive ? "Activate" : "Deactivate",
    });

    if (!result.isConfirmed) return;

    try {
      setActionKey(`category-status-${category._id}`);
      await updateAdminCategoryStatus(category._id, nextIsActive);
      await fetchCategories();
      Swal.fire(
        "Success",
        `Category ${nextIsActive ? "activated" : "deactivated"} successfully.`,
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        buildErrorMessage(error, "Failed to update category status."),
        "error"
      );
    } finally {
      setActionKey("");
    }
  };

  const confirmDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: "Categories linked to existing ads cannot be deleted. Deactivate the category instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setActionKey(`category-delete-${category._id}`);
      await deleteAdminCategory(category._id);
      setCategories((current) =>
        current.filter((item) => item._id !== category._id)
      );
      if (subcategoryParent?._id === category._id) {
        setSubcategoryModalOpen(false);
        setSubcategoryParent(null);
      }
      Swal.fire("Deleted", "Category deleted successfully.", "success");
    } catch (error) {
      const message = buildErrorMessage(
        error,
        "Failed to delete category."
      );
      Swal.fire("Error", message, "error");
    } finally {
      setActionKey("");
    }
  };

  const openSubcategoryModal = (category) => {
    setSubcategoryParent(category);
    setSubcategoryModalOpen(true);
    setNewSubcategoryName("");
    setEditingSubcategory(null);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const closeSubcategoryModal = () => {
    if (addingSubcategory || savingSubcategory) return;
    setSubcategoryModalOpen(false);
    setSubcategoryParent(null);
    setNewSubcategoryName("");
    setEditingSubcategory(null);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const syncParentCategory = (updatedCategory) => {
    setCategories((current) =>
      current.map((category) =>
        category._id === updatedCategory._id ? updatedCategory : category
      )
    );
    setSubcategoryParent(updatedCategory);
  };

  const submitNewSubcategory = async (event) => {
    event.preventDefault();
    const trimmedName = newSubcategoryName.trim();

    if (!trimmedName || !subcategoryParent?._id) {
      Swal.fire(
        "Missing name",
        "Subcategory name cannot be empty.",
        "warning"
      );
      return;
    }

    try {
      setAddingSubcategory(true);
      const updatedCategory = await createAdminSubcategory(
        subcategoryParent._id,
        { name: trimmedName }
      );
      if (updatedCategory) {
        syncParentCategory(updatedCategory);
      } else {
        await fetchCategories();
      }
      setNewSubcategoryName("");
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Subcategory added",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        buildErrorMessage(error, "Failed to add subcategory."),
        "error"
      );
    } finally {
      setAddingSubcategory(false);
    }
  };

  const beginEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory?.name || "",
      isActive: Boolean(subcategory?.isActive),
    });
  };

  const cancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const submitSubcategoryEdit = async (event) => {
    event.preventDefault();

    if (!subcategoryParent?._id || !editingSubcategory?._id) return;

    const trimmedName = subcategoryForm.name.trim();
    if (!trimmedName) {
      Swal.fire(
        "Missing name",
        "Subcategory name cannot be empty.",
        "warning"
      );
      return;
    }

    try {
      setSavingSubcategory(true);
      const updatedCategory = await updateAdminSubcategory(
        subcategoryParent._id,
        editingSubcategory._id,
        {
          name: trimmedName,
          isActive: Boolean(subcategoryForm.isActive),
        }
      );

      if (updatedCategory) {
        syncParentCategory(updatedCategory);
      } else {
        await fetchCategories();
      }

      cancelEditSubcategory();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Subcategory updated",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        buildErrorMessage(error, "Failed to update subcategory."),
        "error"
      );
    } finally {
      setSavingSubcategory(false);
    }
  };

  const confirmSubcategoryStatus = async (subcategory, nextIsActive) => {
    if (!subcategoryParent?._id) return;

    const result = await Swal.fire({
      title: `${nextIsActive ? "Activate" : "Deactivate"} subcategory?`,
      text: `This will mark "${subcategory.name}" as ${
        nextIsActive ? "active" : "inactive"
      }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3192",
      cancelButtonColor: "#64748b",
      confirmButtonText: nextIsActive ? "Activate" : "Deactivate",
    });

    if (!result.isConfirmed) return;

    try {
      setActionKey(`subcategory-status-${subcategory._id}`);
      const updatedCategory = await updateAdminSubcategoryStatus(
        subcategoryParent._id,
        subcategory._id,
        nextIsActive
      );
      if (updatedCategory) {
        syncParentCategory(updatedCategory);
      } else {
        await fetchCategories();
      }
      Swal.fire(
        "Success",
        `Subcategory ${nextIsActive ? "activated" : "deactivated"} successfully.`,
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        buildErrorMessage(error, "Failed to update subcategory status."),
        "error"
      );
    } finally {
      setActionKey("");
    }
  };

  const confirmDeleteSubcategory = async (subcategory) => {
    if (!subcategoryParent?._id) return;

    const result = await Swal.fire({
      title: "Delete subcategory?",
      text: "Subcategories linked to existing ads cannot be deleted. Deactivate the subcategory instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setActionKey(`subcategory-delete-${subcategory._id}`);
      await deleteAdminSubcategory(subcategoryParent._id, subcategory._id);
      const nextSubcategories = (subcategoryParent.subcategories || []).filter(
        (item) => item._id !== subcategory._id
      );
      syncParentCategory({
        ...subcategoryParent,
        subcategories: nextSubcategories,
      });
      if (editingSubcategory?._id === subcategory._id) {
        cancelEditSubcategory();
      }
      Swal.fire("Deleted", "Subcategory deleted successfully.", "success");
    } catch (error) {
      const message = buildErrorMessage(
        error,
        "Failed to delete subcategory."
      );
      Swal.fire("Error", message, "error");
    } finally {
      setActionKey("");
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,49,146,0.16),_transparent_30%),linear-gradient(180deg,#f8faff_0%,#edf2ff_100%)] p-5 font-[Poppins] md:p-7">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-r from-[#1A1D64] via-[#232780] to-[#2E3192] p-8 text-white shadow-[0_30px_80px_rgba(46,49,146,0.24)]"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Marketplace Taxonomy
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Categories</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base">
              Manage marketplace categories and subcategories.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddCategoryModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#1A1D64] shadow-lg transition hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Categories"
          value={totals.total}
          description="All marketplace category groups"
          icon={FolderOpen}
          tone="bg-[#EEF1FF] text-[#2E3192]"
        />
        <StatCard
          label="Active Categories"
          value={totals.active}
          description="Available for operational use"
          icon={BadgeCheck}
          tone="bg-green-100 text-green-700"
        />
        <StatCard
          label="Inactive Categories"
          value={totals.inactive}
          description="Disabled without deleting data"
          icon={ShieldAlert}
          tone="bg-slate-900 text-white"
        />
        <StatCard
          label="Subcategories"
          value={totals.subcategories}
          description="Nested options across categories"
          icon={Layers3}
          tone="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="mb-6 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-xl backdrop-blur">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/80 shadow-xl backdrop-blur">
        <div className="border-b border-gray-200/70 px-6 py-5">
          <h2 className="text-xl font-bold text-[#1A1D64]">Category List</h2>
          <p className="mt-1 text-sm text-gray-500">
            Search, edit, activate, deactivate, and manage subcategories.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-gray-500">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2E3192]" />
            Loading categories...
          </div>
        ) : pageError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-red-600">{pageError}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-gray-400">
            <FolderOpen className="h-10 w-10" />
            <div>
              <p className="font-medium text-gray-500">No categories found</p>
              <p className="text-sm">
                Create your first category to start organizing the marketplace.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFF] text-left text-[#1A1D64]">
                  <tr>
                    {[
                      "Category",
                      "Slug",
                      "Keywords",
                      "Subcategories",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-6 py-4 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-t border-gray-200/70">
                      <td className="px-6 py-4 font-semibold text-[#1A1D64]">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {category.keywords?.length
                          ? category.keywords.join(", ")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {category.subcategories?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                            category.isActive
                          )}`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <ActionButton
                            icon={PencilLine}
                            label="Edit"
                            onClick={() => openEditCategoryModal(category)}
                          />
                          <ActionButton
                            icon={ListTree}
                            label="Manage Subcategories"
                            onClick={() => openSubcategoryModal(category)}
                          />
                          <ActionButton
                            icon={Power}
                            label={category.isActive ? "Deactivate" : "Activate"}
                            onClick={() =>
                              confirmCategoryStatus(category, !category.isActive)
                            }
                            disabled={actionKey === `category-status-${category._id}`}
                          />
                          <ActionButton
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => confirmDeleteCategory(category)}
                            disabled={actionKey === `category-delete-${category._id}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1D64]">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{category.slug}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                        category.isActive
                      )}`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-[#1A1D64]">Keywords:</span>{" "}
                      {category.keywords?.length
                        ? category.keywords.join(", ")
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-[#1A1D64]">
                        Subcategories:
                      </span>{" "}
                      {category.subcategories?.length || 0}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton
                      icon={PencilLine}
                      label="Edit"
                      onClick={() => openEditCategoryModal(category)}
                    />
                    <ActionButton
                      icon={ListTree}
                      label="Manage Subcategories"
                      onClick={() => openSubcategoryModal(category)}
                    />
                    <ActionButton
                      icon={Power}
                      label={category.isActive ? "Deactivate" : "Activate"}
                      onClick={() =>
                        confirmCategoryStatus(category, !category.isActive)
                      }
                      disabled={actionKey === `category-status-${category._id}`}
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Delete"
                      tone="danger"
                      onClick={() => confirmDeleteCategory(category)}
                      disabled={actionKey === `category-delete-${category._id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {categoryModalOpen ? (
          <ModalShell onClose={closeCategoryModal}>
            <form onSubmit={submitCategory} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1D64]">
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create or update a marketplace category.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {editingCategory ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Renaming a category does not automatically rename categories on existing ads.
                </div>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#1A1D64]">
                  Category Name
                </span>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter category name"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#1A1D64]">
                  Keywords
                </span>
                <input
                  type="text"
                  value={categoryForm.keywords}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      keywords: event.target.value,
                    }))
                  }
                  placeholder="car, transport, bike"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                />
              </label>

              {editingCategory ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#1A1D64]">
                    Status
                  </span>
                  <select
                    value={categoryForm.isActive ? "active" : "inactive"}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        isActive: event.target.value === "active",
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={savingCategory}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#242678] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingCategory ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    "Save Changes"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </ModalShell>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {subcategoryModalOpen && subcategoryParent ? (
          <ModalShell onClose={closeSubcategoryModal} wide>
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1D64]">
                    Manage Subcategories
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Parent category: {subcategoryParent.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSubcategoryModal}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={submitNewSubcategory}
                className="rounded-3xl border border-gray-200 bg-[#F8FAFF] p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="flex-1 space-y-2">
                    <span className="text-sm font-medium text-[#1A1D64]">
                      Add Subcategory
                    </span>
                    <input
                      type="text"
                      value={newSubcategoryName}
                      onChange={(event) => setNewSubcategoryName(event.target.value)}
                      placeholder="Enter subcategory name"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={addingSubcategory}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#242678] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {addingSubcategory ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Subcategory
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {subcategoryParent.subcategories?.length ? (
                  subcategoryParent.subcategories.map((subcategory) => {
                    const isEditing = editingSubcategory?._id === subcategory._id;

                    return (
                      <div
                        key={subcategory._id}
                        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        {isEditing ? (
                          <form
                            onSubmit={submitSubcategoryEdit}
                            className="space-y-4"
                          >
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                              Renaming a subcategory does not automatically rename subcategories on existing ads.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-[#1A1D64]">
                                  Subcategory Name
                                </span>
                                <input
                                  type="text"
                                  value={subcategoryForm.name}
                                  onChange={(event) =>
                                    setSubcategoryForm((current) => ({
                                      ...current,
                                      name: event.target.value,
                                    }))
                                  }
                                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                                />
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm font-medium text-[#1A1D64]">
                                  Status
                                </span>
                                <select
                                  value={subcategoryForm.isActive ? "active" : "inactive"}
                                  onChange={(event) =>
                                    setSubcategoryForm((current) => ({
                                      ...current,
                                      isActive: event.target.value === "active",
                                    }))
                                  }
                                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#2E3192]/40 focus:ring-4 focus:ring-[#2E3192]/10"
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </label>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                              <button
                                type="button"
                                onClick={cancelEditSubcategory}
                                disabled={savingSubcategory}
                                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={savingSubcategory}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2E3192] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#242678] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {savingSubcategory ? (
                                  <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-[#1A1D64]">
                                  {subcategory.name}
                                </h4>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                                    subcategory.isActive
                                  )}`}
                                >
                                  {subcategory.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {subcategory.slug}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                icon={PencilLine}
                                label="Edit"
                                onClick={() => beginEditSubcategory(subcategory)}
                              />
                              <ActionButton
                                icon={Power}
                                label={
                                  subcategory.isActive ? "Deactivate" : "Activate"
                                }
                                onClick={() =>
                                  confirmSubcategoryStatus(
                                    subcategory,
                                    !subcategory.isActive
                                  )
                                }
                                disabled={
                                  actionKey === `subcategory-status-${subcategory._id}`
                                }
                              />
                              <ActionButton
                                icon={Trash2}
                                label="Delete"
                                tone="danger"
                                onClick={() => confirmDeleteSubcategory(subcategory)}
                                disabled={
                                  actionKey === `subcategory-delete-${subcategory._id}`
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-[#FAFBFF] px-6 py-14 text-center text-gray-400">
                    <ListTree className="h-9 w-9" />
                    <p className="mt-3 font-medium text-gray-500">
                      No subcategories yet
                    </p>
                    <p className="text-sm">
                      Add a subcategory for {subcategoryParent.name} to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalShell>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

const StatCard = ({ label, value, description, icon: Icon, tone }) => (
  <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-xl backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-extrabold text-[#1A1D64]">
          {Number(value || 0).toLocaleString("en-MW")}
        </p>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
      tone === "danger"
        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
        : "border-[#D8DEFF] bg-[#EEF2FF] text-[#2E3192] hover:bg-[#E6EAFF]"
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

const ModalShell = ({ children, onClose, wide = false }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      onClick={(event) => event.stopPropagation()}
      className={`w-full rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] ${
        wide ? "max-w-5xl" : "max-w-2xl"
      } max-h-[90vh] overflow-y-auto`}
    >
      {children}
    </motion.div>
  </motion.div>
);

export default Categories;
