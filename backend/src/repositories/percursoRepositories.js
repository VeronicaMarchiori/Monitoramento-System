const model = require("../models");

// Função para obter todos os percursos
const obterTodosPercursos = async () => {
  return await model.Percurso.findAll({
    include: [
      {
        model: model.Ronda,
      },
      {
        model: model.Vigia,
        include: [
          {
            model: model.Usuario,
            attributes: { exclude: ["senha"] },
          },
        ],
      },
    ],
  });
};

// Função para obter percurso por ID
const obterPercursoPorId = async (idPercurso) => {
  return await model.Percurso.findByPk(idPercurso, {
    include: [
      {
        model: model.Ronda,
      },
      {
        model: model.Vigia,
        include: [
          {
            model: model.Usuario,
            attributes: { exclude: ["senha"] },
          },
        ],
      },
    ],
  });
};

// Função para criar um novo percurso
const criaPercurso = async (percursoData) => {
  const novoPercurso = await model.Percurso.create(percursoData);
  return novoPercurso;
};

// Função para atualizar um percurso
const atualizaPercurso = async (percursoData) => {
  try {
    await model.Percurso.update(percursoData, {
      where: { idPercurso: percursoData.idPercurso },
    });
    return await obterPercursoPorId(percursoData.idPercurso);
  } catch (error) {
    throw error;
  }
};

// Função para deletar um percurso
const deletaPercurso = async (idPercurso) => {
  const percurso = await obterPercursoPorId(idPercurso);
  await model.Percurso.destroy({
    where: { idPercurso: idPercurso },
  });
  return percurso;
};

module.exports = {
  obterTodosPercursos,
  obterPercursoPorId,
  criaPercurso,
  atualizaPercurso,
  deletaPercurso,
};
