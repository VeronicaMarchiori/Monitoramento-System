const model = require("../models");

// Função para obter todas as ocorrências
const obterTodasOcorrencias = async () => {
  return await model.Ocorrencia.findAll({
    include: [
      {
        model: model.Percurso,
        include: [
          {
            model: model.Ronda,
          },
        ],
      },
    ],
    order: [
      ["data", "DESC"],
      ["hora", "DESC"],
    ],
  });
};

// Função para obter ocorrência por ID
const obterOcorrenciaPorId = async (idOcorrencia) => {
  return await model.Ocorrencia.findByPk(idOcorrencia, {
    include: [
      {
        model: model.Percurso,
        include: [
          {
            model: model.Ronda,
          },
        ],
      },
    ],
  });
};

// Função para criar uma nova ocorrência
const criaOcorrencia = async (ocorrenciaData) => {
  const novaOcorrencia = await model.Ocorrencia.create(ocorrenciaData);
  return novaOcorrencia;
};

// Função para atualizar uma ocorrência
const atualizaOcorrencia = async (ocorrenciaData) => {
  try {
    await model.Ocorrencia.update(ocorrenciaData, {
      where: { idOcorrencia: ocorrenciaData.idOcorrencia },
    });
    return await obterOcorrenciaPorId(ocorrenciaData.idOcorrencia);
  } catch (error) {
    throw error;
  }
};

// Função para deletar uma ocorrência
const deletaOcorrencia = async (idOcorrencia) => {
  const ocorrencia = await obterOcorrenciaPorId(idOcorrencia);
  await model.Ocorrencia.destroy({
    where: { idOcorrencia: idOcorrencia },
  });
  return ocorrencia;
};

module.exports = {
  obterTodasOcorrencias,
  obterOcorrenciaPorId,
  criaOcorrencia,
  atualizaOcorrencia,
  deletaOcorrencia,
};
