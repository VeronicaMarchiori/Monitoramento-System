"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ocorrencia = sequelize.define(
    "Ocorrencia",
    {
      idOcorrencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
      },
      data: {
        type: DataTypes.STRING,
      },
      hora: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.FLOAT,
      },
      longitude: {
        type: DataTypes.FLOAT,
      },
      fk_Percurso_idPercurso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Percurso",
          key: "idPercurso",
        },
      },
    },
    {
      tableName: "Ocorrencia",
      timestamps: false,
    }
  );

  Ocorrencia.associate = function (models) {
    // Ocorrencia -> Percurso (N:1)
    Ocorrencia.belongsTo(models.Percurso, {
      foreignKey: "fk_Percurso_idPercurso",
    });
  };

  return Ocorrencia;
};