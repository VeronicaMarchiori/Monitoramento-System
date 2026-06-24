"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Mensagem = sequelize.define(
    "Mensagem",
    {
      idMensagem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conteudo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      hora: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
      },
      fk_Ronda_idRonda: {
        type: DataTypes.INTEGER,
        references: {
          model: "Ronda",
          key: "idRonda",
        },
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
      tableName: "Mensagem",
      timestamps: false,
    }
  );

  Mensagem.associate = function (models) {
    // Mensagem -> Usuario (N:1)
    Mensagem.belongsTo(models.Usuario, {
      foreignKey: "fk_Usuario_idUsuario",
    });

    // Mensagem -> Ronda (N:1) - Opcional
    Mensagem.belongsTo(models.Ronda, {
      foreignKey: "fk_Ronda_idRonda",
    });
  };

  return Mensagem;
};