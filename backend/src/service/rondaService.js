const rondaRepository = require("../repositories/rondaRepositories");
const model = require("../models");

// Função para retornar todas as rondas
const retornaTodasRondas = async () => {
  try {
    return await rondaRepository.obterTodasRondas();
  } catch (error) {
    console.log("Erro ao buscar rondas:", error);
    throw new Error("Erro ao buscar rondas: " + error.message);
  }
};

// Função para retornar ronda por ID
const retornaRondaPorId = async (idRonda) => {
  try {
    const ronda = await rondaRepository.obterRondaPorId(idRonda);
    
    if (!ronda) {
      throw new Error("Ronda não encontrada");
    }
    
    return ronda;
  } catch (error) {
    console.log("Erro ao buscar ronda:", error);
    throw new Error("Erro ao buscar ronda: " + error.message);
  }
};

// Função para criar uma ronda
const criaRonda = async (rondaData) => {
  const { pontos, ...dadosRonda } = rondaData;
  
  try {
    // Criar ronda
    const ronda = await rondaRepository.criaRonda(dadosRonda);
    
    // Adicionar pontos se fornecidos
    if (pontos && pontos.length > 0) {
      const rondaCompleta = await model.Ronda.findByPk(ronda.idRonda);
      const pontosRonda = await model.PontoRonda.findAll({
        where: {
          idPontoR: pontos,
        },
      });
      
      if (rondaCompleta && pontosRonda.length > 0) {
        await rondaCompleta.addPontoRondas(pontosRonda);
      }
    }
    
    return await rondaRepository.obterRondaPorId(ronda.idRonda);
  } catch (error) {
    console.log("Erro ao criar ronda:", error);
    throw new Error("Erro ao criar ronda: " + error.message);
  }
};

// Função para atualizar uma ronda
const atualizaRonda = async (idRonda, rondaData) => {
  try {
    const rondaAtualizada = await rondaRepository.atualizaRonda(idRonda, rondaData);
    
    if (!rondaAtualizada) {
      throw new Error("Ronda não encontrada");
    }
    
    return rondaAtualizada;
  } catch (error) {
    console.log("Erro ao atualizar ronda:", error);
    throw new Error("Erro ao atualizar ronda: " + error.message);
  }
};

// Função para deletar uma ronda
const deletaRonda = async (idRonda) => {
  try {
    const rondaDeletada = await rondaRepository.deletaRonda(idRonda);
    
    if (!rondaDeletada) {
      throw new Error("Ronda não encontrada");
    }
    
    return { message: "Ronda deletada com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar ronda:", error);
    throw new Error("Erro ao deletar ronda: " + error.message);
  }
};

// Função para adicionar ponto a uma ronda
const adicionaPontoRonda = async (idRonda, idPonto) => {
  try {
    const ronda = await model.Ronda.findByPk(idRonda);
    const ponto = await model.PontoRonda.findByPk(idPonto);
    
    if (!ronda) {
      throw new Error("Ronda não encontrada");
    }
    
    if (!ponto) {
      throw new Error("Ponto não encontrado");
    }
    
    await ronda.addPontoRonda(ponto);
    return { message: "Ponto adicionado à ronda com sucesso" };
  } catch (error) {
    console.log("Erro ao adicionar ponto à ronda:", error);
    throw new Error("Erro ao adicionar ponto à ronda: " + error.message);
  }
};

// Função para remover ponto de uma ronda
const removePontoRonda = async (idRonda, idPonto) => {
  try {
    const ronda = await model.Ronda.findByPk(idRonda);
    const ponto = await model.PontoRonda.findByPk(idPonto);
    
    if (!ronda) {
      throw new Error("Ronda não encontrada");
    }
    
    if (!ponto) {
      throw new Error("Ponto não encontrado");
    }
    
    await ronda.removePontoRonda(ponto);
    return { message: "Ponto removido da ronda com sucesso" };
  } catch (error) {
    console.log("Erro ao remover ponto da ronda:", error);
    throw new Error("Erro ao remover ponto da ronda: " + error.message);
  }
};

module.exports = {
  retornaTodasRondas,
  retornaRondaPorId,
  criaRonda,
  atualizaRonda,
  deletaRonda,
  adicionaPontoRonda,
  removePontoRonda,
};