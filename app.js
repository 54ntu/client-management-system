const express = require("express");
const { clientRouter } = require("./src/routes/client.routes");
const { employeeRouter } = require("./src/routes/employee.routes");
const { userRouter } = require("./src/routes/user.routes");
const { projectRouter } = require("./src/routes/project.routes");
const { milestoneRouter } = require("./src/routes/projectMilestone.routes");
const { milestoneTaskRouter } = require("./src/routes/milestoneTask.routes");
const {
  employeeDashboardRouter,
} = require("./src/routes/employeeDashboard.routes");
const { customerRepRouter } = require("./src/routes/customerRep.routes");
const { complaintRouter } = require("./src/routes/complaint.routes");
const { chatRouter } = require("./src/routes/chat.routes");
const { invoiceRouter } = require("./src/routes/invoice.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));

//client controller router
app.use("/api/v1/client", clientRouter);

//employee controller router
app.use("/api/v1/employee", employeeRouter);

//user controller router
app.use("/api/v1/user", userRouter);

//routes for project
app.use("/api/v1/project", projectRouter);

//routes for project milestone
app.use("/api/v1/milestone", milestoneRouter);

//routes for milestone task router
app.use("/api/v1/task", milestoneTaskRouter);

//routes for employee dashboard
app.use("/api/v1/employee-dash", employeeDashboardRouter);

//routes for customer representative
app.use("/api/v1/customer-repres", customerRepRouter);

//routes for complaint
app.use("/api/v1/complaint", complaintRouter);

//routes for chat history
app.use("/api/v1/chat", chatRouter);

//routes for invoice
app.use("/api/v1/invoice", invoiceRouter);

module.exports = { app };
