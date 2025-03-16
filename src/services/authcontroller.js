const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log("error while hashing password😒😒😒😒🥲🥲");
  }
};

const comparedPassword = async (password, hashedPassword) => {
  try {
    const response = await bcrypt.compare(password, hashedPassword);
    return response;
  } catch (error) {
    console.log("error while comparing password😒😒😒😒🥲🥲");
  }
};

module.exports = {
  hashPassword,
  comparedPassword,
};
