const pool = require('../database/database');

// ==========================================
// RESUMO GERAL
// ==========================================
const obterResumo = async (req, res) => {
    try {
        // Total de empréstimos
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

        const totalChromebooks = 45;

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
        console.error('Erro ao gerar resumo:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório.'
        });
    }
};


// ==========================================
// RANKING DE PROFESSORES
// ==========================================
const rankingProfessores = async (req, res) => {
    try {
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

            GROUP BY
                professores.id,
                professores.nome

            ORDER BY
                total_chromebooks DESC,
                total_emprestimos DESC
        `);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error('Erro ao gerar ranking:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar ranking de professores.'
        });
    }
};


// ==========================================
// SALAS COM MAIS OCORRÊNCIAS
// ==========================================
const ocorrenciasPorSala = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                sala,
                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            GROUP BY sala

            ORDER BY total_ocorrencias DESC
        `);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error('Erro ao gerar relatório de salas:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de ocorrências por sala.'
        });
    }
};


// ==========================================
// OCORRÊNCIAS POR TIPO
// ==========================================
const ocorrenciasPorTipo = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                tipo,
                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            GROUP BY tipo

            ORDER BY total_ocorrencias DESC
        `);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error('Erro ao gerar relatório por tipo:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório por tipo de ocorrência.'
        });
    }
};


// ==========================================
// OCORRÊNCIAS POR MÊS
// ==========================================
const ocorrenciasPorMes = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                TO_CHAR(
                    data_abertura,
                    'MM/YYYY'
                ) AS mes,

                COUNT(*) AS total_ocorrencias

            FROM ocorrencias

            GROUP BY
                TO_CHAR(
                    data_abertura,
                    'MM/YYYY'
                )

            ORDER BY
                MIN(data_abertura)
        `);

        res.status(200).json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error('Erro ao gerar relatório mensal:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório mensal.'
        });
    }
};


module.exports = {
    obterResumo,
    rankingProfessores,
    ocorrenciasPorSala,
    ocorrenciasPorTipo,
    ocorrenciasPorMes
};