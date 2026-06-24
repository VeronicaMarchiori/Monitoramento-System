// EXEMPLO: pontoRondaController.js corrigido
const express = require('express');
const pontoRondaService = require('../service/pontoRondaService');

const pontoRondaRouter = express.Router();

// GET /pontos-ronda
pontoRondaRouter.get('/', async (req, res) => {
  try {
    const pontos = await pontoRondaService.retornaTodosPontosRonda();
    res.json({ success: true, data: pontos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /pontos-ronda/:id
pontoRondaRouter.get('/:id', async (req, res) => {
  try {
    const ponto = await pontoRondaService.retornaPontoRondaPorId(parseInt(req.params.id));
    res.json({ success: true, data: ponto });
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// POST /pontos-ronda
pontoRondaRouter.post('/', async (req, res) => {
  try {
    const ponto = await pontoRondaService.criaPontoRonda(req.body);
    res.status(201).json({ success: true, data: ponto });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /pontos-ronda/:id - Atualizar ponto de ronda
pontoRondaRouter.put('/:id', async (req, res) => {
  try {
    const ponto = await pontoRondaService.atualizaPontoRonda(req.params.id, req.body);
    if (!ponto) {
      return res.status(404).json({ success: false, message: 'Ponto de ronda não encontrado' });
    }
    res.json({ success: true, data: ponto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /pontos-ronda/:id - Deletar ponto de ronda
pontoRondaRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await pontoRondaService.deletaPontoRonda(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ponto de ronda não encontrado' });
    }
    res.json({ success: true, message: 'Ponto de ronda deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = pontoRondaRouter;
