const express = require('express');
const usuarioService  = require('../service/usuarioService');
const logAcessoService = require('../service/logAcessoService');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();

// POST /auth/login - Fazer login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário por email
    const usuario = await usuarioService.retornaUsuarioPorEmail(email);

    if (!usuario) {
      // Registrar tentativa falha
      await logAcessoService.criaLogAcesso({
        sucesso: false,
        ip: req.ip,
        fk_Usuario_idUsuario: null,
      });

      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Verificar senha
    const senhaValida = await usuarioService.verificaSenha(password, usuario.senha);

    if (!senhaValida) {
      // Registrar tentativa falha
      await logAcessoService.criaLogAcesso({
        sucesso: false,
        ip: req.ip,
        fk_Usuario_idUsuario: usuario.idUsuario,
      });

      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Registrar login bem-sucedido
    await logAcessoService.criaLogAcesso({
      sucesso: true,
      ip: req.ip,
      fk_Usuario_idUsuario: usuario.idUsuario,
    });

    // Determinar tipo de usuário
    let tipo = 'usuario';
    if (usuario.Administrador) {
      tipo = 'administrador';
    } else if (usuario.Vigia) {
      tipo = 'vigia';
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nome: usuario.nome,
      },
      process.env.JWT_SECRET || 'secret_vigilancia_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          idUsuario: usuario.idUsuario,
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          telefone: usuario.telefone,
          tipo,
          nivelAcesso: usuario.Administrador?.nivelAcesso,
          foto: usuario.Vigia?.foto,
          EstaRonda: usuario.Vigia?.EstaRonda,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    });
  }
});

// POST /auth/logout - Fazer logout
authRouter.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

// GET /auth/me - Retornar usuário autenticado
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_vigilancia_2024');

    const usuario = await usuarioService.retornaUsuarioPorId(decoded.idUsuario);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    let tipo = 'usuario';
    if (usuario.Administrador) {
      tipo = 'administrador';
    } else if (usuario.Vigia) {
      tipo = 'vigia';
    }

    res.json({
      success: true,
      data: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        tipo,
        nivelAcesso: usuario.Administrador?.nivelAcesso,
        foto: usuario.Vigia?.foto,
        EstaRonda: usuario.Vigia?.EstaRonda,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }
});

module.exports = authRouter;
