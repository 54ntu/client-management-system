const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ComplaintController } = require("../controller/complaint.controller");
const complaintRouter = express.Router();

complaintRouter
  .route("/create-complaint")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ComplaintController.createComplaint
  );

complaintRouter
  .route("/view-complaint")
  .get(UserMiddleware.isUserLoggedIn, ComplaintController.viewComplaint);

complaintRouter
  .route("/update-complaint/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isCR,
    ComplaintController.updateComplaint
  );

complaintRouter
  .route("/delete-complaint/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ComplaintController.deleteComplaint
  );
module.exports = {
  complaintRouter,
};
