const express = require("express");
const { UserController } = require("../controller/user.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const userRouter = express.Router();

userRouter.route("/login").post(UserController.login);
userRouter
  .route("/logout")
  .post(UserMiddleware.isUserLoggedIn, UserController.logout);

userRouter
  .route("/add-conversion")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    UserController.addConversionCommitte
  );

userRouter
  .route("/view-conversion")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    UserController.viewConversionCommittee
  );

module.exports = {
  userRouter,
};
