const mensagemRepository = require("../repositories/mensagemRepositories");

// Função para retornar todas as mensagens
const retornaTodasMensagens = async (rondaId = null) => {
  try {
    return await mensagemRepository.obterTodasMensagens(rondaId);
  } catch (error) {
    console.log("Erro ao buscar mensagens:", error);
    throw new Error("Erro ao buscar mensagens: " + error.message);
  }
};

// Função para retornar mensagem por ID
const retornaMensagemPorId = async (idMensagem) => {
  try {
    const mensagem = await mensagemRepository.obterMensagemPorId(idMensagem);
    
    if (!mensagem) {
      throw new Error("Mensagem não encontrada");
    }
    
    return mensagem;
  } catch (error) {
    console.log("Erro ao buscar mensagem:", error);
    throw new Error("Erro ao buscar mensagem: " + error.message);
  }
};

// Função para criar uma mensagem
const criaMensagem = async (mensagemData) => {
  try {
    return await mensagemRepository.criaMensagem(mensagemData);
  } catch (error) {
    console.log("Erro ao criar mensagem:", error);
    throw new Error("Erro ao criar mensagem: " + error.message);
  }
};

// Função para atualizar uma mensagem
const atualizaMensagem = async (idMensagem, mensagemData) => {
  try {
    const mensagemAtualizada = await mensagemRepository.atualizaMensagem(idMensagem, mensagemData);
    
    if (!mensagemAtualizada) {
      throw new Error("Mensagem não encontrada");
    }
    
    return mensagemAtualizada;
  } catch (error) {
    console.log("Erro ao atualizar mensagem:", error);
    throw new Error("Erro ao atualizar mensagem: " + error.message);
  }
};

// Função para deletar uma mensagem
const deletaMensagem = async (idMensagem) => {
  try {
    const mensagemDeletada = await mensagemRepository.deletaMensagem(idMensagem);
    
    if (!mensagemDeletada) {
      throw new Error("Mensagem não encontrada");
    }
    
    return { message: "Mensagem deletada com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar mensagem:", error);
    throw new Error("Erro ao deletar mensagem: " + error.message);
  }
};

module.exports = {
  retornaTodasMensagens,
  retornaMensagemPorId,
  criaMensagem,
  atualizaMensagem,
  deletaMensagem,
};