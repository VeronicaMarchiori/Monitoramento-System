"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Empresa = sequelize.define(
    "Empresa",
    {
      idEmpresa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      endereco: {
        type: DataTypes.STRING,
      },
      telefone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "Empresa",
      timestamps: false,
    }
  );

  Empresa.associate = function (models) {
    // Empresa -> Ronda (1:N)
    Empresa.hasMany(models.Ronda, {
      foreignKey: "fk_Empresa_idEmpresa",
      onDelete: "CASCADE",
    });
  };

  return Empresa;
};