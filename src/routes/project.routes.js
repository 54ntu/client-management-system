const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { ProjectController } = require("../controller/project.controller");
const { Project } = require("../models/project.models");

const projectRouter = express.Router();

projectRouter
  .route("/add")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    ProjectController.addproject
  );

projectRouter
  .route("/view")
  .get(
    UserMiddleware.isUserLoggedIn,
    ProjectController.viewProject
  );

projectRouter
  .route("/update-project/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    ProjectController.updateProject
  );

projectRouter
  .route("/delete-project/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    ProjectController.deleteProject
  );

module.exports = { projectRouter };
