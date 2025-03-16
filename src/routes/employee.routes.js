const express = require("express");
const { EmployeeController } = require("../controller/employee.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const employeeRouter = express.Router();

employeeRouter
  .route("/add-employee")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    upload.single("image"),
    EmployeeController.addEmployee
  );

employeeRouter
  .route("/view-employee")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    EmployeeController.getEmployee
  );

employeeRouter
  .route("/update-employee/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    EmployeeController.updateEmployeeData
  );

employeeRouter
  .route("/get-assignedprojects/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isAdmin,
    EmployeeController.getProjectOfEmployeeMent
  );

module.exports = {
  employeeRouter,
};
