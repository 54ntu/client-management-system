const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  ProjectMileStoneController,
} = require("../controller/projectMilestone.controller");
const milestoneRouter = express.Router();

milestoneRouter
  .route("/add-milestone")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ProjectMileStoneController.addMilestone
  );

milestoneRouter
  .route("/view-milestone")
  .get(UserMiddleware.isUserLoggedIn, ProjectMileStoneController.viewMilestone);

milestoneRouter
  .route("/view-milestone/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    ProjectMileStoneController.viewProjectMileStoneById
  );

module.exports = { milestoneRouter };
