const model = require("../models");

// Função para obter todos os usuários
const obterTodosUsuarios = async () => {
  return await model.Usuario.findAll({
    attributes: { exclude: ["senha"] },
    include: [
      {
        model: model.Administrador,
        required: false,
      },
      {
        model: model.Vigia,
        required: false,
      },
    ],
    order: [["nome", "ASC"]],
  });
};

// Função para obter usuário por ID
const obterUsuarioPorId = async (idUsuario) => {
  return await model.Usuario.findByPk(idUsuario, {
    attributes: { exclude: ["senha"] },
    include: [
      {
        model: model.Administrador,
        required: false,
      },
      {
        model: model.Vigia,
        required: false,
      },
    ],
  });
};

// Função para obter usuário por email
const obterUsuarioPorEmail = async (email) => {
  return await model.Usuario.findOne({
    where: { email: email },
    include: [
      {
        model: model.Administrador,
        required: false,
      },
      {
        model: model.Vigia,
        required: false,
      },
    ],
  });
};

// Função para criar um novo usuário
const criaUsuario = async (usuarioData) => {
  const novoUsuario = await model.Usuario.create(usuarioData);
  return novoUsuario;
};

// Função para criar um novo administrador
const criaAdministrador = async (adminData) => {
  const novoAdministrador = await model.Administrador.create(adminData);
  return novoAdministrador;
};

// Função para criar um novo vigia
const criaVigia = async (vigiaData) => {
  const novoVigia = await model.Vigia.create(vigiaData);
  return novoVigia;
};

// Função para atualizar um usuário
const atualizaUsuario = async (idUsuario, usuarioData) => {
  try {
    const [rowsUpdated] = await model.Usuario.update(usuarioData, {
      where: { idUsuario: idUsuario },
    });

    if (rowsUpdated === 0) return null; // Nenhum usuário encontrado

    return await obterUsuarioPorId(idUsuario);
  } catch (error) {
    throw error;
  }
};


// Função para atualizar um administrador
const atualizaAdministrador = async (adminData) => {
  try {
    await model.Administrador.update(adminData, {
      where: { idUsuario: adminData.idUsuario },
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Função para atualizar um vigia
const atualizaVigia = async (vigiaData) => {
  try {
    await model.Vigia.update(vigiaData, {
      where: { idUsuario: vigiaData.idUsuario },
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Função para deletar um usuário
const deletaUsuario = async (idUsuario) => {
  // Verifica se existe
  const usuario = await obterUsuarioPorId(idUsuario);
  if (!usuario) return null;

  // Deleta
  const deleted = await model.Usuario.destroy({
    where: { idUsuario: idUsuario },
  });

  return deleted > 0 ? usuario : null;
};


// Função para obter todos os vigias
const obterTodosVigias = async () => {
  return await model.Vigia.findAll({
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
  });
};

// Função para obter todos os administradores
const obterTodosAdministradores = async () => {
  return await model.Administrador.findAll({
    include: [
      {
        model: model.Usuario,
        attributes: { exclude: ["senha"] },
      },
    ],
  });
};

module.exports = {
  obterTodosUsuarios,
  obterUsuarioPorId,
  obterUsuarioPorEmail,
  criaUsuario,
  criaAdministrador,
  criaVigia,
  atualizaUsuario,
  atualizaAdministrador,
  atualizaVigia,
  deletaUsuario,
  obterTodosVigias,
  obterTodosAdministradores,
};
