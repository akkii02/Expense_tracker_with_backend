const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/db");
const { toDefaultValue } = require("sequelize/lib/utils");

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
  totalExpense:{
    type: Sequelize.FLOAT,
    allowNull:true,
    defaultValue:0,
  },
  premiumUserPaymentReceipt: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = UserSequelize;
