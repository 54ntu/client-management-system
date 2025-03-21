const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { PaymentController } = require("../controller/payment.controller");
const paymentRouter = express.Router();

paymentRouter
  .route("/make-payment/:id")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    PaymentController.makePayment
  );

paymentRouter
  .route("/verify-payment")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    PaymentController.verifyPayment
  );

module.exports = {
  paymentRouter,
};
