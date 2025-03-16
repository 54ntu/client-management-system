const mongoose = require("mongoose");
const { userRole, userStatus } = require("../global");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        userRole.admin,
        userRole.conversion_committe,
        userRole.client,
        userRole.employee,
        userRole.customer_representative,
      ],
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: [userStatus.active, userStatus.inactive],
      default: userStatus.active,
    },
    profileImage: {
      type: String, //url from the cloudinary
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
