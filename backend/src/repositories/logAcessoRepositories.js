const model = require("../models");
const { Op } = require("sequelize");

// Função para obter todos os logs de acesso
const obterTodosLogsAcesso = async (usuarioId, sucesso) => {
  const where = {};
  
  if (usuarioId) {
    where.fk_Usuario_idUsuario = usuarioId;
  }
  
  if (sucesso !== undefined) {
    where.sucesso = sucesso === "true" || sucesso === true;
  }
  
  return await model.LogAcesso.findAll({
    where,
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
    order: [
      ["data", "DESC"],
      ["hora", "DESC"],
    ],
  });
};

// Função para obter log de acesso por ID
const obterLogAcessoPorId = async (idLogA) => {
  return await model.LogAcesso.findByPk(idLogA, {
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
  });
};

// Função para criar um novo log de acesso
const criaLogAcesso = async (logData) => {
  const novoLogAcesso = await model.LogAcesso.create(logData);
  return novoLogAcesso;
};

// Função para deletar um log de acesso
const deletaLogAcesso = async (idLogA) => {
  const logAcesso = await obterLogAcessoPorId(idLogA);
  await model.LogAcesso.destroy({
    where: { idLogA: idLogA },
  });
  return logAcesso;
};

// Função para limpar logs antigos (mais de 90 dias)
const limparLogsAntigos = async () => {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 90);
  
  const deleted = await model.LogAcesso.destroy({
    where: {
      data: {
        [Op.lt]: dataLimite,
      },
    },
  });
  
  return deleted;
};

module.exports = {
  obterTodosLogsAcesso,
  obterLogAcessoPorId,
  criaLogAcesso,
  deletaLogAcesso,
  limparLogsAntigos,
};
