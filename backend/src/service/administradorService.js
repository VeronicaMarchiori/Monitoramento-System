const administradorRepository = require("../repositories/administradorRepositories");
const usuarioRepository = require("../repositories/usuarioRepositories");
const bcrypt = require("bcryptjs");

// Função para retornar todos os administradores
const retornaTodosAdministradores = async () => {
  try {
    return await administradorRepository.obterTodosAdministradores();
  } catch (error) {
    console.log("Erro ao buscar administradores:", error);
    throw new Error("Erro ao buscar administradores: " + error.message);
  }
};

// Função para retornar administrador por ID
const retornaAdministradorPorId = async (idUsuario) => {
  try {
    const administrador = await administradorRepository.obterAdministradorPorId(idUsuario);
    
    if (!administrador) {
      throw new Error("Administrador não encontrado");
    }
    
    return administrador;
  } catch (error) {
    console.log("Erro ao buscar administrador:", error);
    throw new Error("Erro ao buscar administrador: " + error.message);
  }
};

// Função para retornar administradores ativos
const retornaAdministradoresAtivos = async () => {
  try {
    return await administradorRepository.obterAdministradoresAtivos();
  } catch (error) {
    console.log("Erro ao buscar administradores ativos:", error);
    throw new Error("Erro ao buscar administradores ativos: " + error.message);
  }
};

// Função para retornar administradores por nível de acesso
const retornaAdministradoresPorNivel = async (nivel) => {
  const niveisValidos = ["padrao", "supervisor", "master"];
  
  try {
    if (!niveisValidos.includes(nivel)) {
      throw new Error("Nível de acesso inválido. Use: padrao, supervisor ou master");
    }

    return await administradorRepository.obterAdministradoresPorNivel(nivel);
  } catch (error) {
    console.log("Erro ao buscar administradores por nível:", error);
    throw new Error("Erro ao buscar administradores por nível: " + error.message);
  }
};

// Função para criar um novo administrador
const criaAdministrador = async (adminData) => {
  const { nome, email, senha, telefone, cpf, dataNascimento, nivelAcesso } = adminData;
  
  try {
    // Validações
    if (!nome || !email || !senha) {
      throw new Error("Nome, email e senha são obrigatórios");
    }

    // Verifica se email já existe
    const usuarioExistente = await usuarioRepository.obterUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw new Error("Email já cadastrado no sistema");
    }

    // Valida nível de acesso
    const niveisValidos = ["padrao", "supervisor", "master"];
    const nivelFinal = nivelAcesso && niveisValidos.includes(nivelAcesso) 
      ? nivelAcesso 
      : "padrao";

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário base
    const novoUsuario = await usuarioRepository.criaUsuario({
      nome,
      email,
      senha: senhaHash,
      telefone: telefone || null,
      cpf: cpf || null,
      dataNascimento: dataNascimento || null,
      ativo: true, 
    });

    // Criar perfil de administrador
    await administradorRepository.criaAdministrador({
      idUsuario: novoUsuario.idUsuario,
      nivelAcesso: nivelFinal,
    });

    // Retornar administrador completo
    return await administradorRepository.obterAdministradorPorId(novoUsuario.idUsuario);
  } catch (error) {
    console.log("Erro ao criar administrador:", error);
    throw new Error("Erro ao criar administrador: " + error.message);
  }
};

// Função para atualizar administrador
const atualizaAdministrador = async (idUsuario, adminData) => {
  const { nome, email, telefone, cpf, dataNascimento, nivelAcesso, senha, status } = adminData;
  
  try {
    // Verifica se administrador existe
    const adminExistente = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!adminExistente) {
      throw new Error("Administrador não encontrado");
    }

    // Atualizar dados do usuário se fornecidos
    const dadosUsuario = {};
    if (nome) dadosUsuario.nome = nome;
    if (email) {
      // Verifica se email já está em uso por outro usuário
      const usuarioComEmail = await usuarioRepository.obterUsuarioPorEmail(email);
      if (usuarioComEmail && usuarioComEmail.idUsuario !== idUsuario) {
        throw new Error("Email já está em uso por outro usuário");
      }
      dadosUsuario.email = email;
    }
    if (telefone !== undefined) dadosUsuario.telefone = telefone;
    if (cpf !== undefined) dadosUsuario.cpf = cpf;
    if (dataNascimento !== undefined) dadosUsuario.dataNascimento = dataNascimento;
    if (status !== undefined) dadosUsuario.status = status;
    if (senha) {
      dadosUsuario.senha = await bcrypt.hash(senha, 10);
    }

    if (Object.keys(dadosUsuario).length > 0) {
      await usuarioRepository.atualizaUsuario(idUsuario, dadosUsuario);
    }

    // Atualizar dados específicos do administrador
    if (nivelAcesso) {
      const niveisValidos = ["padrao", "supervisor", "master"];
      if (!niveisValidos.includes(nivelAcesso)) {
        throw new Error("Nível de acesso inválido. Use: padrao, supervisor ou master");
      }

      await administradorRepository.atualizaNivelAcesso(idUsuario, nivelAcesso);
    }

    // Retornar administrador atualizado
    return await administradorRepository.obterAdministradorPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao atualizar administrador:", error);
    throw new Error("Erro ao atualizar administrador: " + error.message);
  }
};

