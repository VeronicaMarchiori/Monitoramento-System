"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PontoRonda = sequelize.define(
    "PontoRonda",
    {
      idPontoR: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.FLOAT,
      },
      longitude: {
        type: DataTypes.FLOAT,
      },
      qrcode: {
        type: DataTypes.TEXT,
      },
      obrigatorio: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      hora: {
        type: DataTypes.STRING,
      },
      data: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "PontoRonda",
      timestamps: false,
    }
  );

  PontoRonda.associate = function (models) {
    // PontoRonda <-> Ronda (N:N)
    PontoRonda.belongsToMany(models.Ronda, {
      through: "TemPontosRondas",
      foreignKey: "fk_PontoRonda_idPontoR",
      otherKey: "fk_Ronda_idRonda",
      timestamps: false,
    });
  };

  return PontoRonda;
};