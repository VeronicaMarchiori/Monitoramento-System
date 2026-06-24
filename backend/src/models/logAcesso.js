"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LogAcesso = sequelize.define(
    "LogAcesso",
    {
      idLogA: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      data: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      sucesso: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
      },
      hora: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
      },
      fk_Usuario_idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Usuario",
          key: "idUsuario",
        },
      },
    },
    {
      tableName: "LogAcesso",
      timestamps: false,
    }
  );

  LogAcesso.associate = function (models) {
    // LogAcesso -> Usuario (N:1)
    LogAcesso.belongsTo(models.Usuario, {
      foreignKey: "fk_Usuario_idUsuario",
    });
  };

  return LogAcesso;
};