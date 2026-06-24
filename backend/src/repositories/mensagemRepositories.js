const model = require("../models");

// Função para obter todas as mensagens
const obterTodasMensagens = async (rondaId) => {
  const where = {};
  
  if (rondaId) {
    where.fk_Ronda_idRonda = rondaId;
  }
  
  return await model.Mensagem.findAll({
    where,
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
      {
        model: model.Ronda,
        required: false,
      },
    ],
    order: [
      ["data", "DESC"],
      ["hora", "DESC"],
    ],
  });
};

// Função para obter mensagem por ID
const obterMensagemPorId = async (idMensagem) => {
  return await model.Mensagem.findByPk(idMensagem, {
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
      {
        model: model.Ronda,
        required: false,
      },
    ],
  });
};

// Função para criar uma nova mensagem
const criaMensagem = async (mensagemData) => {
  const novaMensagem = await model.Mensagem.create(mensagemData);
  return novaMensagem;
};

// Função para atualizar uma mensagem
const atualizaMensagem = async (mensagemData) => {
  try {
    await model.Mensagem.update(mensagemData, {
      where: { idMensagem: mensagemData.idMensagem },
    });
    return await obterMensagemPorId(mensagemData.idMensagem);
  } catch (error) {
    throw error;
  }
};

// Função para deletar uma mensagem
const deletaMensagem = async (idMensagem) => {
  const mensagem = await obterMensagemPorId(idMensagem);
  await model.Mensagem.destroy({
    where: { idMensagem: idMensagem },
  });
  return mensagem;
};

module.exports = {
  obterTodasMensagens,
  obterMensagemPorId,
  criaMensagem,
  atualizaMensagem,
  deletaMensagem,
};
