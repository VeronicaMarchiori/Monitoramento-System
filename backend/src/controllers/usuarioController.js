const express = require('express');
const usuarioService = require('../service/usuarioService');

const usuarioRouter = express.Router();

// GET /usuarios - Listar todos os usuários
usuarioRouter.get('/', async (req, res) => {
  try {
    const usuarios = await usuarioService.retornaTodosUsuarios();
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /usuarios/vigias - Listar todos os vigias
usuarioRouter.get('/vigias', async (req, res) => {
  try {
    const vigias = await usuarioService.retornaTodosVigias();
    res.json({ success: true, data: vigias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /usuarios/administradores - Listar todos os administradores
usuarioRouter.get('/administradores', async (req, res) => {
  try {
    const admins = await usuarioService.retornaTodosAdministradores();
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /usuarios/:id - Buscar usuário por ID
usuarioRouter.get('/:id', async (req, res) => {
  try {
    const usuario = await usuarioService.retornaUsuarioPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /usuarios - Criar novo usuário
usuarioRouter.post('/', async (req, res) => {
  try {
    // Validar campos obrigatórios
    const { nome, email, cpf, telefone, senha, tipo } = req.body;

    if (!nome || !email || !cpf || !telefone || !senha || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: nome, email, cpf, telefone, senha e tipo',
      });
    }

    // Validar tipo de usuário
    if (tipo !== 'administrador' && tipo !== 'vigia') {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário inválido. Use "administrador" ou "vigia"',
      });
    }

    // Verificar se email já existe
    const usuarioExistente = await usuarioService.retornaUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado no sistema',
      });
    }

    const usuario = await usuarioService.criaUsuario(req.body);
    res.status(201).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /usuarios/:id - Atualizar usuário
usuarioRouter.put('/:id', async (req, res) => {
  try {
    const usuario = await usuarioService.atualizaUsuario(req.params.id, req.body);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /usuarios/:id - Deletar usuário 
usuarioRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await usuarioService.deletaUsuario(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = usuarioRouter;