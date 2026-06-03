import premiumAccessService from "../Services/payments/premiumAccess.service.js";
import { MEMBERSHIP_PLANS } from "../constants/membershipPlans.js";

const priorityMap = {
  [MEMBERSHIP_PLANS.FREE]: 0,
  [MEMBERSHIP_PLANS.BASIC]: 1,
  [MEMBERSHIP_PLANS.PLUS]: 2,
  [MEMBERSHIP_PLANS.ADVANCED]: 3,
};

const createForbidden = (res, message, access) =>
  res.status(403).json({
    success: false,
    message,
    access,
  });

const requirePremiumAccess =
  (minimumPlan = MEMBERSHIP_PLANS.BASIC) =>
  async (req, res, next) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please login first.",
        });
      }

      if (req.user?.role === "admin") {
        return next();
      }

      const access = await premiumAccessService.resolveMembershipAccessForUser(
        req.user.uid
      );
      req.membershipAccess = access;

      const currentPriority = priorityMap[access.plan.slug] ?? 0;
      const requiredPriority = priorityMap[minimumPlan] ?? 1;

      if (!access.isPremium || currentPriority < requiredPriority) {
        return createForbidden(
          res,
          `This feature requires at least the ${String(minimumPlan).toUpperCase()} membership plan.`,
          access
        );
      }

      return next();
    } catch (error) {
      console.error("Premium access middleware error:", error);
      return res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || "Failed to validate premium access",
      });
    }
  };

export default requirePremiumAccess;
