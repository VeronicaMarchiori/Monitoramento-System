const { Sequelize } = require("sequelize");

const cls = require("cls-hooked");
const transactionNamespace = cls.createNamespace("transaction_namespace");

Sequelize.useCLS(transactionNamespace);

const sequelize = new Sequelize({
  host: "localhost",
  port: "5432",
  database: "sistema_vigilancia_rondas",
  username: "postgres",
  password: "postgres",
  schema: "public",
  dialect: "postgres",
  freezeTableNames: true,
  syncOnAssociation: false,
  logging: console.log,
  define: {
    freezeTableNames: true,
    timestamps: false,
  },
});

module.exports = sequelize;