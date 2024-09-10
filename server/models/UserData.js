const {DataTypes} = require("sequelize");
const sequelize = require("../utils/db");

const UserData = sequelize.define('UserData', {
    amount:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    category:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true
    } 
});

module.exports = UserData;