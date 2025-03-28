const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  ConversionCommitteController,
} = require("../controller/conversionCommittee.controller");
const conversionCommitteeRouter = express.Router();

conversionCommitteeRouter
  .route("/get-overview")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ConversionCommitteController.dashboardOverview
  );

conversionCommitteeRouter
  .route("/get-projects")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ConversionCommitteController.projects
  );

conversionCommitteeRouter
  .route("/get-milestones")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ConversionCommitteController.getUpcomingMilestones
  );

module.exports = {
  conversionCommitteeRouter,
};
