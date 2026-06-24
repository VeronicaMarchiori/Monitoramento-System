const express = require('express');
const empresaService = require('../service/empresaService');

const empresaRouter = express.Router();

// GET /empresas - Listar todas as empresas
empresaRouter.get('/', async (req, res) => {
  try {
    const empresas = await empresaService.retornaTodasEmpresas();
    res.json({ success: true, data: empresas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /empresas/:id - Buscar empresa por ID
empresaRouter.get('/:id', async (req, res) => {
  try {
    const empresa = await empresaService.retornaEmpresaPorId(req.params.id);
    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }
    res.json({ success: true, data: empresa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /empresas - Criar nova empresa
empresaRouter.post('/', async (req, res) => {
  try {
    const empresa = await empresaService.criaEmpresa(req.body);
    res.status(201).json({ success: true, data: empresa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /empresas/:id - Atualizar empresa
empresaRouter.put('/:id', async (req, res) => {
  try {
    const empresa = await empresaService.atualizaEmpresa(req.params.id, req.body);
    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }
    res.json({ success: true, data: empresa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /empresas/:id - Deletar empresa
empresaRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await empresaService.deletaEmpresa(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }
    res.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = empresaRouter;
