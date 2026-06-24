const model = require("../models");

// Função para obter todos os pontos de ronda
const obterTodosPontosRonda = async () => {
  return await model.PontoRonda.findAll({
    order: [["descricao", "ASC"]],
  });
};

// Função para obter ponto de ronda por ID
const obterPontoRondaPorId = async (idPontoR) => {
  return await model.PontoRonda.findByPk(idPontoR);
};

// Função para criar um novo ponto de ronda
const criaPontoRonda = async (pontoData) => {
  const novoPontoRonda = await model.PontoRonda.create(pontoData);
  return novoPontoRonda;
};

// Função para atualizar um ponto de ronda
const atualizaPontoRonda = async (pontoData) => {
  try {
    await model.PontoRonda.update(pontoData, {
      where: { idPontoR: pontoData.idPontoR },
    });
    return await obterPontoRondaPorId(pontoData.idPontoR);
  } catch (error) {
    throw error;
  }
};

// Função para deletar um ponto de ronda
const deletaPontoRonda = async (idPontoR) => {
  const pontoRonda = await obterPontoRondaPorId(idPontoR);
  await model.PontoRonda.destroy({
    where: { idPontoR: idPontoR },
  });
  return pontoRonda;
};

module.exports = {
  obterTodosPontosRonda,
  obterPontoRondaPorId,
  criaPontoRonda,
  atualizaPontoRonda,
  deletaPontoRonda,
};
