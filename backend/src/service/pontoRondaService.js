const pontoRondaRepository = require("../repositories/pontoRondaRepositories");

// Função para retornar todos os pontos de ronda
const retornaTodosPontosRonda = async () => {
  try {
    return await pontoRondaRepository.obterTodosPontosRonda();
  } catch (error) {
    console.log("Erro ao buscar pontos de ronda:", error);
    throw new Error("Erro ao buscar pontos de ronda: " + error.message);
  }
};

// Função para retornar ponto de ronda por ID
const retornaPontoRondaPorId = async (idPontoR) => {
  try {
    const pontoRonda = await pontoRondaRepository.obterPontoRondaPorId(idPontoR);
    
    if (!pontoRonda) {
      throw new Error("Ponto de ronda não encontrado");
    }
    
    return pontoRonda;
  } catch (error) {
    console.log("Erro ao buscar ponto de ronda:", error);
    throw new Error("Erro ao buscar ponto de ronda: " + error.message);
  }
};

// Função para criar um ponto de ronda
const criaPontoRonda = async (pontoData) => {
  try {
    return await pontoRondaRepository.criaPontoRonda(pontoData);
  } catch (error) {
    console.log("Erro ao criar ponto de ronda:", error);
    throw new Error("Erro ao criar ponto de ronda: " + error.message);
  }
};

// Função para atualizar um ponto de ronda
const atualizaPontoRonda = async (idPontoR, pontoData) => {
  try {
    const pontoRondaAtualizado = await pontoRondaRepository.atualizaPontoRonda(idPontoR, pontoData);
    
    if (!pontoRondaAtualizado) {
      throw new Error("Ponto de ronda não encontrado");
    }
    
    return pontoRondaAtualizado;
  } catch (error) {
    console.log("Erro ao atualizar ponto de ronda:", error);
    throw new Error("Erro ao atualizar ponto de ronda: " + error.message);
  }
};

// Função para deletar um ponto de ronda
const deletaPontoRonda = async (idPontoR) => {
  try {
    const pontoRondaDeletado = await pontoRondaRepository.deletaPontoRonda(idPontoR);
    
    if (!pontoRondaDeletado) {
      throw new Error("Ponto de ronda não encontrado");
    }
    
    return { message: "Ponto de ronda deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar ponto de ronda:", error);
    throw new Error("Erro ao deletar ponto de ronda: " + error.message);
  }
};

module.exports = {
  retornaTodosPontosRonda,
  retornaPontoRondaPorId,
  criaPontoRonda,
  atualizaPontoRonda,
  deletaPontoRonda,
};