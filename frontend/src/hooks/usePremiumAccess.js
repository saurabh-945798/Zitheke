import useMembershipAccess from "./useMembershipAccess.js";

const PRIORITY_MAP = {
  free: 0,
  basic: 1,
  plus: 2,
  advanced: 3,
};

const usePremiumAccess = (minimumPlan = "basic") => {
  const membership = useMembershipAccess();
  const currentSlug = String(membership.access?.plan?.slug || "free").toLowerCase();
  const requiredSlug = String(minimumPlan || "basic").toLowerCase();

  const currentPriority = PRIORITY_MAP[currentSlug] ?? 0;
  const requiredPriority = PRIORITY_MAP[requiredSlug] ?? 1;

  return {
    ...membership,
    currentSlug,
    requiredSlug,
    hasRequiredPlan: currentPriority >= requiredPriority,
    isFree: currentPriority === 0,
    currentPriority,
    requiredPriority,
  };
};

export default usePremiumAccess;
