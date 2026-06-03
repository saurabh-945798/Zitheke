import planService from "../Services/payments/plan.service.js";

const handleError = (res, error, fallbackMessage) =>
  res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || fallbackMessage,
  });

export const listPlans = async (req, res) => {
  try {
    const plans = await planService.listPublicPlans();
    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error listing plans:", error);
    return handleError(res, error, "Failed to fetch plans");
  }
};

export const getPlanBySlug = async (req, res) => {
  try {
    const { slug } = req.validated?.params || req.params;
    const plan = await planService.getPlanBySlug(slug);
    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return handleError(res, error, "Failed to fetch plan");
  }
};

export const listPlansForAdmin = async (req, res) => {
  try {
    const plans = await planService.listAllPlansForAdmin();
    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error listing plans for admin:", error);
    return handleError(res, error, "Failed to fetch admin plans");
  }
};

export const createPlan = async (req, res) => {
  try {
    const payload = req.validated?.body || req.body;
    const plan = await planService.createPlan(payload);
    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    return handleError(res, error, "Failed to create plan");
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.validated?.params || req.params;
    const payload = req.validated?.body || req.body;
    const plan = await planService.updatePlan(id, payload);
    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return handleError(res, error, "Failed to update plan");
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.validated?.params || req.params;
    const result = await planService.deletePlan(id);
    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return handleError(res, error, "Failed to delete plan");
  }
};
