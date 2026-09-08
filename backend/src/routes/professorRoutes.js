const express = require('express');

const router = express.Router();

const {
    criarProfessor,
    listarProfessores,
    buscarProfessorPorId,
    atualizarProfessor,
    deletarProfessor
} = require('../controllers/professorController');


// GET - listar professores
router.get('/', listarProfessores);


// GET - buscar professor por ID
router.get('/:id', buscarProfessorPorId);


// POST - criar professor
router.post('/', criarProfessor);


// PUT - atualizar professor
router.put('/:id', atualizarProfessor);


// DELETE - excluir professor
router.delete('/:id', deletarProfessor);


module.exports = router;