const pool = require('../database/database');


// ==========================================
// CRIAR OCORRÊNCIA
// ==========================================

const criarOcorrencia = async (req, res) => {

    console.log('🚨 Nova ocorrência recebida');
    console.log('Dados:', req.body);

    try {

        const {
            professor_id,
            sala,
            tipo,
            descricao,
            responsavel
        } = req.body;


        // ==========================
        // VALIDAÇÕES
        // ==========================

        if (!sala || !tipo || !descricao) {

            console.warn('⚠️ Campos obrigatórios faltando');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Sala, tipo e descrição são obrigatórios.'
            });

        }


        // Validar professor caso tenha sido informado
        if (professor_id) {

            const professor = await pool.query(
                'SELECT id FROM professores WHERE id = $1',
                [professor_id]
            );

            if (professor.rows.length === 0) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Professor não encontrado.'
                });

            }

        }


        // ==========================
        // CRIAR OCORRÊNCIA
        // ==========================

        const resultado = await pool.query(

            `
            INSERT INTO ocorrencias
            (
                professor_id,
                sala,
                tipo,
                descricao,
                responsavel
            )

            VALUES ($1, $2, $3, $4, $5)

            RETURNING *
            `,

            [
                professor_id || null,
                sala.trim(),
                tipo.trim().toUpperCase(),
                descricao.trim(),
                responsavel || null
            ]

        );


        console.log('✅ OCORRÊNCIA CRIADA');
        console.log('ID:', resultado.rows[0].id);


        res.status(201).json({

            sucesso: true,

            mensagem: 'Ocorrência registrada com sucesso!',

            ocorrencia: resultado.rows[0]

        });

    } catch (erro) {

        console.error('❌ ERRO AO CRIAR OCORRÊNCIA');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao registrar ocorrência.'
        });

    }

};


// ==========================================
// LISTAR TODAS AS OCORRÊNCIAS
// ==========================================

const listarOcorrencias = async (req, res) => {

    console.log('📋 Buscando ocorrências...');

    try {

        const resultado = await pool.query(

            `
            SELECT

                ocorrencias.id,

                professores.nome AS professor,

                ocorrencias.sala,

                ocorrencias.tipo,

                ocorrencias.descricao,

                ocorrencias.data_abertura,

                ocorrencias.status,

                ocorrencias.responsavel,

                ocorrencias.data_resolucao

            FROM ocorrencias

            LEFT JOIN professores
                ON ocorrencias.professor_id = professores.id

            ORDER BY ocorrencias.data_abertura DESC
            `

        );


        console.log(
            `✅ ${resultado.rows.length} ocorrências encontradas`
        );


        res.status(200).json({

            sucesso: true,

            total: resultado.rows.length,

            ocorrencias: resultado.rows

        });

    } catch (erro) {

        console.error('❌ ERRO AO LISTAR OCORRÊNCIAS');
        console.error('Mensagem:', erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar ocorrências.'
        });

    }

};


// ==========================================
// BUSCAR OCORRÊNCIA POR ID
// ==========================================

const buscarOcorrenciaPorId = async (req, res) => {

    const { id } = req.params;

    console.log(`🔍 Buscando ocorrência ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });

        }


        const resultado = await pool.query(

            `
            SELECT

                ocorrencias.*,

                professores.nome AS professor

            FROM ocorrencias

            LEFT JOIN professores
                ON ocorrencias.professor_id = professores.id

            WHERE ocorrencias.id = $1
            `,

            [id]

        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ocorrência não encontrada.'
            });

        }


        res.status(200).json({

            sucesso: true,

            ocorrencia: resultado.rows[0]

        });

    } catch (erro) {

        console.error('❌ ERRO AO BUSCAR OCORRÊNCIA');
        console.error(erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar ocorrência.'
        });

    }

};


// ==========================================
// ATUALIZAR OCORRÊNCIA
// ==========================================

const atualizarOcorrencia = async (req, res) => {

    const { id } = req.params;

    const {
        sala,
        tipo,
        descricao,
        responsavel,
        status
    } = req.body;


    console.log(`✏️ Atualizando ocorrência ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });

        }


        const resultado = await pool.query(

            `
            UPDATE ocorrencias

            SET

                sala = COALESCE($1, sala),

                tipo = COALESCE($2, tipo),

                descricao = COALESCE($3, descricao),

                responsavel = COALESCE($4, responsavel),

                status = COALESCE($5, status)

            WHERE id = $6

            RETURNING *
            `,

            [
                sala,
                tipo,
                descricao,
                responsavel,
                status,
                id
            ]

        );


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ocorrência não encontrada.'
            });

        }


        console.log('✅ Ocorrência atualizada');


        res.status(200).json({

            sucesso: true,

            mensagem: 'Ocorrência atualizada com sucesso!',

            ocorrencia: resultado.rows[0]

        });

    } catch (erro) {

        console.error('❌ ERRO AO ATUALIZAR OCORRÊNCIA');
        console.error(erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar ocorrência.'
        });

    }

};


// ==========================================
// RESOLVER OCORRÊNCIA
// ==========================================

const resolverOcorrencia = async (req, res) => {

    const { id } = req.params;

    console.log(`🔧 Resolvendo ocorrência ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });

        }


        // Verifica se existe
        const ocorrencia = await pool.query(

            'SELECT * FROM ocorrencias WHERE id = $1',

            [id]

        );


        if (ocorrencia.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ocorrência não encontrada.'
            });

        }


        // Verifica se já foi resolvida
        if (ocorrencia.rows[0].status === 'RESOLVIDA') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Esta ocorrência já foi resolvida.'
            });

        }


        // Atualiza
        const resultado = await pool.query(

            `
            UPDATE ocorrencias

            SET

                status = 'RESOLVIDA',

                data_resolucao = CURRENT_TIMESTAMP

            WHERE id = $1

            RETURNING *
            `,

            [id]

        );


        console.log('✅ OCORRÊNCIA RESOLVIDA');


        res.status(200).json({

            sucesso: true,

            mensagem: 'Ocorrência marcada como resolvida!',

            ocorrencia: resultado.rows[0]

        });

    } catch (erro) {

        console.error('❌ ERRO AO RESOLVER OCORRÊNCIA');
        console.error(erro.message);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao resolver ocorrência.'
        });

    }

};


module.exports = {

    criarOcorrencia,

    listarOcorrencias,

    buscarOcorrenciaPorId,

    atualizarOcorrencia,

    resolverOcorrencia

};