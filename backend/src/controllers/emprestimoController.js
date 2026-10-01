const pool = require("../database/database");


// ============================================================
// CONFIGURAÇÕES DOS EQUIPAMENTOS
// ============================================================

const TIPOS_EQUIPAMENTO = [
    "CHROMEBOOK",
    "TABLET"
];

const FINALIDADES_EMPRESTIMO = [
    "AULA",
    "USO_PROPRIO"
];


// ============================================================
// VALIDAR TIPO DE EQUIPAMENTO
// ============================================================

function validarTipoEquipamento(tipo) {

    const tipoNormalizado =
        String(tipo || "CHROMEBOOK")
            .trim()
            .toUpperCase();

    if (!TIPOS_EQUIPAMENTO.includes(tipoNormalizado)) {
        return null;
    }

    return tipoNormalizado;
}


// ============================================================
// VALIDAR FINALIDADE
// ============================================================

function validarFinalidade(finalidade) {

    const finalidadeNormalizada =
        String(finalidade || "AULA")
            .trim()
            .toUpperCase();

    if (
        !FINALIDADES_EMPRESTIMO.includes(
            finalidadeNormalizada
        )
    ) {
        return null;
    }

    return finalidadeNormalizada;
}


// ============================================================
// CRIAR EMPRÉSTIMO
// ============================================================

