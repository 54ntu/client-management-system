const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  conversion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversion",
  },
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  job_title: {
    type: String,
    required: true,
  },
  workLocation: {
    type: String,
    required: true,
  },
  employeementType: {
    type: String,
    required: true,
  },
  date_joined: {
    type: Date,
    default: Date.now,
  },
  contract_id: {
    type: String,
    required: true,
    unique: true,
  },
  contract_start_date: {
    type: Date,
  },
  contract_end_date: {
    type: Date,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = { Employee };
