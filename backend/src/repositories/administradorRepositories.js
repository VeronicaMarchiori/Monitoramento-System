const model = require("../models");

// Função para obter todos os administradores
const obterTodosAdministradores = async () => {
  return await model.Administrador.findAll({
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para obter administrador por ID de usuário
const obterAdministradorPorId = async (idUsuario) => {
  return await model.Administrador.findByPk(idUsuario, {
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
  });
};

// Função para obter administradores ativos
const obterAdministradoresAtivos = async () => {
  return await model.Administrador.findAll({
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

// Função para obter administradores por nível de acesso
const obterAdministradoresPorNivel = async (nivelAcesso) => {
  return await model.Administrador.findAll({
    where: { nivelAcesso: nivelAcesso },
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
    order: [[model.Usuario, "nome", "ASC"]],
  });
};

// Função para criar um novo administrador
const criaAdministrador = async (adminData) => {
  const novoAdministrador = await model.Administrador.create(adminData);
  return novoAdministrador;
};

// Função para atualizar um administrador
const atualizaAdministrador = async (adminData) => {
  try {
    await model.Administrador.update(adminData, {
      where: { idUsuario: adminData.idUsuario },
    });
    return await obterAdministradorPorId(adminData.idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para atualizar nível de acesso do administrador
const atualizaNivelAcesso = async (idUsuario, nivelAcesso) => {
  try {
    await model.Administrador.update(
      { nivelAcesso: nivelAcesso },
      { where: { idUsuario: idUsuario } }
    );
    return await obterAdministradorPorId(idUsuario);
  } catch (error) {
    throw error;
  }
};

// Função para deletar um administrador
const deletaAdministrador = async (idUsuario) => {
  const administrador = await obterAdministradorPorId(idUsuario);
  await model.Administrador.destroy({
    where: { idUsuario: idUsuario },
  });
  return administrador;
};

// Função para obter rondas criadas por um administrador
const obterRondasDoAdministrador = async (idUsuario) => {
  return await model.Ronda.findAll({
    where: { fk_Administrador_idUsuario: idUsuario },
    include: [
      {
        model: model.Percurso,
        attributes: ["idPercurso", "nome", "descricao"],
      },
    ],
    order: [["dataInicio", "DESC"]],
  });
};

// Função para obter estatísticas do administrador
const obterEstatisticasAdministrador = async (idUsuario) => {
  const administrador = await obterAdministradorPorId(idUsuario);

  if (!administrador) {
    return null;
  }

  // Total de rondas criadas
  const totalRondasCriadas = await model.Ronda.count({
    where: { fk_Administrador_idUsuario: idUsuario },
  });

  // Total de percursos no sistema
  const totalPercursos = await model.Percurso.count();

  // Total de vigias no sistema
  const totalVigias = await model.Vigia.count();

  // Total de ocorrências no sistema
  const totalOcorrencias = await model.Ocorrencia.count();

  // Rondas em andamento
  const rondasEmAndamento = await model.Ronda.count({
    where: {
      fk_Administrador_idUsuario: idUsuario,
      dataFim: null,
    },
  });

  // Rondas concluídas
  const rondasConcluidas = await model.Ronda.count({
    where: {
      fk_Administrador_idUsuario: idUsuario,
      dataFim: { [model.Sequelize.Op.not]: null },
    },
  });

  return {
    administrador,
    totalRondasCriadas,
    totalPercursos,
    totalVigias,
    totalOcorrencias,
    rondasEmAndamento,
    rondasConcluidas,
    nivelAcesso: administrador.nivelAcesso,
  };
};

// Função para verificar se é administrador master
const isAdministradorMaster = async (idUsuario) => {
  const admin = await obterAdministradorPorId(idUsuario);
  return admin && admin.nivelAcesso === "master";
};

// Função para obter dashboard do administrador
const obterDashboardAdministrador = async (idUsuario) => {
  const admin = await obterAdministradorPorId(idUsuario);

  if (!admin) {
    return null;
  }

  // Estatísticas gerais
  const totalUsuarios = await model.Usuario.count();
  const totalVigias = await model.Vigia.count();
  const totalAdministradores = await model.Administrador.count();
  const totalPercursos = await model.Percurso.count();
  const totalRondas = await model.Ronda.count();
  const totalOcorrencias = await model.Ocorrencia.count();

  // Vigias em ronda
  const vigiasEmRonda = await model.Vigia.count({
    where: { EstaRonda: true },
  });

  // Rondas em andamento
  const rondasEmAndamento = await model.Ronda.count({
    where: { dataFim: null },
  });

  // Ocorrências recentes (últimas 24h)
  const ocorrenciasRecentes = await model.Ocorrencia.count({
    where: {
      data: {
        [model.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  return {
    administrador: admin,
    estatisticas: {
      totalUsuarios,
      totalVigias,
      totalAdministradores,
      totalPercursos,
      totalRondas,
      totalOcorrencias,
      vigiasEmRonda,
      rondasEmAndamento,
      ocorrenciasRecentes,
    },
  };
};

module.exports = {
  obterTodosAdministradores,
  obterAdministradorPorId,
  obterAdministradoresAtivos,
  obterAdministradoresPorNivel,
  criaAdministrador,
  atualizaAdministrador,
  atualizaNivelAcesso,
  deletaAdministrador,
  obterRondasDoAdministrador,
  obterEstatisticasAdministrador,
  isAdministradorMaster,
  obterDashboardAdministrador,
};
