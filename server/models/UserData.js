const {DataTypes} = require("sequelize");
const sequelize = require("../utils/db");
const UserSequelize = require('./UserSequelize');

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
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // this is the foreign key for the user
        references: {
            model: UserSequelize, // name of the users table in your database
            key: 'id'
        },
        onDelete: 'CASCADE' // ensures expenses are deleted if the user is deleted
    }
});

module.exports = UserData;