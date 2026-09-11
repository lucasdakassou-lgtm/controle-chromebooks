const pool = require('../database/database');

const TOTAL_CHROMEBOOKS = 47;


// ==========================================
// VERIFICAR DISPONIBILIDADE DE CHROMEBOOKS
// ==========================================

const verificarDisponibilidade = async (req, res) => {

    console.log('💻 Verificando Chromebooks disponíveis...');

    try {

        // Soma todos os Chromebooks que estão em empréstimos ativos
        const resultado = await pool.query(`
            SELECT COALESCE(SUM(quantidade), 0) AS total_emprestado
            FROM emprestimos
            WHERE status = 'ATIVO'
        `);

        const totalEmprestado = Number(
            resultado.rows[0].total_emprestado
        );

        const disponiveis = TOTAL_CHROMEBOOKS - totalEmprestado;

        console.log('📊 Total de Chromebooks:', TOTAL_CHROMEBOOKS);
        console.log('📤 Emprestados:', totalEmprestado);
        console.log('💻 Disponíveis:', disponiveis);

        res.status(200).json({
            sucesso: true,
            totalChromebooks: TOTAL_CHROMEBOOKS,
            emprestados: totalEmprestado,
            disponiveis: disponiveis
        });

    } catch (erro) {

        console.error('❌ ERRO AO VERIFICAR DISPONIBILIDADE');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao verificar disponibilidade.'
        });

    }

};


// ==========================================
// CRIAR EMPRÉSTIMO
// ==========================================

const criarEmprestimo = async (req, res) => {

    console.log('📥 Nova tentativa de empréstimo');
    console.log('Dados recebidos:', req.body);

    try {

        const {
            professor_id,
            turma_id,
            quantidade
        } = req.body;


        // --------------------------
        // VALIDAÇÕES
        // --------------------------

        if (!professor_id || !turma_id || !quantidade) {

            console.warn('⚠️ Dados obrigatórios faltando');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Professor, turma e quantidade são obrigatórios.'
            });
        }


        if (
            isNaN(professor_id) ||
            isNaN(turma_id) ||
            isNaN(quantidade)
        ) {

            console.warn('⚠️ Dados inválidos recebidos');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Os dados devem ser números válidos.'
            });
        }


        if (Number(quantidade) <= 0) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'A quantidade deve ser maior que zero.'
            });
        }


        if (Number(quantidade) > TOTAL_CHROMEBOOKS) {

            return res.status(400).json({
                sucesso: false,
                mensagem: `Não existem ${quantidade} Chromebooks disponíveis no sistema.`
            });
        }


        // --------------------------
        // VERIFICAR PROFESSOR
        // --------------------------

        const professor = await pool.query(
            'SELECT id, nome FROM professores WHERE id = $1',
            [professor_id]
        );


        if (professor.rows.length === 0) {

            console.warn(
                `⚠️ Professor ID ${professor_id} não encontrado`
            );

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Professor não encontrado.'
            });
        }


        // --------------------------
        // VERIFICAR TURMA
        // --------------------------

        const turma = await pool.query(
            'SELECT id, nome FROM turmas WHERE id = $1',
            [turma_id]
        );


        if (turma.rows.length === 0) {

            console.warn(
                `⚠️ Turma ID ${turma_id} não encontrada`
            );

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Turma não encontrada.'
            });
        }


        // --------------------------
        // CALCULAR DISPONIBILIDADE
        // --------------------------

        const resultadoEmprestados = await pool.query(`
            SELECT COALESCE(SUM(quantidade), 0) AS total_emprestado
            FROM emprestimos
            WHERE status = 'ATIVO'
        `);


        const totalEmprestado = Number(
            resultadoEmprestados.rows[0].total_emprestado
        );


        const disponiveis = TOTAL_CHROMEBOOKS - totalEmprestado;


        console.log('📊 Chromebooks emprestados:', totalEmprestado);
        console.log('💻 Chromebooks disponíveis:', disponiveis);


        // --------------------------
        // VERIFICAR ESTOQUE
        // --------------------------

        if (Number(quantidade) > disponiveis) {

            console.warn(
                `⚠️ Empréstimo bloqueado. Pedido: ${quantidade} | Disponível: ${disponiveis}`
            );

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não há Chromebooks suficientes disponíveis.',
                disponiveis: disponiveis,
                solicitado: Number(quantidade)
            });
        }


        // --------------------------
        // CRIAR EMPRÉSTIMO
        // --------------------------

        const novoEmprestimo = await pool.query(
            `
            INSERT INTO emprestimos
            (
                professor_id,
                turma_id,
                quantidade,
                status
            )

            VALUES ($1, $2, $3, 'ATIVO')

            RETURNING *
            `,
            [
                professor_id,
                turma_id,
                Number(quantidade)
            ]
        );


        console.log('✅ EMPRÉSTIMO CRIADO COM SUCESSO');
        console.log('Professor:', professor.rows[0].nome);
        console.log('Turma:', turma.rows[0].nome);
        console.log('Quantidade:', quantidade);


        res.status(201).json({

            sucesso: true,

            mensagem: 'Empréstimo registrado com sucesso!',

            emprestimo: novoEmprestimo.rows[0],

            chromebooksRestantes:
                disponiveis - Number(quantidade)

        });

    } catch (erro) {

        console.error('');
        console.error('❌ ERRO AO CRIAR EMPRÉSTIMO');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);
        console.error('Detalhes:', erro.detail);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao registrar empréstimo.'
        });

    }

};


