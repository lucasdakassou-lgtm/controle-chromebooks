
const pool = require("../database/database");

// ==========================================
// FILTRO DE PERÍODO
// ==========================================

function obterFiltroPeriodo(req, campo) {

    const { data_inicio, data_fim } = req.query;

    const filtros = [];
    const valores = [];

    if (data_inicio) {
        valores.push(data_inicio);
        filtros.push(`${campo} >= $${valores.length}`);
    }

    if (data_fim) {
        valores.push(data_fim);
        filtros.push(`${campo} < ($${valores.length}::date + INTERVAL '1 day')`);
    }

    return {
        filtros,
        valores
    };
}

// ==========================================
// RESUMO GERAL
// ==========================================
const obterResumo = async (req, res) => {
    try {

        // Total de empréstimos realizados
        const totalEmprestimos = await pool.query(`
            SELECT COUNT(*) AS total
            FROM emprestimos
        `);


        // Chromebooks atualmente emprestados
        const chromebooksEmprestados = await pool.query(`
            SELECT COALESCE(SUM(quantidade), 0) AS total
            FROM emprestimos
            WHERE status = 'ATIVO'
        `);


        // Total de ocorrências
        const totalOcorrencias = await pool.query(`
            SELECT COUNT(*) AS total
            FROM ocorrencias
        `);


        // Ocorrências abertas
        const ocorrenciasAbertas = await pool.query(`
            SELECT COUNT(*) AS total
            FROM ocorrencias
            WHERE status = 'ABERTA'
        `);


        // Ocorrências em andamento
        const ocorrenciasAndamento = await pool.query(`
            SELECT COUNT(*) AS total
            FROM ocorrencias
            WHERE status = 'EM_ANDAMENTO'
        `);


        // Ocorrências resolvidas
        const ocorrenciasResolvidas = await pool.query(`
            SELECT COUNT(*) AS total
            FROM ocorrencias
            WHERE status = 'RESOLVIDA'
        `);


        // Total de Chromebooks configurado no sistema
        const configuracao = await pool.query(`
            SELECT total_chromebooks
            FROM configuracoes
            LIMIT 1
        `);


        const totalChromebooks = Number(
            configuracao.rows[0]?.total_chromebooks || 0
        );


        const emprestados = Number(
            chromebooksEmprestados.rows[0].total
        );


        const disponiveis = totalChromebooks - emprestados;


        res.status(200).json({
            sucesso: true,

            dados: {
                total_chromebooks: totalChromebooks,

                chromebooks_emprestados: emprestados,

                chromebooks_disponiveis: disponiveis,

                total_emprestimos: Number(
                    totalEmprestimos.rows[0].total
                ),

                total_ocorrencias: Number(
                    totalOcorrencias.rows[0].total
                ),

                ocorrencias_abertas: Number(
                    ocorrenciasAbertas.rows[0].total
                ),

                ocorrencias_em_andamento: Number(
                    ocorrenciasAndamento.rows[0].total
                ),

                ocorrencias_resolvidas: Number(
                    ocorrenciasResolvidas.rows[0].total
                )
            }
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar resumo:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao gerar relatório."
        });
    }
};


// ==========================================
// RANKING DE PROFESSORES
// QUEM MAIS PEGA CHROMEBOOKS
// ==========================================
const rankingProfessores = async (req, res) => {

    try {

        const { data_inicio, data_fim } = req.query;

        const filtros = [];
        const valores = [];

        if (data_inicio) {
            valores.push(data_inicio);
            filtros.push(
                `emprestimos.data_retirada >= $${valores.length}`
            );
        }

        if (data_fim) {
            valores.push(data_fim);
            filtros.push(
                `emprestimos.data_retirada < ($${valores.length}::date + INTERVAL '1 day')`
            );
        }

        const filtroJoin = filtros.length
            ? `AND ${filtros.join(" AND ")}`
            : "";

        const resultado = await pool.query(`
            SELECT
                professores.id,
                professores.nome,

                COUNT(emprestimos.id) AS total_emprestimos,

                COALESCE(
                    SUM(emprestimos.quantidade),
                    0
                ) AS total_chromebooks

            FROM professores

            LEFT JOIN emprestimos
                ON emprestimos.professor_id = professores.id
                ${filtroJoin}

            GROUP BY
                professores.id,
                professores.nome

            ORDER BY
                total_chromebooks DESC,
                total_emprestimos DESC
        `, valores);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro no ranking de professores:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar ranking de professores."
        });
    }
};
// ==========================================
// RANKING DE PROFESSORES
// QUEM MAIS AGENDA SALAS
// ==========================================
const rankingAgendamentosProfessores = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT
                professores.id,
                professores.nome,

                COUNT(agendamentos.id) AS total_agendamentos

            FROM professores

            LEFT JOIN agendamentos
                ON agendamentos.professor_id = professores.id

            GROUP BY
                professores.id,
                professores.nome

            ORDER BY
                total_agendamentos DESC
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar ranking de agendamentos:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar ranking de professores por agendamento."
        });
    }
};


