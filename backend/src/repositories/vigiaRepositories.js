const model = require("../models");

// Função para obter todos os vigias
const obterTodosVigias = async () => {
  return await model.Vigia.findAll({
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para obter vigia por ID de usuário
const obterVigiaPorId = async (idUsuario) => {
  return await model.Vigia.findByPk(idUsuario, {
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
  });
};

// Função para obter vigias ativos
const obterVigiasAtivos = async () => {
  return await model.Vigia.findAll({
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
        where: { status: true },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para obter vigias em ronda
const obterVigiasEmRonda = async () => {
  return await model.Vigia.findAll({
    where: { EstaRonda: true },
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para obter vigias fora de ronda
const obterVigiasForaDeRonda = async () => {
  return await model.Vigia.findAll({
    where: { EstaRonda: false },
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
        where: { status: true },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para criar um novo vigia
const criaVigia = async (vigiaData) => {
  const novoVigia = await model.Vigia.create(vigiaData);
  return novoVigia;
};

// Função para atualizar um vigia
const atualizaVigia = async (vigiaData) => {
  try {
    await model.Vigia.update(vigiaData, {
      where: { idUsuario: vigiaData.idUsuario },
    });
    return await obterVigiaPorId(vigiaData.idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para atualizar foto do vigia
const atualizaFotoVigia = async (idUsuario, foto) => {
  try {
    await model.Vigia.update(
      { foto: foto },
      { where: { idUsuario: idUsuario } }
    );
    return await obterVigiaPorId(idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para iniciar ronda do vigia
const iniciaRondaVigia = async (idUsuario) => {
  try {
    await model.Vigia.update(
      { EstaRonda: true },
      { where: { idUsuario: idUsuario } }
    );
    return await obterVigiaPorId(idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para finalizar ronda do vigia
const finalizaRondaVigia = async (idUsuario) => {
  try {
    await model.Vigia.update(
      { EstaRonda: false },
      { where: { idUsuario: idUsuario } }
    );
    return await obterVigiaPorId(idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para deletar um vigia
const deletaVigia = async (idUsuario) => {
  const vigia = await obterVigiaPorId(idUsuario);
  await model.Vigia.destroy({
    where: { idUsuario: idUsuario },
  });
  return vigia;
};

// Função para obter rondas do vigia
const obterRondasDoVigia = async (idUsuario) => {
  return await model.Ronda.findAll({
    include: [
      {
        model: model.Vigia,
        where: { idUsuario: idUsuario },
        attributes: [],
      },
    ],
    order: [["dataInicio", "DESC"]],
  });
};

// Função para obter estatísticas do vigia
const obterEstatisticasVigia = async (idUsuario) => {
  const vigia = await obterVigiaPorId(idUsuario);
  
  if (!vigia) {
    return null;
  }

  // Total de rondas realizadas
  const totalRondas = await model.Ronda.count({
    include: [
      {
        model: model.Vigia,
        where: { idUsuario: idUsuario },
        attributes: [],
      },
    ],
  });

  // Total de ocorrências registradas
  const totalOcorrencias = await model.Ocorrencia.count({
    where: { fk_Usuario_idUsuario: idUsuario },
  });

  // Rondas concluídas
  const rondasConcluidas = await model.Ronda.count({
    where: { dataFim: { [model.Sequelize.Op.not]: null } },
    include: [
      {
        model: model.Vigia,
        where: { idUsuario: idUsuario },
        attributes: [],
      },
    ],
  });

  return {
    vigia,
    totalRondas,
    totalOcorrencias,
    rondasConcluidas,
    rondasEmAndamento: totalRondas - rondasConcluidas,
    estaRonda: vigia.EstaRonda,
  };
};

module.exports = {
  obterTodosVigias,
  obterVigiaPorId,
  obterVigiasAtivos,
  obterVigiasEmRonda,
  obterVigiasForaDeRonda,
  criaVigia,
  atualizaVigia,
  atualizaFotoVigia,
  iniciaRondaVigia,
  finalizaRondaVigia,
  deletaVigia,
  obterRondasDoVigia,
  obterEstatisticasVigia,
};
