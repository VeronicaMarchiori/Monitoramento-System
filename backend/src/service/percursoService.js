const percursoRepository = require("../repositories/percursoRepositories");
const model = require("../models");

// Função para retornar todos os percursos
const retornaTodosPercursos = async () => {
  try {
    return await percursoRepository.obterTodosPercursos();
  } catch (error) {
    console.log("Erro ao buscar percursos:", error);
    throw new Error("Erro ao buscar percursos: " + error.message);
  }
};

// Função para retornar percurso por ID
const retornaPercursoPorId = async (idPercurso) => {
  try {
    const percurso = await percursoRepository.obterPercursoPorId(idPercurso);
    
    if (!percurso) {
      throw new Error("Percurso não encontrado");
    }
    
    return percurso;
  } catch (error) {
    console.log("Erro ao buscar percurso:", error);
    throw new Error("Erro ao buscar percurso: " + error.message);
  }
};

// Função para criar um percurso
const criaPercurso = async (percursoData) => {
  const { vigias, ...dadosPercurso } = percursoData;
  
  try {
    // Criar percurso
    const percurso = await percursoRepository.criaPercurso(dadosPercurso);
    
    // Adicionar vigias se fornecidos
    if (vigias && vigias.length > 0) {
      const percursoCompleto = await model.Percurso.findByPk(percurso.idPercurso);
      const vigiasEncontrados = await model.Vigia.findAll({
        where: {
          idUsuario: vigias,
        },
      });
      
      if (percursoCompleto && vigiasEncontrados.length > 0) {
        await percursoCompleto.addVigias(vigiasEncontrados);
      }
    }
    
    return await percursoRepository.obterPercursoPorId(percurso.idPercurso);
  } catch (error) {
    console.log("Erro ao criar percurso:", error);
    throw new Error("Erro ao criar percurso: " + error.message);
  }
};

// Função para atualizar um percurso
const atualizaPercurso = async (idPercurso, percursoData) => {
  try {
    const percursoAtualizado = await percursoRepository.atualizaPercurso(idPercurso, percursoData);
    
    if (!percursoAtualizado) {
      throw new Error("Percurso não encontrado");
    }
    
    return percursoAtualizado;
  } catch (error) {
    console.log("Erro ao atualizar percurso:", error);
    throw new Error("Erro ao atualizar percurso: " + error.message);
  }
};

// Função para deletar um percurso
const deletaPercurso = async (idPercurso) => {
  try {
    const percursoDeletado = await percursoRepository.deletaPercurso(idPercurso);
    
    if (!percursoDeletado) {
      throw new Error("Percurso não encontrado");
    }
    
    return { message: "Percurso deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar percurso:", error);
    throw new Error("Erro ao deletar percurso: " + error.message);
  }
};

// Função para adicionar vigia a um percurso
const adicionaVigiaPercurso = async (idPercurso, idVigia) => {
  try {
    const percurso = await model.Percurso.findByPk(idPercurso);
    const vigia = await model.Vigia.findByPk(idVigia);
    
    if (!percurso) {
      throw new Error("Percurso não encontrado");
    }
    
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }
    
    await percurso.addVigia(vigia);
    return { message: "Vigia adicionado ao percurso com sucesso" };
  } catch (error) {
    console.log("Erro ao adicionar vigia ao percurso:", error);
    throw new Error("Erro ao adicionar vigia ao percurso: " + error.message);
  }
};

// Função para remover vigia de um percurso
const removeVigiaPercurso = async (idPercurso, idVigia) => {
  try {
    const percurso = await model.Percurso.findByPk(idPercurso);
    const vigia = await model.Vigia.findByPk(idVigia);
    
    if (!percurso) {
      throw new Error("Percurso não encontrado");
    }
    
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }
    
    await percurso.removeVigia(vigia);
    return { message: "Vigia removido do percurso com sucesso" };
  } catch (error) {
    console.log("Erro ao remover vigia do percurso:", error);
    throw new Error("Erro ao remover vigia do percurso: " + error.message);
  }
};

module.exports = {
  retornaTodosPercursos,
  retornaPercursoPorId,
  criaPercurso,
  atualizaPercurso,
  deletaPercurso,
  adicionaVigiaPercurso,
  removeVigiaPercurso,
};