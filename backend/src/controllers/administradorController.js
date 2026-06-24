const express = require('express');
const administradorService = require('../service/administradorService');

const administradorRouter = express.Router();

// GET /administradores - Retorna todos os administradores
administradorRouter.get('/', async (req, res) => {
  try {
    const administradores = await administradorService.retornaTodosAdministradores();
    return res.status(200).json({
      success: true,
      data: administradores,
      total: administradores.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar administradores',
      error: error.message,
    });
  }
});

// GET /administradores/ativos - Retorna administradores ativos
administradorRouter.get('/ativos', async (req, res) => {
  try {
    const administradores = await administradorService.retornaAdministradoresAtivos();
    return res.status(200).json({
      success: true,
      data: administradores,
      total: administradores.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar administradores ativos',
      error: error.message,
    });
  }
});

// GET /administradores/nivel/:nivel - Retorna administradores por nível
administradorRouter.get('/nivel/:nivel', async (req, res) => {
  try {
    const { nivel } = req.params;
    const administradores = await administradorService.retornaAdministradoresPorNivel(nivel);
    return res.status(200).json({
      success: true,
      data: administradores,
      total: administradores.length,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /administradores/:id - Retorna administrador por ID
administradorRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const administrador = await administradorService.retornaAdministradorPorId(parseInt(id));
    return res.status(200).json({
      success: true,
      data: administrador,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /administradores - Cria novo administrador
administradorRouter.post('/', async (req, res) => {
  try {
    const adminData = req.body;
    const novoAdmin = await administradorService.criaAdministrador(adminData);
    return res.status(201).json({
      success: true,
      message: 'Administrador criado com sucesso',
      data: novoAdmin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao criar administrador',
      error: error.message,
    });
  }
});

// PUT /administradores/:id - Atualiza administrador
administradorRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminData = req.body;
    const adminAtualizado = await administradorService.atualizaAdministrador(parseInt(id), adminData);
    return res.status(200).json({
      success: true,
      message: 'Administrador atualizado com sucesso',
      data: adminAtualizado,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao atualizar administrador',
      error: error.message,
    });
  }
});

// DELETE /administradores/:id - Deleta administrador
administradorRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await administradorService.deletaAdministrador(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Administrador deletado com sucesso',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao deletar administrador',
      error: error.message,
    });
  }
});

// GET /administradores/:id/rondas - Retorna rondas do administrador
administradorRouter.get('/:id/rondas', async (req, res) => {
  try {
    const { id } = req.params;
    const rondas = await administradorService.retornaRondasDoAdministrador(parseInt(id));
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

// GET /administradores/:id/estatisticas - Retorna estatísticas
administradorRouter.get('/:id/estatisticas', async (req, res) => {
  try {
    const { id } = req.params;
    const estatisticas = await administradorService.retornaEstatisticasAdministrador(parseInt(id));
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

// GET /administradores/:id/is-master - Verifica se é master
administradorRouter.get('/:id/is-master', async (req, res) => {
  try {
    const { id } = req.params;
    const isMaster = await administradorService.verificaAdministradorMaster(parseInt(id));
    return res.status(200).json({
      success: true,
      data: { isMaster },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar nível master',
      error: error.message,
    });
  }
});

// GET /administradores/:id/dashboard - Retorna dashboard
administradorRouter.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    const dashboard = await administradorService.retornaDashboardAdministrador(parseInt(id));
    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /administradores/:id/promover - Promove administrador
administradorRouter.post('/:id/promover', async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await administradorService.promoveAdministrador(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Administrador promovido com sucesso',
      data: admin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao promover administrador',
      error: error.message,
    });
  }
});

// POST /administradores/:id/rebaixar - Rebaixa administrador
administradorRouter.post('/:id/rebaixar', async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await administradorService.rebaixaAdministrador(parseInt(id));
    return res.status(200).json({
      success: true,
      message: 'Administrador rebaixado com sucesso',
      data: admin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erro ao rebaixar administrador',
      error: error.message,
    });
  }
});

// POST /administradores/:id/validar-permissao - Valida permissões
administradorRouter.post('/:id/validar-permissao', async (req, res) => {
  try {
    const { id } = req.params;
    const { acao } = req.body;
    
    if (!acao) {
      return res.status(400).json({
        success: false,
        message: 'Ação é obrigatória',
      });
    }

    const resultado = await administradorService.validaPermissoesAdministrador(parseInt(id), acao);
    return res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar permissões',
      error: error.message,
    });
  }
});

module.exports = administradorRouter;
