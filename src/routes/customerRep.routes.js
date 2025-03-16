const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const {
  CustomerRepresentativeController,
} = require("../controller/customerRepresentative.controller");

const customerRepRouter = express.Router();

customerRepRouter
  .route("/add-cr")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    CustomerRepresentativeController.addCustomerRepresentative
  );

customerRepRouter
  .route("/view-cr")
  .get(
    UserMiddleware.isUserLoggedIn,
    CustomerRepresentativeController.viewCRData
  );

customerRepRouter
  .route("/update-cr/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    CustomerRepresentativeController.updateCrData
  );

customerRepRouter
  .route("/delete-cr/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    CustomerRepresentativeController.deleteCrData
  );

module.exports = {
  customerRepRouter,
};
