const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  ClientDashboardController,
} = require("../controller/clientDashboard.controller");
const clientDashboardRouter = express.Router();

clientDashboardRouter
  .route("/get-dashboard")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientDashboardController.getTaskDetails
  );

clientDashboardRouter
  .route("/get-chartdata")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientDashboardController.getProjectMilestoneChart
  );

clientDashboardRouter
  .route("/get-recentprojects")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientDashboardController.getRecentProjectsData
  );

clientDashboardRouter
  .route("/get-upcommingmilestones")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientDashboardController.getUpcommingMilestone
  );

clientDashboardRouter
  .route("/get-complaint")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientDashboardController.getComplaintData
  );
module.exports = {
  clientDashboardRouter,
};
