const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { InvoiceController } = require("../controller/invoice.controller");
const invoiceRouter = express.Router();

invoiceRouter
  .route("/create-invoice")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    InvoiceController.createInvoice
  );

invoiceRouter
  .route("/view-invoice")
  .get(UserMiddleware.isUserLoggedIn, InvoiceController.viewInvoice);

module.exports = {
  invoiceRouter,
};