// ==========================================
// SALAS COM MAIS OCORRÊNCIAS
// ==========================================
const ocorrenciasPorSala = async (req, res) => {

    try {

        const { data_inicio, data_fim } = req.query;

        const filtros = [];
        const valores = [];

        if (data_inicio) {
            valores.push(data_inicio);

            filtros.push(
                `data_abertura >= $${valores.length}`
            );
        }

        if (data_fim) {
            valores.push(data_fim);

            filtros.push(
                `data_abertura < ($${valores.length}::date + INTERVAL '1 day')`
            );
        }

        const where = filtros.length
            ? `WHERE ${filtros.join(" AND ")}`
            : "";

        const resultado = await pool.query(`
            SELECT
                sala,
                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            ${where}

            GROUP BY sala

            ORDER BY total_ocorrencias DESC
        `, valores);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro nas ocorrências por sala:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório de ocorrências por sala."
        });
    }
};
// ==========================================
// PROFESSORES COM MAIS OCORRÊNCIAS
// ==========================================
const ocorrenciasPorProfessor = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT
                professores.id,
                professores.nome,

                COUNT(ocorrencias.id) AS total_ocorrencias

            FROM professores

            LEFT JOIN ocorrencias
                ON ocorrencias.professor_id = professores.id

            GROUP BY
                professores.id,
                professores.nome

            ORDER BY
                total_ocorrencias DESC
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar ocorrências por professor:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório de ocorrências por professor."
        });
    }
};


// ==========================================
// OCORRÊNCIAS POR TIPO
// PRINCIPAIS MOTIVOS
// ==========================================
const ocorrenciasPorTipo = async (req, res) => {

    try {

        const { data_inicio, data_fim } = req.query;

        const filtros = [];
        const valores = [];

        if (data_inicio) {
            valores.push(data_inicio);

            filtros.push(
                `data_abertura >= $${valores.length}`
            );
        }

        if (data_fim) {
            valores.push(data_fim);

            filtros.push(
                `data_abertura < ($${valores.length}::date + INTERVAL '1 day')`
            );
        }

        const where = filtros.length
            ? `WHERE ${filtros.join(" AND ")}`
            : "";

        const resultado = await pool.query(`
            SELECT
                tipo,
                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            ${where}

            GROUP BY tipo

            ORDER BY total_ocorrencias DESC
        `, valores);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro nas ocorrências por tipo:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório por tipo de ocorrência."
        });
    }
};


// ==========================================
// OCORRÊNCIAS POR MÊS
// ==========================================
const ocorrenciasPorMes = async (req, res) => {

    try {

        const { data_inicio, data_fim } = req.query;

        const filtros = [];
        const valores = [];

        if (data_inicio) {
            valores.push(data_inicio);

            filtros.push(
                `data_abertura >= $${valores.length}`
            );
        }

        if (data_fim) {
            valores.push(data_fim);

            filtros.push(
                `data_abertura < ($${valores.length}::date + INTERVAL '1 day')`
            );
        }

        const where = filtros.length
            ? `WHERE ${filtros.join(" AND ")}`
            : "";

        const resultado = await pool.query(`
            SELECT

                TO_CHAR(
                    data_abertura,
                    'MM/YYYY'
                ) AS mes,

                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            ${where}

            GROUP BY
                TO_CHAR(
                    data_abertura,
                    'MM/YYYY'
                )

            ORDER BY
                MIN(data_abertura)
        `, valores);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro na evolução mensal:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório mensal."
        });
    }
};

// ==========================================
// AGENDAMENTOS POR SALA
// ==========================================
const agendamentosPorSala = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT
                sala,
                COUNT(*) AS total_agendamentos

            FROM agendamentos

            GROUP BY sala

            ORDER BY total_agendamentos DESC
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar agendamentos por sala:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório de agendamentos por sala."
        });
    }
};


// ==========================================
// AGENDAMENTOS POR TURMA
// ==========================================
const agendamentosPorTurma = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT
                turmas.id,
                turmas.nome,

                COUNT(agendamentos.id) AS total_agendamentos

            FROM turmas

            LEFT JOIN agendamentos
                ON agendamentos.turma_id = turmas.id

            GROUP BY
                turmas.id,
                turmas.nome

            ORDER BY
                total_agendamentos DESC
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar agendamentos por turma:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório de agendamentos por turma."
        });
    }
};


// ==========================================
// EMPRÉSTIMOS POR TURMA
// ==========================================
const emprestimosPorTurma = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT
                turmas.id,
                turmas.nome,

                COUNT(emprestimos.id) AS total_emprestimos,

                COALESCE(
                    SUM(emprestimos.quantidade),
                    0
                ) AS total_chromebooks

            FROM turmas

            LEFT JOIN emprestimos
                ON emprestimos.turma_id = turmas.id

            GROUP BY
                turmas.id,
                turmas.nome

            ORDER BY
                total_chromebooks DESC
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar empréstimos por turma:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar relatório de empréstimos por turma."
        });
    }
};


// ==========================================
// RESUMO DE AGENDAMENTOS
// ==========================================
const resumoAgendamentos = async (req, res) => {
    try {

        const resultado = await pool.query(`
            SELECT

                COUNT(*) AS total_agendamentos,

                COUNT(*) FILTER (
                    WHERE status = 'AGENDADO'
                ) AS agendamentos_ativos,

                COUNT(*) FILTER (
                    WHERE status <> 'AGENDADO'
                ) AS outros_status

            FROM agendamentos
        `);


        res.status(200).json({
            sucesso: true,
            dados: resultado.rows[0]
        });

    } catch (erro) {

        console.error(
            "[RELATORIOS] Erro ao gerar resumo de agendamentos:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao gerar resumo de agendamentos."
        });
    }
};


// ==========================================
// EXPORTAÇÃO
// ==========================================
module.exports = {

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

};