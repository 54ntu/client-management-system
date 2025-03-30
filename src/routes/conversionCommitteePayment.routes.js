const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  ConversionCommitteePaymentController,
} = require("../controller/conversionCommitteePayment.controller");
const conversionPaymentRouter = express.Router();

conversionPaymentRouter
  .route("/get-project-overview")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ConversionCommitteePaymentController.projectOverviewDetails
  );

conversionPaymentRouter
  .route("/get-invoice-projects")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ConversionCommitteePaymentController.invoiceProjectDetails
  );

module.exports = {
  conversionPaymentRouter,
};
