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
const { paymentRouter } = require("./src/routes/payment.routes");
const {
  clientDashboardRouter,
} = require("./src/routes/clientDashboard.routes");
const { clientTimeLineRouter } = require("./src/routes/clientTimeline.routes");
const {
  conversionCommitteeRouter,
} = require("./src/routes/conversionCommittee.routes");
const {
  conversionPaymentRouter,
} = require("./src/routes/conversionCommitteePayment.routes");
const { chatbotRouter } = require("./src/routes/chatbot.routes");
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

//routes for payment
app.use("/api/v1/payment", paymentRouter);

//routes for client dashboard controller
app.use("/api/v1/client-dashboard", clientDashboardRouter);

//routes for client timeline controller
app.use("/api/v1/client-timeline", clientTimeLineRouter);

//routes for conversion committee
app.use("/api/v1/conversion-dashboard", conversionCommitteeRouter);

//routes for conversion committee payment controller
app.use("/api/v1/conversion-payment", conversionPaymentRouter);

//routes for chatbot controller
app.use("/api/v1/chat", chatbotRouter);

module.exports = { app };
