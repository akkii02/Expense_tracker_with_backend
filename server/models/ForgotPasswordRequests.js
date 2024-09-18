const Sequelize = require("sequelize");
const sequelize = require("../utils/db");
const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {
  id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
  },
  active: Sequelize.BOOLEAN,
  expiresby: Sequelize.DATE
})

module.exports = ForgotPasswordRequests;