"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Percurso = sequelize.define(
    "Percurso",
    {
      idPercurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      distancia: {
        type: DataTypes.FLOAT,
      },
      dataFim: {
        type: DataTypes.STRING,
      },
      kmPercorrido: {
        type: DataTypes.FLOAT,
      },
      observacoes: {
        type: DataTypes.TEXT,
      },
      fk_Ronda_idRonda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Ronda",
          key: "idRonda",
        },
      },
    },
    {
      tableName: "Percurso",
      timestamps: false,
    }
  );

  Percurso.associate = function (models) {
    // Percurso -> Ronda (N:1)
    Percurso.belongsTo(models.Ronda, {
      foreignKey: "fk_Ronda_idRonda",
    });

    // Percurso <-> Vigia (N:N)
    Percurso.belongsToMany(models.Vigia, {
      through: "realizaPercurso",
      foreignKey: "fk_Percurso_idPercurso",
      otherKey: "fk_Vigia_fk_Usuario_idUsuario",
      timestamps: false,
    });

    // Percurso -> Ocorrencia (1:N)
    Percurso.hasMany(models.Ocorrencia, {
      foreignKey: "fk_Percurso_idPercurso",
    });
  };

  return Percurso;
};