"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Administrador = sequelize.define(
    "Administrador",
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Usuario",
          key: "idUsuario",
        },
      },
      nivelAcesso: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "padrao",
      },
    },
    {
      tableName: "Administrador",
      timestamps: false,
    }
  );

  Administrador.associate = function (models) {
    // Administrador -> Usuario (N:1)
    Administrador.belongsTo(models.Usuario, {
      foreignKey: "idUsuario",
      sourceKey: "idUsuario",
    });

    // Administrador -> Ronda (1:N)
    Administrador.hasMany(models.Ronda, {
      foreignKey: "fk_Administrador_idUsuario",
      sourceKey: "idUsuario",
    });
  };

  return Administrador;
};