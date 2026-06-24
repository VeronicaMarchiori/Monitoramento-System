const usuarioRepository = require("../repositories/usuarioRepositories");
const bcrypt = require("bcryptjs");

// Função para retornar todos os usuários (SEM req, res)
const retornaTodosUsuarios = async () => {
  try {
    return await usuarioRepository.obterTodosUsuarios();
  } catch (error) {
    console.log("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários: " + error.message);
  }
};

// Função para retornar usuário por ID (SEM req, res)
const retornaUsuarioPorId = async (idUsuario) => {
  try {
    const usuario = await usuarioRepository.obterUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    return usuario;
  } catch (error) {
    console.log("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário: " + error.message);
  }
};

// Função para retornar usuário por email (SEM req, res)
const retornaUsuarioPorEmail = async (email) => {
  try {
    const usuario = await usuarioRepository.obterUsuarioPorEmail(email);
    return usuario; // pode retornar null se não encontrar
  } catch (error) {
    console.log("Erro ao buscar usuário por email:", error);
    throw new Error("Erro ao buscar usuário por email: " + error.message);
  }
};

// Função para criar um usuário (SEM req, res)
const criaUsuario = async (usuarioData) => {
  try {
    // Hash da senha
    if (usuarioData.senha) {
      usuarioData.senha = await bcrypt.hash(usuarioData.senha, 10);
    }
    
    // Criar usuário base
    const usuario = await usuarioRepository.criaUsuario(usuarioData);
    
    // Criar perfil específico
    if (usuarioData.tipo === "administrador") {
      await usuarioRepository.criaAdministrador({
        idUsuario: usuario.idUsuario,
        nivelAcesso: usuarioData.nivelAcesso || "padrao",
      });
    } else if (usuarioData.tipo === "vigia") {
      await usuarioRepository.criaVigia({
        idUsuario: usuario.idUsuario,
        foto: usuarioData.foto || null,
        EstaRonda: false,
      });
    }
    
    return await usuarioRepository.obterUsuarioPorId(usuario.idUsuario);
  } catch (error) {
    console.log("Erro ao criar usuário:", error);
    throw new Error("Erro ao criar usuário: " + error.message);
  }
};

// Função para atualizar um usuário (SEM req, res)
const atualizaUsuario = async (idUsuario, usuarioData) => {
  try {
    // Hash da senha se for atualizada
    if (usuarioData.senha) {
      usuarioData.senha = await bcrypt.hash(usuarioData.senha, 10);
    }
    
    // Atualizar usuário base
    const usuario = await usuarioRepository.atualizaUsuario(idUsuario, usuarioData);
    
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    
    // Atualizar perfil específico se fornecido
    if (usuarioData.nivelAcesso) {
      await usuarioRepository.atualizaAdministrador(idUsuario, {
        nivelAcesso: usuarioData.nivelAcesso,
      });
    }
    
    if (usuarioData.foto !== undefined || usuarioData.EstaRonda !== undefined) {
      const vigiaData = {};
      if (usuarioData.foto !== undefined) vigiaData.foto = usuarioData.foto;
      if (usuarioData.EstaRonda !== undefined) vigiaData.EstaRonda = usuarioData.EstaRonda;
      
      await usuarioRepository.atualizaVigia(idUsuario, vigiaData);
    }
    
    return await usuarioRepository.obterUsuarioPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário: " + error.message);
  }
};

// Função para deletar um usuário (SEM req, res)
const deletaUsuario = async (idUsuario) => {
  try {
    const usuarioDeletado = await usuarioRepository.deletaUsuario(idUsuario);
    
    if (!usuarioDeletado) {
      throw new Error("Usuário não encontrado");
    }
    
    return { message: "Usuário deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar usuário:", error);
    throw new Error("Erro ao deletar usuário: " + error.message);
  }
};

// Função para retornar todos os vigias (SEM req, res)
const retornaTodosVigias = async () => {
  try {
    return await usuarioRepository.obterTodosVigias();
  } catch (error) {
    console.log("Erro ao buscar vigias:", error);
    throw new Error("Erro ao buscar vigias: " + error.message);
  }
};

// Função para retornar todos os administradores (SEM req, res)
const retornaTodosAdministradores = async () => {
  try {
    return await usuarioRepository.obterTodosAdministradores();
  } catch (error) {
    console.log("Erro ao buscar administradores:", error);
    throw new Error("Erro ao buscar administradores: " + error.message);
  }
};

// Função para verificar senha (SEM req, res)
const verificaSenha = async (senhaPlana, senhaHash) => {
  try {
    return await bcrypt.compare(senhaPlana, senhaHash);
  } catch (error) {
    console.log("Erro ao verificar senha:", error);
    throw new Error("Erro ao verificar senha: " + error.message);
  }
};

module.exports = {
  retornaTodosUsuarios,
  retornaUsuarioPorId,
  retornaUsuarioPorEmail,
  criaUsuario,
  atualizaUsuario,
  deletaUsuario,
  retornaTodosVigias,
  retornaTodosAdministradores,
  verificaSenha,
};