const express = require('express');
const vigiaService = require('../service/vigiaService');

const vigiaRouter = express.Router();

// GET /vigias - Retorna todos os vigias
vigiaRouter.get('/', async (req, res) => {
  try {
    const vigias = await vigiaService.retornaTodosVigias();
    return res.status(200).json({
      success: true,
      data: vigias,
      total: vigias.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vigias',
      error: error.message,
    });
  }
});

// GET /vigias/ativos - Retorna vigias ativos
vigiaRouter.get('/ativos', async (req, res) => {
  try {
    const vigias = await vigiaService.retornaVigiasAtivos();
    return res.status(200).json({
      success: true,
      data: vigias,
      total: vigias.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vigias ativos',
      error: error.message,
    });
  }
});

// GET /vigias/em-ronda - Retorna vigias em ronda
vigiaRouter.get('/em-ronda', async (req, res) => {
  try {
    const vigias = await vigiaService.retornaVigiasEmRonda();
    return res.status(200).json({
      success: true,
      data: vigias,
      total: vigias.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vigias em ronda',
      error: error.message,
    });
  }
});

// GET /vigias/disponiveis - Retorna vigias disponíveis
vigiaRouter.get('/disponiveis', async (req, res) => {
  try {
    const vigias = await vigiaService.retornaVigiasDisponiveis();
    return res.status(200).json({
      success: true,
      data: vigias,
      total: vigias.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vigias disponíveis',
      error: error.message,
    });
  }
});

// GET /vigias/:id - Retorna vigia por ID
vigiaRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vigia = await vigiaService.retornaVigiaPorId(parseInt(id));
    return res.status(200).json({
      success: true,
      data: vigia,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /vigias - Cria novo vigia
vigiaRouter.post('/', async (req, res) => {
  try {
    const vigiaData = req.body;
    const novoVigia = await vigiaService.criaVigia(vigiaData);
    return res.status(201).json({
      success: true,
      message: 'Vigia criado com sucesso',
      data: novoVigia,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao criar vigia',
      error: error.message,
    });
  }
});

// PUT /vigias/:id - Atualiza vigia
vigiaRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vigiaData = req.body;
    const vigiaAtualizado = await vigiaService.atualizaVigia(parseInt(id), vigiaData);
    return res.status(200).json({
      success: true,
      message: 'Vigia atualizado com sucesso',
      data: vigiaAtualizado,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao atualizar vigia',
      error: error.message,
    });
  }
});

// POST /vigias/:id/iniciar-ronda - Inicia ronda
vigiaRouter.post('/:id/iniciar-ronda', async (req, res) => {
  try {
    const { id } = req.params;
    const vigia = await vigiaService.iniciaRondaVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Ronda iniciada com sucesso',
      data: vigia,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao iniciar ronda',
      error: error.message,
    });
  }
});

// POST /vigias/:id/finalizar-ronda - Finaliza ronda
vigiaRouter.post('/:id/finalizar-ronda', async (req, res) => {
  try {
    const { id } = req.params;
    const vigia = await vigiaService.finalizaRondaVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Ronda finalizada com sucesso',
      data: vigia,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao finalizar ronda',
      error: error.message,
    });
  }
});

// DELETE /vigias/:id - Deleta vigia
vigiaRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await vigiaService.deletaVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Vigia deletado com sucesso',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao deletar vigia',
      error: error.message,
    });
  }
});

// GET /vigias/:id/rondas - Retorna rondas do vigia
vigiaRouter.get('/:id/rondas', async (req, res) => {
  try {
    const { id } = req.params;
    const rondas = await vigiaService.retornaRondasDoVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      data: rondas,
      total: rondas.length,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /vigias/:id/estatisticas - Retorna estatísticas do vigia
vigiaRouter.get('/:id/estatisticas', async (req, res) => {
  try {
    const { id } = req.params;
    const estatisticas = await vigiaService.retornaEstatisticasVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      data: estatisticas,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /vigias/:id/disponibilidade - Verifica disponibilidade
vigiaRouter.get('/:id/disponibilidade', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await vigiaService.verificaDisponibilidadeVigia(parseInt(id));
    return res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar disponibilidade',
      error: error.message,
    });
  }
});

module.exports = vigiaRouter;
