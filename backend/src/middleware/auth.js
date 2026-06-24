const jwt = require("jsonwebtoken");

/**
 * MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO
 * - Validar tokens JWT nas requisições, proteger rotas autenticadas e 
 * controlar acesso por tipo de usuário
 */

/**
 * Middleware de Autenticação
 * Valida o token JWT e adiciona dados do usuário em req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token não fornecido. Acesso negado.",
      });
    }

    const secret = process.env.JWT_SECRET || "secret_vigilancia_2024";
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
      nivelAcesso: decoded.nivelAcesso,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado.",
    });
  }
};

/**
 * Middleware para rotas exclusivas de Administrador
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.tipo !== "administrador") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas administradores.",
    });
  }
  next();
};

/**
 * Middleware para rotas exclusivas de Vigia
 */
const vigiaOnly = (req, res, next) => {
  if (!req.user || req.user.tipo !== "vigia") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas vigias.",
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
  vigiaOnly,
};
