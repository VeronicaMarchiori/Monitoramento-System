"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Vigia = sequelize.define(
    "Vigia",
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Usuario",
          key: "idUsuario",
        },
      },
      foto: {
        type: DataTypes.TEXT,
      },
      EstaRonda: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "Vigia",
      timestamps: false,
    }
  );

  Vigia.associate = function (models) {
    // Vigia -> Usuario (N:1)
    Vigia.belongsTo(models.Usuario, {
      foreignKey: "idUsuario",
      sourceKey: "idUsuario",
    });

    // Vigia <-> Percurso (N:N)
    Vigia.belongsToMany(models.Percurso, {
      through: "realizaPercurso",
      foreignKey: "fk_Vigia_fk_Usuario_idUsuario",
      otherKey: "fk_Percurso_idPercurso",
      timestamps: false,
    });
  };

  return Vigia;
};