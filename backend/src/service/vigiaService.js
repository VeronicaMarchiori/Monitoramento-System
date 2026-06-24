const vigiaRepository = require("../repositories/vigiaRepositories");
const usuarioRepository = require("../repositories/usuarioRepositories");
const bcrypt = require("bcryptjs");

// Função para retornar todos os vigias
const retornaTodosVigias = async () => {
  try {
    return await vigiaRepository.obterTodosVigias();
  } catch (error) {
    console.log("Erro ao buscar vigias:", error);
    throw new Error("Erro ao buscar vigias: " + error.message);
  }
};

// Função para retornar vigia por ID
const retornaVigiaPorId = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }
    
    return vigia;
  } catch (error) {
    console.log("Erro ao buscar vigia:", error);
    throw new Error("Erro ao buscar vigia: " + error.message);
  }
};

// Função para retornar vigias ativos
const retornaVigiasAtivos = async () => {
  try {
    return await vigiaRepository.obterVigiasAtivos();
  } catch (error) {
    console.log("Erro ao buscar vigias ativos:", error);
    throw new Error("Erro ao buscar vigias ativos: " + error.message);
  }
};

// Função para retornar vigias em ronda
const retornaVigiasEmRonda = async () => {
  try {
    return await vigiaRepository.obterVigiasEmRonda();
  } catch (error) {
    console.log("Erro ao buscar vigias em ronda:", error);
    throw new Error("Erro ao buscar vigias em ronda: " + error.message);
  }
};

// Função para retornar vigias disponíveis (fora de ronda)
const retornaVigiasDisponiveis = async () => {
  try {
    return await vigiaRepository.obterVigiasForaDeRonda();
  } catch (error) {
    console.log("Erro ao buscar vigias disponíveis:", error);
    throw new Error("Erro ao buscar vigias disponíveis: " + error.message);
  }
};

// Função para criar um novo vigia
const criaVigia = async (vigiaData) => {
  const { nome, email, senha, telefone, cpf, dataNascimento, foto } = vigiaData;

  
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

    

    // Criar perfil de vigia
    await vigiaRepository.criaVigia({
      idUsuario: novoUsuario.idUsuario,
      foto: foto || null,
      EstaRonda: false,
    });

    // Retornar vigia completo
    return await vigiaRepository.obterVigiaPorId(novoUsuario.idUsuario);
  } catch (error) {
    console.log("Erro ao criar vigia:", error);
    throw new Error("Erro ao criar vigia: " + error.message);
  }
};

// Função para atualizar vigia
const atualizaVigia = async (idUsuario, vigiaData) => {
  const { nome, email, telefone, cpf, dataNascimento, foto, senha, status } = vigiaData;
  
  try {
    // Verifica se vigia existe
    const vigiaExistente = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigiaExistente) {
      throw new Error("Vigia não encontrado");
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

    // Atualizar dados específicos do vigia
    const dadosVigia = {};
    if (foto !== undefined) dadosVigia.foto = foto;

    if (Object.keys(dadosVigia).length > 0) {
      await vigiaRepository.atualizaVigia(idUsuario, dadosVigia);
    }

    // Retornar vigia atualizado
    return await vigiaRepository.obterVigiaPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao atualizar vigia:", error);
    throw new Error("Erro ao atualizar vigia: " + error.message);
  }
};

// Função para atualizar foto do vigia
const atualizaFotoVigia = async (idUsuario, foto) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }

    return await vigiaRepository.atualizaFotoVigia(idUsuario, foto);
  } catch (error) {
    console.log("Erro ao atualizar foto do vigia:", error);
    throw new Error("Erro ao atualizar foto do vigia: " + error.message);
  }
};

// Função para iniciar ronda de um vigia
const iniciaRondaVigia = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }

    if (vigia.Usuario && !vigia.Usuario.status) {
      throw new Error("Vigia inativo não pode iniciar ronda");
    }

    if (vigia.EstaRonda) {
      throw new Error("Vigia já está em ronda");
    }

    return await vigiaRepository.iniciaRondaVigia(idUsuario);
  } catch (error) {
    console.log("Erro ao iniciar ronda do vigia:", error);
    throw new Error("Erro ao iniciar ronda do vigia: " + error.message);
  }
};

