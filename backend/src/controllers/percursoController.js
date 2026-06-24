const express = require('express');
const percursoService = require('../service/percursoService');

const percursoRouter = express.Router();

// GET /percursos - Listar todos os percursos
percursoRouter.get('/', async (req, res) => {
  try {
    const percursos = await percursoService.retornaTodosPercursos();
    res.json({ success: true, data: percursos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /percursos/:id - Buscar percurso por ID
percursoRouter.get('/:id', async (req, res) => {
  try {
    const percurso = await percursoService.retornaPercursoPorId(req.params.id);
    if (!percurso) {
      return res.status(404).json({ success: false, message: 'Percurso não encontrado' });
    }
    res.json({ success: true, data: percurso });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /percursos - Criar novo percurso
percursoRouter.post('/', async (req, res) => {
  try {
    const percurso = await percursoService.criaPercurso(req.body);
    res.status(201).json({ success: true, data: percurso });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /percursos/:id - Atualizar percurso
percursoRouter.put('/:id', async (req, res) => {
  try {
    const percurso = await percursoService.atualizaPercurso(req.params.id, req.body);
    if (!percurso) {
      return res.status(404).json({ success: false, message: 'Percurso não encontrado' });
    }
    res.json({ success: true, data: percurso });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /percursos/:id - Deletar percurso
percursoRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await percursoService.deletaPercurso(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Percurso não encontrado' });
    }
    res.json({ success: true, message: 'Percurso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /percursos/:id/vigias - Adicionar vigia ao percurso
percursoRouter.post('/:id/vigias', async (req, res) => {
  try {
    const { idVigia } = req.body;
    const success = await percursoService.adicionaVigiaPercurso(req.params.id, idVigia);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Percurso ou vigia não encontrado' });
    }
    res.json({ success: true, message: 'Vigia adicionado ao percurso com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /percursos/:id/vigias/:idVigia - Remover vigia do percurso
percursoRouter.delete('/:id/vigias/:idVigia', async (req, res) => {
  try {
    const success = await percursoService.removeVigiaPercurso(req.params.id, req.params.idVigia);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Percurso ou vigia não encontrado' });
    }
    res.json({ success: true, message: 'Vigia removido do percurso com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = percursoRouter;
