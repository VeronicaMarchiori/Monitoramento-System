"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ronda = sequelize.define(
    "Ronda",
    {
      idRonda: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sequenciaPontos: {
        type: DataTypes.TEXT,
      },
      tempoEstimado: {
        type: DataTypes.STRING,
      },
      periodo: {
        type: DataTypes.STRING,
      },
      fk_Empresa_idEmpresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Empresa",
          key: "idEmpresa",
        },
      },
      fk_Administrador_idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Administrador",
          key: "idUsuario",
        },
      },
    },
    {
      tableName: "Ronda",
      timestamps: false,
    }
  );

  Ronda.associate = function (models) {
    // Ronda -> Empresa (N:1)
    Ronda.belongsTo(models.Empresa, {
      foreignKey: "fk_Empresa_idEmpresa",
    });

    // Ronda -> Administrador (N:1)
    Ronda.belongsTo(models.Administrador, {
      foreignKey: "fk_Administrador_idUsuario",
    });

    // Ronda <-> PontoRonda (N:N)
    Ronda.belongsToMany(models.PontoRonda, {
      through: "TemPontosRondas",
      foreignKey: "fk_Ronda_idRonda",
      otherKey: "fk_PontoRonda_idPontoR",
      timestamps: false,
    });

    // Ronda -> Percurso (1:N)
    Ronda.hasMany(models.Percurso, {
      foreignKey: "fk_Ronda_idRonda",
    });

    // Ronda -> Mensagem (1:N)
    Ronda.hasMany(models.Mensagem, {
      foreignKey: "fk_Ronda_idRonda",
    });
  };

  return Ronda;
};