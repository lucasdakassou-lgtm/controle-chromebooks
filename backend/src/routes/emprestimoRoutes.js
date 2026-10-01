const express = require("express");

const {
    criarEmprestimo,
    listarEmprestimos,
    listarEmprestimosAtivos,
    devolverEmprestimo,
    verificarDisponibilidade
} = require("../controllers/emprestimoController");

const router = express.Router();

console.log("[ROTAS] emprestimoRoutes carregado.");


// ============================================================
// EMPRÉSTIMOS
// ============================================================

router.get("/", listarEmprestimos);

router.get("/ativos", listarEmprestimosAtivos);

router.get("/disponibilidade", verificarDisponibilidade);

router.post("/", criarEmprestimo);


// ============================================================
// DEVOLUÇÃO
// ============================================================

router.post(
    "/:id/devolver",
    devolverEmprestimo
);


module.exports = router;