const pool = require('../database/database');


// ==============================
// CRIAR TURMA
// ==============================
const criarTurma = async (req, res) => {

    console.log('📥 Tentativa de criar turma');
    console.log('Dados recebidos:', req.body);

    try {

        const { nome } = req.body;

        // Validação
        if (!nome || nome.trim() === '') {

            console.warn('⚠️ Tentativa de cadastrar turma sem nome');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O nome da turma é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO turmas (nome)
             VALUES ($1)
             RETURNING *`,
            [nome.trim()]
        );

        console.log('✅ Turma criada:', resultado.rows[0]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Turma criada com sucesso!',
            turma: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO CRIAR TURMA');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao criar turma.'
        });

    }
};


// ==============================
// LISTAR TURMAS
// ==============================
const listarTurmas = async (req, res) => {

    console.log('📋 Buscando lista de turmas...');

    try {

        const resultado = await pool.query(
            'SELECT * FROM turmas ORDER BY nome ASC'
        );

        console.log(`✅ ${resultado.rows.length} turmas encontradas`);

        res.status(200).json({
            sucesso: true,
            total: resultado.rows.length,
            turmas: resultado.rows
        });

    } catch (erro) {

        console.error('❌ ERRO AO LISTAR TURMAS');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar turmas.'
        });

    }
};


// ==============================
// BUSCAR TURMA POR ID
// ==============================
const buscarTurmaPorId = async (req, res) => {

    const { id } = req.params;

    console.log(`🔍 Buscando turma ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O ID precisa ser um número.'
            });
        }

        const resultado = await pool.query(
            'SELECT * FROM turmas WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {

            console.warn(`⚠️ Turma ID ${id} não encontrada`);

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Turma não encontrada.'
            });
        }

        console.log('✅ Turma encontrada:', resultado.rows[0].nome);

        res.status(200).json({
            sucesso: true,
            turma: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO BUSCAR TURMA');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar turma.'
        });

    }
};


// ==============================
// ATUALIZAR TURMA
// ==============================
const atualizarTurma = async (req, res) => {

    const { id } = req.params;
    const { nome } = req.body;

    console.log(`✏️ Tentativa de atualizar turma ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        if (!nome || nome.trim() === '') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O nome da turma é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `UPDATE turmas
             SET nome = $1
             WHERE id = $2
             RETURNING *`,
            [nome.trim(), id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Turma não encontrada.'
            });
        }

        console.log('✅ Turma atualizada:', resultado.rows[0]);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Turma atualizada com sucesso!',
            turma: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO ATUALIZAR TURMA');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar turma.'
        });

    }
};


// ==============================
// DELETAR TURMA
// ==============================
const deletarTurma = async (req, res) => {

    const { id } = req.params;

    console.log(`🗑️ Tentativa de excluir turma ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const resultado = await pool.query(
            'DELETE FROM turmas WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Turma não encontrada.'
            });
        }

        console.log('🗑️ Turma excluída:', resultado.rows[0]);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Turma excluída com sucesso!',
            turma: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO DELETAR TURMA');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao excluir turma.'
        });

    }
};


module.exports = {
    criarTurma,
    listarTurmas,
    buscarTurmaPorId,
    atualizarTurma,
    deletarTurma
};