// Função para finalizar ronda de um vigia
const finalizaRondaVigia = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }

    if (!vigia.EstaRonda) {
      throw new Error("Vigia não está em ronda");
    }

    return await vigiaRepository.finalizaRondaVigia(idUsuario);
  } catch (error) {
    console.log("Erro ao finalizar ronda do vigia:", error);
    throw new Error("Erro ao finalizar ronda do vigia: " + error.message);
  }
};

// Função para deletar vigia
const deletaVigia = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }

    // Verifica se vigia está em ronda
    if (vigia.EstaRonda) {
      throw new Error("Não é possível deletar vigia que está em ronda. Finalize a ronda primeiro.");
    }

    // Deleta vigia (cascade vai deletar usuário)
    const deletado = await vigiaRepository.deletaVigia(idUsuario);

    if (!deletado) {
      throw new Error("Erro ao deletar vigia");
    }

    // Deleta usuário
    await usuarioRepository.deletaUsuario(idUsuario);

    return { message: "Vigia deletado com sucesso" };
  } catch (error) {
    console.log("Erro ao deletar vigia:", error);
    throw new Error("Erro ao deletar vigia: " + error.message);
  }
};

// Função para inativar vigia
const inativaVigia = async (idUsuario) => {
  try {
    const vigiaExistente = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigiaExistente) {
      throw new Error("Vigia não encontrado");
    }

    await usuarioRepository.atualizaUsuario(idUsuario, { status: false });
    return await vigiaRepository.obterVigiaPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao inativar vigia:", error);
    throw new Error("Erro ao inativar vigia: " + error.message);
  }
};

// Função para ativar vigia
const ativaVigia = async (idUsuario) => {
  try {
    const vigiaExistente = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigiaExistente) {
      throw new Error("Vigia não encontrado");
    }

    await usuarioRepository.atualizaUsuario(idUsuario, { status: true });
    return await vigiaRepository.obterVigiaPorId(idUsuario);
  } catch (error) {
    console.log("Erro ao ativar vigia:", error);
    throw new Error("Erro ao ativar vigia: " + error.message);
  }
};

// Função para retornar rondas do vigia
const retornaRondasDoVigia = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    if (!vigia) {
      throw new Error("Vigia não encontrado");
    }

    return await vigiaRepository.obterRondasDoVigia(idUsuario);
  } catch (error) {
    console.log("Erro ao buscar rondas do vigia:", error);
    throw new Error("Erro ao buscar rondas do vigia: " + error.message);
  }
};

// Função para retornar estatísticas do vigia
const retornaEstatisticasVigia = async (idUsuario) => {
  try {
    const estatisticas = await vigiaRepository.obterEstatisticasVigia(idUsuario);
    
    if (!estatisticas) {
      throw new Error("Vigia não encontrado");
    }
    
    return estatisticas;
  } catch (error) {
    console.log("Erro ao buscar estatísticas do vigia:", error);
    throw new Error("Erro ao buscar estatísticas do vigia: " + error.message);
  }
};

// Função para verificar disponibilidade do vigia
const verificaDisponibilidadeVigia = async (idUsuario) => {
  try {
    const vigia = await vigiaRepository.obterVigiaPorId(idUsuario);
    
    if (!vigia) {
      return { disponivel: false, motivo: "Vigia não encontrado" };
    }

    if (!vigia.Usuario || !vigia.Usuario.status) {
      return { disponivel: false, motivo: "Vigia inativo" };
    }

    if (vigia.EstaRonda) {
      return { disponivel: false, motivo: "Vigia já está em ronda" };
    }

    return { disponivel: true, vigia: vigia };
  } catch (error) {
    console.log("Erro ao verificar disponibilidade do vigia:", error);
    throw new Error("Erro ao verificar disponibilidade do vigia: " + error.message);
  }
};

module.exports = {
  retornaTodosVigias,
  retornaVigiaPorId,
  retornaVigiasAtivos,
  retornaVigiasEmRonda,
  retornaVigiasDisponiveis,
  criaVigia,
  atualizaVigia,
  atualizaFotoVigia,
  iniciaRondaVigia,
  finalizaRondaVigia,
  deletaVigia,
  inativaVigia,
  ativaVigia,
  retornaRondasDoVigia,
  retornaEstatisticasVigia,
  verificaDisponibilidadeVigia,
};