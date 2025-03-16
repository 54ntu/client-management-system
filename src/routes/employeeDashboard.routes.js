const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  EmployeeDashboard,
} = require("../controller/employeeDashboard.controller");
const employeeDashboardRouter = express.Router();

employeeDashboardRouter
  .route("/upcomming-milestone")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isEmployee,
    EmployeeDashboard.getUpcommingDeadlineMilestone
  );

employeeDashboardRouter
  .route("/upcomming-task")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isEmployee,
    EmployeeDashboard.getUpcommingTaskDeadline
  );

employeeDashboardRouter
  .route("/task-summary")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isEmployee,
    EmployeeDashboard.employeeDashboardSummary
  );

module.exports = {
  employeeDashboardRouter,
};
