const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  MilestoneTaskController,
} = require("../controller/milestoneTask.controller");
const milestoneTaskRouter = express.Router();

milestoneTaskRouter
  .route("/addtask")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    MilestoneTaskController.addMileStoneTask
  );

milestoneTaskRouter
  .route("/viewTask")
  .get(
    UserMiddleware.isUserLoggedIn,
    MilestoneTaskController.viewMileStoneTask
  );

milestoneTaskRouter
  .route("/viewTaskbyid/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    MilestoneTaskController.viewTaskByMilestoneId
  );

milestoneTaskRouter
  .route("/updateTask/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    MilestoneTaskController.updateMilestoneTask
  );

module.exports = {
  milestoneTaskRouter,
};
