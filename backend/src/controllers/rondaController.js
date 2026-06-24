const express = require('express');
const rondaService = require('../service/rondaService');

const rondaRouter = express.Router();

// GET /rondas - Listar todas as rondas
rondaRouter.get('/', async (req, res) => {
  try {
    const rondas = await rondaService.retornaTodasRondas();
    res.json({ success: true, data: rondas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /rondas/:id - Buscar ronda por ID
rondaRouter.get('/:id', async (req, res) => {
  try {
    const ronda = await rondaService.retornaRondaPorId(req.params.id);
    if (!ronda) {
      return res.status(404).json({ success: false, message: 'Ronda não encontrada' });
    }
    res.json({ success: true, data: ronda });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /rondas - Criar nova ronda
rondaRouter.post('/', async (req, res) => {
  try {
    const ronda = await rondaService.criaRonda(req.body);
    res.status(201).json({ success: true, data: ronda });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /rondas/:id - Atualizar ronda
rondaRouter.put('/:id', async (req, res) => {
  try {
    const ronda = await rondaService.atualizaRonda(req.params.id, req.body);
    if (!ronda) {
      return res.status(404).json({ success: false, message: 'Ronda não encontrada' });
    }
    res.json({ success: true, data: ronda });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /rondas/:id - Deletar ronda
rondaRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await rondaService.deletaRonda(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ronda não encontrada' });
    }
    res.json({ success: true, message: 'Ronda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /rondas/:id/pontos - Adicionar ponto à ronda
rondaRouter.post('/:id/pontos', async (req, res) => {
  try {
    const { idPonto } = req.body;
    const success = await rondaService.adicionaPontoRonda(req.params.id, idPonto);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Ronda ou ponto não encontrado' });
    }
    res.json({ success: true, message: 'Ponto adicionado à ronda com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /rondas/:id/pontos/:idPonto - Remover ponto da ronda
rondaRouter.delete('/:id/pontos/:idPonto', async (req, res) => {
  try {
    const success = await rondaService.removePontoRonda(req.params.id, req.params.idPonto);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Ronda ou ponto não encontrado' });
    }
    res.json({ success: true, message: 'Ponto removido da ronda com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = rondaRouter;