// Função para atualizar nível de acesso
const atualizaNivelAcesso = async (idUsuario, nivelAcesso) => {
  const niveisValidos = ["padrao", "supervisor", "master"];
  
  try {
    if (!niveisValidos.includes(nivelAcesso)) {
      throw new Error("Nível de acesso inválido. Use: padrao, supervisor ou master");
    }

    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!admin) {
      throw new Error("Administrador não encontrado");
    }

    return await administradorRepository.atualizaNivelAcesso(idUsuario, nivelAcesso);
  } catch (error) {
    console.log("Erro ao atualizar nível de acesso:", error);
    throw new Error("Erro ao atualizar nível de acesso: " + error.message);
  }
};

// Função para deletar administrador
const deletaAdministrador = async (idUsuario) => {
  try {
    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!admin) {
      throw new Error("Administrador não encontrado");
    }

    // Verifica se é o último administrador master
    if (admin.nivelAcesso === "master") {
      const adminsMaster = await administradorRepository.obterAdministradoresPorNivel("master");
      if (adminsMaster.length === 1) {
        throw new Error("Não é possível deletar o último administrador master do sistema");
      }
    }

    // Deleta administrador (cascade vai deletar usuário)
    const deletado = await administradorRepository.deletaAdministrador(idUsuario);

    if (!deletado) {
      throw new Error("Erro ao deletar administrador");
    }

    // Deleta usuário
    await usuarioRepository.deletaUsuario(idUsuario);

    return { message: "Administrador deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar administrador:", error);
    throw new Error("Erro ao deletar administrador: " + error.message);
  }
};

// Função para inativar administrador
const inativaAdministrador = async (idUsuario) => {
  try {
    const adminExistente = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!adminExistente) {
      throw new Error("Administrador não encontrado");
    }

    await usuarioRepository.atualizaUsuario(idUsuario, { status: false });
    return await administradorRepository.obterAdministradorPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao inativar administrador:", error);
    throw new Error("Erro ao inativar administrador: " + error.message);
  }
};

// Função para ativar administrador
const ativaAdministrador = async (idUsuario) => {
  try {
    const adminExistente = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!adminExistente) {
      throw new Error("Administrador não encontrado");
    }

    await usuarioRepository.atualizaUsuario(idUsuario, { status: true });
    return await administradorRepository.obterAdministradorPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao ativar administrador:", error);
    throw new Error("Erro ao ativar administrador: " + error.message);
  }
};

// Função para retornar rondas criadas pelo administrador
const retornaRondasDoAdministrador = async (idUsuario) => {
  try {
    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!admin) {
      throw new Error("Administrador não encontrado");
    }

    return await administradorRepository.obterRondasDoAdministrador(idUsuario);
  } catch (error) {
    console.log("Erro ao buscar rondas do administrador:", error);
    throw new Error("Erro ao buscar rondas do administrador: " + error.message);
  }
};

// Função para retornar estatísticas do administrador
const retornaEstatisticasAdministrador = async (idUsuario) => {
  try {
    const estatisticas = await administradorRepository.obterEstatisticasAdministrador(idUsuario);
    
    if (!estatisticas) {
      throw new Error("Administrador não encontrado");
    }
    
    return estatisticas;
  } catch (error) {
    console.log("Erro ao buscar estatísticas do administrador:", error);
    throw new Error("Erro ao buscar estatísticas do administrador: " + error.message);
  }
};

// Função para verificar se é administrador master
const verificaAdministradorMaster = async (idUsuario) => {
  try {
    const isMaster = await administradorRepository.isAdministradorMaster(idUsuario);
    return isMaster;
  } catch (error) {
    console.log("Erro ao verificar administrador master:", error);
    throw new Error("Erro ao verificar administrador master: " + error.message);
  }
};

