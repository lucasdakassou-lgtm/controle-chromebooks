const express = require("express");

const {
   listarAgendamentos,
    buscarAgendamentoPorId,
    criarAgendamento,
    excluirAgendamento
} = require("../controllers/agendamentoController");

const router = express.Router();

console.log("[ROTAS] Agendamento carregado.");

router.get("/", listarAgendamentos);

router.get("/:id", buscarAgendamentoPorId);



router.post("/", criarAgendamento);

router.delete("/:id", excluirAgendamento);

module.exports = router;