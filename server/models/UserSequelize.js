const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const UserSequelize = sequelize.define("UserSequelize", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  premiumUserPaymentReceipt: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = UserSequelize;
