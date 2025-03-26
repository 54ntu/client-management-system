const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  ClientTimelineController,
} = require("../controller/clientTimeline.controller");
const clientTimeLineRouter = express.Router();

clientTimeLineRouter
  .route("/get-timeline")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientTimelineController.timelineData
  );

clientTimeLineRouter
  .route("/get-projects")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientTimelineController.projectDetails
  );

clientTimeLineRouter
  .route("/get-projectTimelines/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientTimelineController.getProjectTimelineByProjectById
  );

clientTimeLineRouter
  .route("/get-milestoneTask/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientTimelineController.getMilestoneTaskByProjectMilestoneId
  );

module.exports = {
  clientTimeLineRouter,
};
