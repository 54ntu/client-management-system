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

module.exports = {
  clientTimeLineRouter,
};
