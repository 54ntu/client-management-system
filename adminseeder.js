const { envConfig } = require("./src/config/config");
const { User } = require("./src/models/user.models");
const { hashPassword } = require("./src/services/authcontroller");
const adminSeeder = async () => {
  const data = await User.find({ email: envConfig.adminemail });
  const hashedPassword = await hashPassword(envConfig.adminpassword);
  if (!data || data.length === 0) {
    await User.create({
      email: envConfig.adminemail,
      password: hashedPassword,
      role: "admin",
    });
    console.log("admin seeded successfully");
  } else {
    console.log("please try again later || admin with email already seeded");
  }
};

module.exports = {
  adminSeeder,
};
