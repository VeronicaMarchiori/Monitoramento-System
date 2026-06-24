const logAcessoRepository = require("../repositories/logAcessoRepositories");

// Função para retornar todos os logs de acesso
const retornaTodosLogsAcesso = async (usuarioId = null, sucesso = null) => {
  try {
    return await logAcessoRepository.obterTodosLogsAcesso(usuarioId, sucesso);
  } catch (error) {
    console.log("Erro ao buscar logs de acesso:", error);
    throw new Error("Erro ao buscar logs de acesso: " + error.message);
  }
};

// Função para retornar log de acesso por ID
const retornaLogAcessoPorId = async (idLogA) => {
  try {
    const logAcesso = await logAcessoRepository.obterLogAcessoPorId(idLogA);
    
    if (!logAcesso) {
      throw new Error("Log de acesso não encontrado");
    }
    
    return logAcesso;
  } catch (error) {
    console.log("Erro ao buscar log de acesso:", error);
    throw new Error("Erro ao buscar log de acesso: " + error.message);
  }
};

// Função para criar um log de acesso
const criaLogAcesso = async (logData) => {
  try {
    return await logAcessoRepository.criaLogAcesso(logData);
  } catch (error) {
    console.log("Erro ao criar log de acesso:", error);
    throw new Error("Erro ao criar log de acesso: " + error.message);
  }
};

// Função para deletar um log de acesso
const deletaLogAcesso = async (idLogA) => {
  try {
    const logAcessoDeletado = await logAcessoRepository.deletaLogAcesso(idLogA);
    
    if (!logAcessoDeletado) {
      throw new Error("Log de acesso não encontrado");
    }
    
    return { message: "Log de acesso deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar log de acesso:", error);
    throw new Error("Erro ao deletar log de acesso: " + error.message);
  }
};

// Função para limpar logs antigos
const limparLogsAntigos = async () => {
  try {
    const logsLimpos = await logAcessoRepository.limparLogsAntigos();
    return { 
      message: "Logs antigos limpos com sucesso",
      quantidade: logsLimpos 
    };
  } catch (error) {
    console.log("Erro ao limpar logs antigos:", error);
    throw new Error("Erro ao limpar logs antigos: " + error.message);
  }
};

module.exports = {
  retornaTodosLogsAcesso,
  retornaLogAcessoPorId,
  criaLogAcesso,
  deletaLogAcesso,
  limparLogsAntigos,
};