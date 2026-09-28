const express = require("express");

const {
    obterResumo,
    rankingProfessores,
    rankingAgendamentosProfessores,
    ocorrenciasPorSala,
    ocorrenciasPorProfessor,
    ocorrenciasPorTipo,
    ocorrenciasPorMes,
    agendamentosPorSala,
    agendamentosPorTurma,
    emprestimosPorTurma,
    resumoAgendamentos
} = require("../controllers/relatorioController");

const router = express.Router();

// ==========================================
// RESUMO
// ==========================================

router.get("/resumo", obterResumo);

router.get(
    "/resumo-agendamentos",
    resumoAgendamentos
);

// ==========================================
// RANKINGS
// ==========================================

router.get(
    "/ranking-professores",
    rankingProfessores
);

router.get(
    "/ranking-agendamentos-professores",
    rankingAgendamentosProfessores
);

// ==========================================
// OCORRÊNCIAS
// ==========================================

router.get(
    "/ocorrencias-salas",
    ocorrenciasPorSala
);

router.get(
    "/ocorrencias-professores",
    ocorrenciasPorProfessor
);

router.get(
    "/ocorrencias-tipos",
    ocorrenciasPorTipo
);

router.get(
    "/ocorrencias-meses",
    ocorrenciasPorMes
);

// ==========================================
// AGENDAMENTOS
// ==========================================

router.get(
    "/agendamentos-salas",
    agendamentosPorSala
);

router.get(
    "/agendamentos-turmas",
    agendamentosPorTurma
);

// ==========================================
// EMPRÉSTIMOS
// ==========================================

router.get(
    "/emprestimos-turmas",
    emprestimosPorTurma
);

module.exports = router;