// ==========================================
// LISTAR TODOS OS EMPRÉSTIMOS
// ==========================================

const listarEmprestimos = async (req, res) => {

    console.log('📋 Buscando histórico de empréstimos...');

    try {

        const resultado = await pool.query(`

            SELECT

                emprestimos.id,

                professores.nome AS professor,

                turmas.nome AS turma,

                emprestimos.quantidade,

                emprestimos.data_retirada,

                emprestimos.data_devolucao,

                emprestimos.status

            FROM emprestimos

            JOIN professores
                ON emprestimos.professor_id = professores.id

            JOIN turmas
                ON emprestimos.turma_id = turmas.id

            ORDER BY emprestimos.data_retirada DESC

        `);


        console.log(
            `✅ ${resultado.rows.length} empréstimos encontrados`
        );


        res.status(200).json({

            sucesso: true,

            total: resultado.rows.length,

            emprestimos: resultado.rows

        });

    } catch (erro) {

        console.error('❌ ERRO AO LISTAR EMPRÉSTIMOS');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar empréstimos.'
        });

    }

};


// ==========================================
// LISTAR EMPRÉSTIMOS ATIVOS
// ==========================================

const listarEmprestimosAtivos = async (req, res) => {

    console.log('📋 Buscando empréstimos ativos...');

    try {

        const resultado = await pool.query(`

            SELECT

                emprestimos.id,

                professores.nome AS professor,

                turmas.nome AS turma,

                emprestimos.quantidade,

                emprestimos.data_retirada,

                emprestimos.status

            FROM emprestimos

            JOIN professores
                ON emprestimos.professor_id = professores.id

            JOIN turmas
                ON emprestimos.turma_id = turmas.id

            WHERE emprestimos.status = 'ATIVO'

            ORDER BY emprestimos.data_retirada DESC

        `);


        console.log(
            `⚠️ ${resultado.rows.length} empréstimos ativos`
        );


        res.status(200).json({

            sucesso: true,

            total: resultado.rows.length,

            emprestimos: resultado.rows

        });

    } catch (erro) {

        console.error('❌ ERRO AO BUSCAR EMPRÉSTIMOS ATIVOS');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar empréstimos ativos.'
        });

    }

};


// ==========================================
// DEVOLVER CHROMEBOOKS
// ==========================================

const devolverEmprestimo = async (req, res) => {

    const { id } = req.params;

    console.log(`📥 Tentativa de devolução do empréstimo ID: ${id}`);

    try {

        // Validar ID
        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do empréstimo inválido.'
            });

        }


        // Verificar se empréstimo existe
        const emprestimo = await pool.query(
            'SELECT * FROM emprestimos WHERE id = $1',
            [id]
        );


        if (emprestimo.rows.length === 0) {

            console.warn(
                `⚠️ Empréstimo ID ${id} não encontrado`
            );

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Empréstimo não encontrado.'
            });

        }


        // Verificar se já foi devolvido
        if (emprestimo.rows[0].status === 'DEVOLVIDO') {

            console.warn(
                `⚠️ Empréstimo ID ${id} já foi devolvido`
            );

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este empréstimo já foi devolvido.'
            });

        }


        // Registrar devolução
        const resultado = await pool.query(

            `
            UPDATE emprestimos

            SET

                status = 'DEVOLVIDO',

                data_devolucao = CURRENT_TIMESTAMP

            WHERE id = $1

            RETURNING *
            `,

            [id]

        );


        console.log('✅ DEVOLUÇÃO REGISTRADA');
        console.log('Empréstimo ID:', id);


        res.status(200).json({

            sucesso: true,

            mensagem: 'Chromebooks devolvidos com sucesso!',

            emprestimo: resultado.rows[0]

        });

    } catch (erro) {

        console.error('❌ ERRO AO REGISTRAR DEVOLUÇÃO');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao registrar devolução.'
        });

    }

};


module.exports = {

    criarEmprestimo,

    listarEmprestimos,

    listarEmprestimosAtivos,

    devolverEmprestimo,

    verificarDisponibilidade

};