const express = require('express');

const router = express.Router();

const {
    criarTurma,
    listarTurmas,
    buscarTurmaPorId,
    atualizarTurma,
    deletarTurma
} = require('../controllers/turmaController');


// Listar todas
router.get('/', listarTurmas);

// Buscar por ID
router.get('/:id', buscarTurmaPorId);

// Criar
router.post('/', criarTurma);

// Atualizar
router.put('/:id', atualizarTurma);

// Deletar
router.delete('/:id', deletarTurma);


module.exports = router;