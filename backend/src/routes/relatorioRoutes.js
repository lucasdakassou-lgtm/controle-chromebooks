const express = require('express');

const router = express.Router();

const {
    obterResumo,
    rankingProfessores,
    ocorrenciasPorSala,
    ocorrenciasPorTipo,
    ocorrenciasPorMes
} = require('../controllers/relatorioController');


// Resumo geral
router.get('/resumo', obterResumo);


// Ranking dos professores
router.get('/ranking-professores', rankingProfessores);


// Ocorrências por sala
router.get('/ocorrencias-salas', ocorrenciasPorSala);


// Ocorrências por tipo
router.get('/ocorrencias-tipos', ocorrenciasPorTipo);


// Ocorrências por mês
router.get('/ocorrencias-meses', ocorrenciasPorMes);


module.exports = router;