async function criarEmprestimo(req, res) {

    try {

        const {
            professor_id,
            turma_id,
            quantidade,
            tipo_equipamento,
            finalidade
        } = req.body;


        console.log(
            "[EMPRESTIMOS] Tentando criar empréstimo:",
            req.body
        );


        // --------------------------------------------------------
        // VALIDAR FINALIDADE
        // --------------------------------------------------------

        const finalidadeNormalizada =
            validarFinalidade(finalidade);


        if (!finalidadeNormalizada) {

            return res.status(400).json({
                mensagem:
                    "Finalidade inválida. Use AULA ou USO_PROPRIO."
            });

        }


        // --------------------------------------------------------
        // VALIDAR PROFESSOR
        // --------------------------------------------------------

        if (!professor_id) {

            return res.status(400).json({
                mensagem: "O professor é obrigatório."
            });

        }


        // --------------------------------------------------------
        // VALIDAR TURMA
        //
        // Para AULA, turma é obrigatória.
        // Para USO_PROPRIO, turma não é necessária.
        // --------------------------------------------------------

        if (
            finalidadeNormalizada === "AULA" &&
            !turma_id
        ) {

            return res.status(400).json({
                mensagem:
                    "A turma é obrigatória para empréstimos de aula."
            });

        }


        // --------------------------------------------------------
        // VALIDAR QUANTIDADE
        // --------------------------------------------------------

        if (
            quantidade === undefined ||
            quantidade === null ||
            Number(quantidade) <= 0
        ) {

            return res.status(400).json({
                mensagem:
                    "A quantidade deve ser maior que zero."
            });

        }


        // --------------------------------------------------------
        // VALIDAR EQUIPAMENTO
        // --------------------------------------------------------

        const tipo =
            validarTipoEquipamento(
                tipo_equipamento
            );


        if (!tipo) {

            return res.status(400).json({
                mensagem:
                    "Tipo de equipamento inválido. Use CHROMEBOOK ou TABLET."
            });

        }


        const quantidadeNumerica =
            Number(quantidade);


        // --------------------------------------------------------
        // VERIFICAR SE PROFESSOR EXISTE
        // --------------------------------------------------------

        const professor =
            await pool.query(
                `
                SELECT
                    id,
                    nome
                FROM professores
                WHERE id = $1
                `,
                [professor_id]
            );


        if (
            professor.rows.length === 0
        ) {

            return res.status(404).json({
                mensagem:
                    "Professor não encontrado."
            });

        }


        // --------------------------------------------------------
        // VERIFICAR SE TURMA EXISTE
        //
        // Só verifica quando for empréstimo de aula.
        // --------------------------------------------------------

        if (
            finalidadeNormalizada === "AULA"
        ) {

            const turma =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome
                    FROM turmas
                    WHERE id = $1
                    `,
                    [turma_id]
                );


            if (
                turma.rows.length === 0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Turma não encontrada."
                });

            }

        }


        // --------------------------------------------------------
        // BUSCAR TOTAL DOS EQUIPAMENTOS
        // --------------------------------------------------------

        const configuracao =
            await pool.query(
                `
                SELECT
                    total_chromebooks,
                    total_tablets
                FROM configuracoes
                LIMIT 1
                `
            );


        if (
            configuracao.rows.length === 0
        ) {

            return res.status(500).json({
                mensagem:
                    "Configuração dos equipamentos não encontrada."
            });

        }


        const config =
            configuracao.rows[0];


        let totalEquipamentos = 0;


        if (
            tipo === "CHROMEBOOK"
        ) {

            totalEquipamentos =
                Number(
                    config.total_chromebooks
                ) || 0;

        }


        if (
            tipo === "TABLET"
        ) {

            totalEquipamentos =
                Number(
                    config.total_tablets
                ) || 0;

        }


        // --------------------------------------------------------
        // CALCULAR QUANTIDADE JÁ EMPRESTADA
        // --------------------------------------------------------

        const emprestados =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(quantidade),
                        0
                    ) AS total
                FROM emprestimos
                WHERE
                    tipo_equipamento = $1
                    AND status = 'ATIVO'
                `,
                [tipo]
            );


        const quantidadeEmprestada =
            Number(
                emprestados.rows[0].total
            ) || 0;


        const quantidadeDisponivel =
            totalEquipamentos -
            quantidadeEmprestada;


        console.log(
            `[EMPRESTIMOS] ${tipo}: total=${totalEquipamentos}, ` +
            `emprestados=${quantidadeEmprestada}, ` +
            `disponiveis=${quantidadeDisponivel}`
        );


        // --------------------------------------------------------
        // VERIFICAR DISPONIBILIDADE
        // --------------------------------------------------------

        if (
            quantidadeNumerica >
            quantidadeDisponivel
        ) {

            return res.status(400).json({
                mensagem:
                    `Não há equipamentos suficientes disponíveis. ` +
                    `Disponíveis: ${quantidadeDisponivel}.`
            });

        }


        // --------------------------------------------------------
        // REGISTRAR EMPRÉSTIMO
        // --------------------------------------------------------

        const resultado =
            await pool.query(
                `
                INSERT INTO emprestimos
                (
                    professor_id,
                    turma_id,
                    quantidade,
                    tipo_equipamento,
                    finalidade,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    'ATIVO'
                )
                RETURNING *
                `,
                [
                    professor_id,
                    finalidadeNormalizada === "AULA"
                        ? turma_id
                        : null,
                    quantidadeNumerica,
                    tipo,
                    finalidadeNormalizada
                ]
            );


        console.log(
            "[EMPRESTIMOS] Empréstimo criado:",
            resultado.rows[0]
        );


        return res.status(201).json({

            mensagem:
                finalidadeNormalizada === "USO_PROPRIO"
                    ? "Empréstimo para uso próprio registrado com sucesso."
                    : "Empréstimo registrado com sucesso.",

            emprestimo:
                resultado.rows[0]

        });


    } catch (erro) {

        console.error(
            "[EMPRESTIMOS] Erro ao criar empréstimo:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro ao registrar empréstimo."
        });

    }

}


// ============================================================
// LISTAR TODOS OS EMPRÉSTIMOS
// ============================================================

