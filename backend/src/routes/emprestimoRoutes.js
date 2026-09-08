const express = require('express');

const router = express.Router();

const {
    criarEmprestimo,
    listarEmprestimos,
    listarEmprestimosAtivos,
    devolverEmprestimo,
    verificarDisponibilidade
} = require('../controllers/emprestimoController');


// ==========================================
// ROTAS ESPECÍFICAS
// ==========================================

// Ver Chromebooks disponíveis
router.get('/disponibilidade', verificarDisponibilidade);

// Ver empréstimos ativos
router.get('/ativos', listarEmprestimosAtivos);


// ==========================================
// ROTAS GERAIS
// ==========================================

// Listar todos os empréstimos
router.get('/', listarEmprestimos);

// Criar empréstimo
router.post('/', criarEmprestimo);


// ==========================================
// AÇÕES
// ==========================================

// Registrar devolução
router.post('/:id/devolver', devolverEmprestimo);


module.exports = router;