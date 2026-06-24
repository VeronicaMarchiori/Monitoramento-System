"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      senha: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      dataCriacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Usuario",
      timestamps: false,
    }
  );

  Usuario.associate = function (models) {
    // Usuario -> Administrador (1:1)
    Usuario.hasOne(models.Administrador, {
      foreignKey: "idUsuario",
      onDelete: "CASCADE",
    });

    // Usuario -> Vigia (1:1)
    Usuario.hasOne(models.Vigia, {
      foreignKey: "idUsuario",
      onDelete: "CASCADE",
    });

    // Usuario -> Mensagem (1:N)
    Usuario.hasMany(models.Mensagem, {
      foreignKey: "fk_Usuario_idUsuario",
    });

    // Usuario -> LogAcesso (1:N)
    Usuario.hasMany(models.LogAcesso, {
      foreignKey: "fk_Usuario_idUsuario",
    });
  };

  return Usuario;
};