async function listarEmprestimos(req, res) {

    try {

        const resultado =
            await pool.query(
                `
                SELECT
                    emprestimos.id,
                    emprestimos.professor_id,
                    professores.nome AS professor,
                    emprestimos.turma_id,
                    turmas.nome AS turma,
                    emprestimos.quantidade,
                    emprestimos.tipo_equipamento,
                    emprestimos.finalidade,
                    emprestimos.data_retirada,
                    emprestimos.data_devolucao,
                    emprestimos.status

                FROM emprestimos

                INNER JOIN professores
                    ON emprestimos.professor_id =
                       professores.id

                LEFT JOIN turmas
                    ON emprestimos.turma_id =
                       turmas.id

                ORDER BY
                    emprestimos.data_retirada DESC
                `
            );


        console.log(
            `[EMPRESTIMOS] ${resultado.rows.length} empréstimos encontrados.`
        );


        return res.status(200).json({

            emprestimos:
                resultado.rows,

            dados:
                resultado.rows

        });


    } catch (erro) {

        console.error(
            "[EMPRESTIMOS] Erro ao listar empréstimos:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro ao carregar empréstimos."
        });

    }

}


// ============================================================
// LISTAR EMPRÉSTIMOS ATIVOS
// ============================================================

async function listarEmprestimosAtivos(req, res) {

    try {

        const resultado =
            await pool.query(
                `
                SELECT
                    emprestimos.id,
                    emprestimos.professor_id,
                    professores.nome AS professor,
                    emprestimos.turma_id,
                    turmas.nome AS turma,
                    emprestimos.quantidade,
                    emprestimos.tipo_equipamento,
                    emprestimos.finalidade,
                    emprestimos.data_retirada,
                    emprestimos.data_devolucao,
                    emprestimos.status

                FROM emprestimos

                INNER JOIN professores
                    ON emprestimos.professor_id =
                       professores.id

                LEFT JOIN turmas
                    ON emprestimos.turma_id =
                       turmas.id

                WHERE
                    emprestimos.status = 'ATIVO'

                ORDER BY
                    emprestimos.data_retirada DESC
                `
            );


        return res.status(200).json({

            emprestimos:
                resultado.rows,

            dados:
                resultado.rows

        });


    } catch (erro) {

        console.error(
            "[EMPRESTIMOS] Erro ao listar empréstimos ativos:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro ao carregar empréstimos ativos."
        });

    }

}


// ============================================================
// DEVOLVER EMPRÉSTIMO
// ============================================================

async function devolverEmprestimo(req, res) {

    const { id } = req.params;


    console.log("\n=================================");
    console.log("[DEVOLUÇÃO] Iniciando devolução");
    console.log("[DEVOLUÇÃO] ID recebido:", id);
    console.log("=================================");


    try {

        if (
            !id ||
            Number.isNaN(Number(id))
        ) {

            console.log(
                "[DEVOLUÇÃO] ID inválido."
            );


            return res.status(400).json({
                mensagem:
                    "ID do empréstimo inválido."
            });

        }


        console.log(
            "[DEVOLUÇÃO] Procurando empréstimo no banco..."
        );


        const consulta =
            await pool.query(
                `
                SELECT
                    id,
                    quantidade,
                    tipo_equipamento,
                    finalidade,
                    status
                FROM emprestimos
                WHERE id = $1
                `,
                [id]
            );


        console.log(
            "[DEVOLUÇÃO] Resultado da busca:",
            consulta.rows
        );


        if (
            consulta.rows.length === 0
        ) {

            console.log(
                "[DEVOLUÇÃO] Empréstimo não encontrado."
            );


            return res.status(404).json({
                mensagem:
                    "Empréstimo não encontrado."
            });

        }


        const emprestimo =
            consulta.rows[0];


        console.log(
            "[DEVOLUÇÃO] Status atual:",
            emprestimo.status
        );


        if (
            emprestimo.status !== "ATIVO"
        ) {

            console.log(
                "[DEVOLUÇÃO] Empréstimo já foi devolvido."
            );


            return res.status(400).json({
                mensagem:
                    "Este empréstimo já foi devolvido."
            });

        }


        console.log(
            "[DEVOLUÇÃO] Atualizando banco..."
        );


        const resultado =
            await pool.query(
                `
                UPDATE emprestimos
                SET
                    status = 'DEVOLVIDO',
                    data_devolucao = CURRENT_TIMESTAMP
                WHERE
                    id = $1
                    AND status = 'ATIVO'
                RETURNING
                    id,
                    quantidade,
                    tipo_equipamento,
                    finalidade,
                    status,
                    data_devolucao
                `,
                [id]
            );


        console.log(
            "[DEVOLUÇÃO] Resultado do UPDATE:",
            resultado.rows
        );


        if (
            resultado.rows.length === 0
        ) {

            console.log(
                "[DEVOLUÇÃO] UPDATE não alterou nenhum registro."
            );


            return res.status(400).json({
                mensagem:
                    "Não foi possível registrar a devolução."
            });

        }


        console.log(
            "[DEVOLUÇÃO] Devolução registrada no banco com sucesso."
        );


        return res.status(200).json({

            mensagem:
                "Devolução registrada com sucesso.",

            emprestimo:
                resultado.rows[0]

        });


    } catch (erro) {

        console.error(
            "[DEVOLUÇÃO] ERRO:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro ao registrar a devolução."
        });

    }

}


