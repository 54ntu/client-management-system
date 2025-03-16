const express = require("express");
const { ClientController } = require("../controller/client.controller");
const { upload } = require("../middleware/multer.middleware");
const { UserMiddleware } = require("../middleware/auth.middleware");
const clientRouter = express.Router();

clientRouter
  .route("/register")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    ClientController.registerClient
  );

clientRouter
  .route("/view-clients")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ClientController.getClientDetails
  );

clientRouter
  .route("/client-details/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ClientController.getClientDatabyid
  );

clientRouter
  .route("/client-viewProfile")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientController.getProfile
  );

clientRouter
  .route("/client-updateProfile")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientController.updateProfile
  );

clientRouter
  .route("/client-updatePassword")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isClient,
    ClientController.updatePassword
  );
module.exports = {
  clientRouter,
};
