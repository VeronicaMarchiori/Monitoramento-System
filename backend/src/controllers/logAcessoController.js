const express = require('express');
const logAcessoService = require('../service/logAcessoService');

const logAcessoRouter = express.Router();

// GET /logs-acesso - Listar todos os logs de acesso
logAcessoRouter.get('/', async (req, res) => {
  try {
    const { usuarioId, sucesso } = req.query;
    const logs = await logAcessoService.retornaTodosLogsAcesso(usuarioId, sucesso);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /logs-acesso/:id - Buscar log de acesso por ID
logAcessoRouter.get('/:id', async (req, res) => {
  try {
    const log = await logAcessoService.retornaLogAcessoPorId(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log de acesso não encontrado' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /logs-acesso - Criar novo log de acesso
logAcessoRouter.post('/', async (req, res) => {
  try {
    const log = await logAcessoService.criaLogAcesso(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /logs-acesso/:id - Deletar log de acesso
logAcessoRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await logAcessoService.deletaLogAcesso(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Log de acesso não encontrado' });
    }
    res.json({ success: true, message: 'Log de acesso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /logs-acesso/limpar - Limpar logs antigos (>90 dias)
logAcessoRouter.post('/limpar', async (req, res) => {
  try {
    const deleted = await logAcessoService.limparLogsAntigos();
    res.json({ 
      success: true, 
      message: `${deleted} logs antigos foram removidos com sucesso` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = logAcessoRouter;