// ============================================================
// VERIFICAR DISPONIBILIDADE
// ============================================================

async function verificarDisponibilidade(req, res) {

    try {

        const tipo =
            validarTipoEquipamento(
                req.query.tipo_equipamento ||
                "CHROMEBOOK"
            );


        if (!tipo) {

            return res.status(400).json({
                mensagem:
                    "Tipo de equipamento inválido."
            });

        }


        // --------------------------------------------------------
        // BUSCAR CONFIGURAÇÃO
        // --------------------------------------------------------

        const configuracao =
            await pool.query(
                `
                SELECT
                    total_chromebooks,
                    total_tablets
                FROM configuracoes
                LIMIT 1
                `
            );


        if (
            configuracao.rows.length === 0
        ) {

            return res.status(500).json({
                mensagem:
                    "Configuração dos equipamentos não encontrada."
            });

        }


        const config =
            configuracao.rows[0];


        let total = 0;


        if (
            tipo === "CHROMEBOOK"
        ) {

            total =
                Number(
                    config.total_chromebooks
                ) || 0;

        }


        if (
            tipo === "TABLET"
        ) {

            total =
                Number(
                    config.total_tablets
                ) || 0;

        }


        // --------------------------------------------------------
        // BUSCAR EQUIPAMENTOS EMPRESTADOS
        // --------------------------------------------------------

        const emprestados =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(quantidade),
                        0
                    ) AS total

                FROM emprestimos

                WHERE
                    tipo_equipamento = $1
                    AND status = 'ATIVO'
                `,
                [tipo]
            );


        const quantidadeEmprestada =
            Number(
                emprestados.rows[0].total
            ) || 0;


        const disponivel =
            Math.max(
                total -
                quantidadeEmprestada,
                0
            );


        console.log(
            `[EMPRESTIMOS] Disponibilidade ${tipo}:`,
            {
                total,
                emprestados:
                    quantidadeEmprestada,
                disponivel
            }
        );


        return res.status(200).json({

            tipo_equipamento:
                tipo,

            total,

            emprestados:
                quantidadeEmprestada,

            disponivel

        });


    } catch (erro) {

        console.error(
            "[EMPRESTIMOS] Erro ao verificar disponibilidade:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro ao verificar disponibilidade."
        });

    }

}


// ============================================================
// EXPORTAÇÕES
// ============================================================

module.exports = {
    criarEmprestimo,
    listarEmprestimos,
    listarEmprestimosAtivos,
    devolverEmprestimo,
    verificarDisponibilidade
};