// Função para retornar dashboard do administrador
const retornaDashboardAdministrador = async (idUsuario) => {
  try {
    const dashboard = await administradorRepository.obterDashboardAdministrador(idUsuario);
    
    if (!dashboard) {
      throw new Error("Administrador não encontrado");
    }
    
    return dashboard;
  } catch (error) {
    console.log("Erro ao buscar dashboard do administrador:", error);
    throw new Error("Erro ao buscar dashboard do administrador: " + error.message);
  }
};

// Função para promover administrador para nível superior
const promoveAdministrador = async (idUsuario) => {
  try {
    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!admin) {
      throw new Error("Administrador não encontrado");
    }

    let novoNivel;
    switch (admin.nivelAcesso) {
      case "padrao":
        novoNivel = "supervisor";
        break;
      case "supervisor":
        novoNivel = "master";
        break;
      case "master":
        throw new Error("Administrador já está no nível máximo");
      default:
        throw new Error("Nível de acesso inválido");
    }

    return await administradorRepository.atualizaNivelAcesso(idUsuario, novoNivel);
  } catch (error) {
    console.log("Erro ao promover administrador:", error);
    throw new Error("Erro ao promover administrador: " + error.message);
  }
};

// Função para rebaixar administrador para nível inferior
const rebaixaAdministrador = async (idUsuario) => {
  try {
    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    if (!admin) {
      throw new Error("Administrador não encontrado");
    }

    // Verifica se é o último master
    if (admin.nivelAcesso === "master") {
      const adminsMaster = await administradorRepository.obterAdministradoresPorNivel("master");
      if (adminsMaster.length === 1) {
        throw new Error("Não é possível rebaixar o último administrador master do sistema");
      }
    }

    let novoNivel;
    switch (admin.nivelAcesso) {
      case "master":
        novoNivel = "supervisor";
        break;
      case "supervisor":
        novoNivel = "padrao";
        break;
      case "padrao":
        throw new Error("Administrador já está no nível mínimo");
      default:
        throw new Error("Nível de acesso inválido");
    }

    return await administradorRepository.atualizaNivelAcesso(idUsuario, novoNivel);
  } catch (error) {
    console.log("Erro ao rebaixar administrador:", error);
    throw new Error("Erro ao rebaixar administrador: " + error.message);
  }
};

// Função para validar permissões do administrador
const validaPermissoesAdministrador = async (idUsuario, acaoRequerida) => {
  try {
    const admin = await administradorRepository.obterAdministradorPorId(idUsuario);
    
    if (!admin) {
      return { 
        permitido: false, 
        motivo: "Administrador não encontrado" 
      };
    }

    if (!admin.Usuario || !admin.Usuario.status) {
      return { 
        permitido: false, 
        motivo: "Administrador inativo" 
      };
    }

    // Define permissões por nível
    const permissoes = {
      padrao: ["visualizar", "criar_ronda", "editar_ronda"],
      supervisor: ["visualizar", "criar_ronda", "editar_ronda", "gerenciar_vigias", "visualizar_relatorios"],
      master: ["todas"], // Master tem todas as permissões
    };

    const permissoesNivel = permissoes[admin.nivelAcesso] || [];

    if (permissoesNivel.includes("todas") || permissoesNivel.includes(acaoRequerida)) {
      return { permitido: true, nivel: admin.nivelAcesso };
    }

    return { 
      permitido: false, 
      motivo: `Nível ${admin.nivelAcesso} não tem permissão para: ${acaoRequerida}` 
    };
  } catch (error) {
    console.log("Erro ao validar permissões do administrador:", error);
    throw new Error("Erro ao validar permissões do administrador: " + error.message);
  }
};

module.exports = {
  retornaTodosAdministradores,
  retornaAdministradorPorId,
  retornaAdministradoresAtivos,
  retornaAdministradoresPorNivel,
  criaAdministrador,
  atualizaAdministrador,
  atualizaNivelAcesso,
  deletaAdministrador,
  inativaAdministrador,
  ativaAdministrador,
  retornaRondasDoAdministrador,
  retornaEstatisticasAdministrador,
  verificaAdministradorMaster,
  retornaDashboardAdministrador,
  promoveAdministrador,
  rebaixaAdministrador,
  validaPermissoesAdministrador,
};