const express = require('express');
const ocorrenciaService = require('../service/ocorrenciaService');

const ocorrenciaRouter = express.Router();

// GET /ocorrencias - Listar todas as ocorrências
ocorrenciaRouter.get('/', async (req, res) => {
  try {
    const ocorrencias = await ocorrenciaService.retornaTodasOcorrencias();
    res.json({ success: true, data: ocorrencias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /ocorrencias/:id - Buscar ocorrência por ID
ocorrenciaRouter.get('/:id', async (req, res) => {
  try {
    const ocorrencia = await ocorrenciaService.retornaOcorrenciaPorId(req.params.id);
    if (!ocorrencia) {
      return res.status(404).json({ success: false, message: 'Ocorrência não encontrada' });
    }
    res.json({ success: true, data: ocorrencia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /ocorrencias - Criar nova ocorrência
ocorrenciaRouter.post('/', async (req, res) => {
  try {
    const ocorrencia = await ocorrenciaService.criaOcorrencia(req.body);
    res.status(201).json({ success: true, data: ocorrencia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /ocorrencias/:id - Atualizar ocorrência
ocorrenciaRouter.put('/:id', async (req, res) => {
  try {
    const ocorrencia = await ocorrenciaService.atualizaOcorrencia(req.params.id, req.body);
    if (!ocorrencia) {
      return res.status(404).json({ success: false, message: 'Ocorrência não encontrada' });
    }
    res.json({ success: true, data: ocorrencia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /ocorrencias/:id - Deletar ocorrência
ocorrenciaRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await ocorrenciaService.deletaOcorrencia(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ocorrência não encontrada' });
    }
    res.json({ success: true, message: 'Ocorrência deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = ocorrenciaRouter;
