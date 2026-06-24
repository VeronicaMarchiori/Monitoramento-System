const ocorrenciaRepository = require("../repositories/ocorrenciaRepositories");

// Função para retornar todas as ocorrências
const retornaTodasOcorrencias = async () => {
  try {
    return await ocorrenciaRepository.obterTodasOcorrencias();
  } catch (error) {
    console.log("Erro ao buscar ocorrências:", error);
    throw new Error("Erro ao buscar ocorrências: " + error.message);
  }
};

// Função para retornar ocorrência por ID
const retornaOcorrenciaPorId = async (idOcorrencia) => {
  try {
    const ocorrencia = await ocorrenciaRepository.obterOcorrenciaPorId(idOcorrencia);
    
    if (!ocorrencia) {
      throw new Error("Ocorrência não encontrada");
    }
    
    return ocorrencia;
  } catch (error) {
    console.log("Erro ao buscar ocorrência:", error);
    throw new Error("Erro ao buscar ocorrência: " + error.message);
  }
};

// Função para criar uma ocorrência
const criaOcorrencia = async (ocorrenciaData) => {
  try {
    // Adicionar data e hora atuais se não fornecidas
    const dadosCompletos = { ...ocorrenciaData };
    
    if (!dadosCompletos.data) {
      dadosCompletos.data = new Date().toISOString().split("T")[0];
    }
    
    if (!dadosCompletos.hora) {
      dadosCompletos.hora = new Date().toISOString().split("T")[1].split(".")[0];
    }
    
    return await ocorrenciaRepository.criaOcorrencia(dadosCompletos);
  } catch (error) {
    console.log("Erro ao criar ocorrência:", error);
    throw new Error("Erro ao criar ocorrência: " + error.message);
  }
};

// Função para atualizar uma ocorrência
const atualizaOcorrencia = async (idOcorrencia, ocorrenciaData) => {
  try {
    const ocorrenciaAtualizada = await ocorrenciaRepository.atualizaOcorrencia(idOcorrencia, ocorrenciaData);
    
    if (!ocorrenciaAtualizada) {
      throw new Error("Ocorrência não encontrada");
    }
    
    return ocorrenciaAtualizada;
  } catch (error) {
    console.log("Erro ao atualizar ocorrência:", error);
    throw new Error("Erro ao atualizar ocorrência: " + error.message);
  }
};

// Função para deletar uma ocorrência
const deletaOcorrencia = async (idOcorrencia) => {
  try {
    const ocorrenciaDeletada = await ocorrenciaRepository.deletaOcorrencia(idOcorrencia);
    
    if (!ocorrenciaDeletada) {
      throw new Error("Ocorrência não encontrada");
    }
    
    return { message: "Ocorrência deletada com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar ocorrência:", error);
    throw new Error("Erro ao deletar ocorrência: " + error.message);
  }
};

module.exports = {
  retornaTodasOcorrencias,
  retornaOcorrenciaPorId,
  criaOcorrencia,
  atualizaOcorrencia,
  deletaOcorrencia,
};