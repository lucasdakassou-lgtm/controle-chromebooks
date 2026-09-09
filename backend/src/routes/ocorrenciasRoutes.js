const express = require('express');

const router = express.Router();

const {
    criarOcorrencia,
    listarOcorrencias,
    buscarOcorrenciaPorId,
    atualizarOcorrencia,
    resolverOcorrencia
} = require('../controllers/ocorrenciasController');


// ==========================================
// OCORRÊNCIAS
// ==========================================

// Listar todas as ocorrências
router.get('/', listarOcorrencias);

// Buscar ocorrência por ID
router.get('/:id', buscarOcorrenciaPorId);

// Criar ocorrência
router.post('/', criarOcorrencia);

// Atualizar ocorrência
router.put('/:id', atualizarOcorrencia);

// Resolver ocorrência
router.put('/:id/resolver', resolverOcorrencia);


module.exports = router;