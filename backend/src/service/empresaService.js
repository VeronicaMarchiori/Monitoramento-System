const empresaRepository = require("../repositories/empresaRepositories");

// Função para retornar todas as empresas
const retornaTodasEmpresas = async () => {
  try {
    return await empresaRepository.obterTodasEmpresas();
  } catch (error) {
    console.log("Erro ao buscar empresas:", error);
    throw new Error("Erro ao buscar empresas: " + error.message);
  }
};

// Função para buscar empresa por ID
const retornaEmpresaPorId = async (idEmpresa) => {
  try {
    const empresa = await empresaRepository.obterEmpresaPorId(idEmpresa);
    
    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }
    
    return empresa;
  } catch (error) {
    console.log("Erro ao buscar empresa:", error);
    throw new Error("Erro ao buscar empresa: " + error.message);
  }
};

// Função para criar uma empresa
const criaEmpresa = async (empresaData) => {
  try {
    return await empresaRepository.criaEmpresa(empresaData);
  } catch (error) {
    console.log("Erro ao criar empresa:", error);
    throw new Error("Erro ao criar empresa: " + error.message);
  }
};

// Função para atualizar uma empresa
const atualizaEmpresa = async (idEmpresa, empresaData) => {
  try {
    const empresaAtualizada = await empresaRepository.atualizaEmpresa(idEmpresa, empresaData);
    
    if (!empresaAtualizada) {
      throw new Error("Empresa não encontrada");
    }
    
    return empresaAtualizada;
  } catch (error) {
    console.log("Erro ao atualizar empresa:", error);
    throw new Error("Erro ao atualizar empresa: " + error.message);
  }
};

// Função para deletar uma empresa
const deletaEmpresa = async (idEmpresa) => {
  try {
    const empresaDeletada = await empresaRepository.deletaEmpresa(idEmpresa);
    
    if (!empresaDeletada) {
      throw new Error("Empresa não encontrada");
    }
    
    return { message: "Empresa deletada com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar empresa:", error);
    throw new Error("Erro ao deletar empresa: " + error.message);
  }
};

module.exports = {
  retornaTodasEmpresas,
  retornaEmpresaPorId,
  criaEmpresa,
  atualizaEmpresa,
  deletaEmpresa,
};