const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const TableRestaurant = sequelize.define(
    "Mesa",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        numeroMesa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },

        mesero: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "mesas",
        timestamps: true,
    },
);

module.exports = TableRestaurant;
