const express = require('express');
const mensagemService = require('../service/mensagemService');

const mensagemRouter = express.Router();

// POST /mensagem - Criar nova mensagem
mensagemRouter.post('/', async (req, res) => {
  try {
    const mensagem = await mensagemService.criaMensagem(req.body);
    res.status(201).json({ success: true, data: mensagem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /mensagem - Retornar todas as mensagens
mensagemRouter.get('/', async (req, res) => {
  try {
    const { rondaId } = req.query;
    const mensagens = await mensagemService.retornaTodasMensagens(rondaId);
    res.json({ success: true, data: mensagens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /mensagem/:id - Retornar mensagem por ID
mensagemRouter.get('/:id', async (req, res) => {
  try {
    const mensagem = await mensagemService.retornaMensagemPorId(req.params.id);
    if (!mensagem) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }
    res.json({ success: true, data: mensagem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /mensagem/ronda/:id_ronda - Retornar todas as mensagem de um ronda
mensagemRouter.get('/ronda/:id_ronda', async (req, res) => {
  try {
    const mensagens = await mensagemService.retornaMensagemPorRonda(req.params.id_ronda);
    res.json({ success: true, data: mensagens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /mensagem/usuario/:id_usuario - Retornar todas as mensagem de um usuario
mensagemRouter.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const mensagens = await mensagemService.retornaMensagemPorUsuario(req.params.id_usuario);
    res.json({ success: true, data: mensagens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /mensagem/:id - Atualizar mensagem
mensagemRouter.put('/:id', async (req, res) => {
  try {
    const mensagem = await mensagemService.atualizaMensagem(req.params.id, req.body);
    if (!mensagem) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }
    res.json({ success: true, data: mensagem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /mensagem/:id - Deletar mensagem
mensagemRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await mensagemService.deletaMensagem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }
    res.json({ success: true, message: 'Mensagem deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = mensagemRouter;
