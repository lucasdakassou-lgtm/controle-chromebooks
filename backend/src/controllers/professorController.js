const pool = require('../database/database');


// ==============================
// CRIAR PROFESSOR
// ==============================
const criarProfessor = async (req, res) => {

    console.log('📥 Tentativa de criar professor');
    console.log('Dados recebidos:', req.body);

    try {

        const { nome, email } = req.body;

        // Validação
        if (!nome || nome.trim() === '') {
            console.warn('⚠️ Tentativa de cadastrar professor sem nome');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O nome do professor é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO professores (nome, email)
             VALUES ($1, $2)
             RETURNING *`,
            [nome.trim(), email || null]
        );

        console.log('✅ Professor criado:', resultado.rows[0]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Professor criado com sucesso!',
            professor: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO CRIAR PROFESSOR');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao criar professor.'
        });

    }
};


// ==============================
// LISTAR PROFESSORES
// ==============================
const listarProfessores = async (req, res) => {

    console.log('📋 Buscando lista de professores...');

    try {

        const resultado = await pool.query(
            'SELECT * FROM professores ORDER BY nome ASC'
        );

        console.log(`✅ ${resultado.rows.length} professores encontrados`);

        res.status(200).json({
            sucesso: true,
            total: resultado.rows.length,
            professores: resultado.rows
        });

    } catch (erro) {

        console.error('❌ ERRO AO LISTAR PROFESSORES');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar professores.'
        });

    }
};


// ==============================
// BUSCAR PROFESSOR POR ID
// ==============================
const buscarProfessorPorId = async (req, res) => {

    const { id } = req.params;

    console.log(`🔍 Buscando professor ID: ${id}`);

    try {

        // Verifica se o ID é número
        if (isNaN(id)) {

            console.warn('⚠️ ID inválido recebido:', id);

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O ID precisa ser um número.'
            });
        }

        const resultado = await pool.query(
            'SELECT * FROM professores WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {

            console.warn(`⚠️ Professor ID ${id} não encontrado`);

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Professor não encontrado.'
            });
        }

        console.log('✅ Professor encontrado:', resultado.rows[0].nome);

        res.status(200).json({
            sucesso: true,
            professor: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO BUSCAR PROFESSOR');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar professor.'
        });

    }
};


// ==============================
// EDITAR PROFESSOR
// ==============================
const atualizarProfessor = async (req, res) => {

    const { id } = req.params;
    const { nome, email } = req.body;

    console.log(`✏️ Tentativa de atualizar professor ID: ${id}`);

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
                mensagem: 'O nome é obrigatório.'
            });
        }

        const resultado = await pool.query(
            `UPDATE professores
             SET nome = $1, email = $2
             WHERE id = $3
             RETURNING *`,
            [nome.trim(), email || null, id]
        );

        if (resultado.rows.length === 0) {

            console.warn(`⚠️ Professor ID ${id} não encontrado`);

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Professor não encontrado.'
            });
        }

        console.log('✅ Professor atualizado:', resultado.rows[0]);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Professor atualizado com sucesso!',
            professor: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO ATUALIZAR PROFESSOR');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar professor.'
        });

    }
};


// ==============================
// DELETAR PROFESSOR
// ==============================
const deletarProfessor = async (req, res) => {

    const { id } = req.params;

    console.log(`🗑️ Tentativa de excluir professor ID: ${id}`);

    try {

        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const resultado = await pool.query(
            'DELETE FROM professores WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {

            console.warn(`⚠️ Professor ID ${id} não encontrado`);

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Professor não encontrado.'
            });
        }

        console.log('🗑️ Professor excluído:', resultado.rows[0]);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Professor excluído com sucesso!',
            professor: resultado.rows[0]
        });

    } catch (erro) {

        console.error('❌ ERRO AO EXCLUIR PROFESSOR');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao excluir professor.'
        });

    }
};


module.exports = {
    criarProfessor,
    listarProfessores,
    buscarProfessorPorId,
    atualizarProfessor,
    deletarProfessor
};