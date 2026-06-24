const model = require("../models");

// Função para obter todas as rondas
const obterTodasRondas = async () => {
  return await model.Ronda.findAll({
    include: [
      {
        model: model.Empresa,
      },
      {
        model: model.Administrador,
        include: [
          {
            model: model.Usuario,
            attributes: { exclude: ["senha"] },
          },
        ],
      },
      {
        model: model.PontoRonda,
      },
    ],
    order: [["nome", "ASC"]],
  });
};

// Função para obter ronda por ID
const obterRondaPorId = async (idRonda) => {
  return await model.Ronda.findByPk(idRonda, {
    include: [
      {
        model: model.Empresa,
      },
      {
        model: model.Administrador,
        include: [
          {
            model: model.Usuario,
            attributes: { exclude: ["senha"] },
          },
        ],
      },
      {
        model: model.PontoRonda,
      },
    ],
  });
};

// Função para criar uma nova ronda
const criaRonda = async (rondaData) => {
  const novaRonda = await model.Ronda.create(rondaData);
  return novaRonda;
};

// Função para atualizar uma ronda
const atualizaRonda = async (rondaData) => {
  try {
    await model.Ronda.update(rondaData, {
      where: { idRonda: rondaData.idRonda },
    });
    return await obterRondaPorId(rondaData.idRonda);
  } catch (error) {
    throw error;
  }
};

// Função para deletar uma ronda
const deletaRonda = async (idRonda) => {
  const ronda = await obterRondaPorId(idRonda);
  await model.Ronda.destroy({
    where: { idRonda: idRonda },
  });
  return ronda;
};

module.exports = {
  obterTodasRondas,
  obterRondaPorId,
  criaRonda,
  atualizaRonda,
  deletaRonda,
};
