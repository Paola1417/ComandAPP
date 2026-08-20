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

        estado: {
            type: DataTypes.ENUM("activo", "inactivo"),
            allowNull: false,
            defaultValue: "activo",
        },

        accessToken: {
            type: DataTypes.STRING(64),
            allowNull: true,
            unique: true,
        },
    },
    {
        tableName: "mesas",
        timestamps: true,
        hooks: {
            beforeCreate: (mesa) => {
                if (!mesa.accessToken) {
                    mesa.accessToken = require("crypto")
                        .randomBytes(16)
                        .toString("hex");
                }
            },
        },
    },
);

module.exports = TableRestaurant;
