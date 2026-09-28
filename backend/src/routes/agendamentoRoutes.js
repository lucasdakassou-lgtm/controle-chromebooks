const express = require("express");

const router = express.Router();

const {
    listarAgendamentos,
    buscarAgendamentoPorId,
    criarAgendamento,
    excluirAgendamento
} = require("../controllers/agendamentoController");

router.get("/", listarAgendamentos);
router.get("/:id", buscarAgendamentoPorId);
router.post("/", criarAgendamento);
router.delete("/:id", excluirAgendamento);

module.exports = router;