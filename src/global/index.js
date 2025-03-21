const userRole = {
  admin: "admin",
  conversion_committe: "conversion_committee",
  client: "client",
  employee: "employee",
  customer_representative: "customer_representative",
};

const userStatus = {
  active: "active",
  inactive: "inactive",
};

const projectPriority = {
  high: "high",
  medium: "medium",
  low: "low",
};

const projectStatus = {
  completed: "completed",
  in_progress: "in-progress",
  not_started: "not-started",
};

const paymentStatus = {
  completed: "completed",
  pending: "pending",
};

const paymentMethods = {
  khalti: "khalti",
  stripe: "stripe",
  credit: "credit",
};

module.exports = {
  userRole,
  userStatus,
  projectPriority,
  projectStatus,
  paymentStatus,
  paymentMethods,
};
