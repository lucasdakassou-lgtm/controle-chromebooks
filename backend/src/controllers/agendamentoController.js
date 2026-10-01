const pool = require('../database/database');

// =========================================================
// CONFIGURAÇÕES DO MÓDULO
// =========================================================

// Salas que podem ser utilizadas no sistema
const SALAS = [
    'Laboratório Seco',
    'Sala de Vídeo',
    'Sala de Leitura',
    'Sala de Informática',
    'Sala de Apoio',
    'Laboratório Úmido'
];

// Horários oficiais das aulas
const HORARIOS_AULAS = {
    1: { inicio: '07:30', fim: '08:20' },
    2: { inicio: '08:20', fim: '09:10' },
    3: { inicio: '09:30', fim: '10:20' },
    4: { inicio: '10:20', fim: '11:10' },
    5: { inicio: '11:10', fim: '12:00' },
    6: { inicio: '13:00', fim: '13:50' },
    7: { inicio: '13:50', fim: '14:40' },
    8: { inicio: '15:00', fim: '15:50' },
    9: { inicio: '15:50', fim: '16:40' }
};


// =========================================================
// AUXILIAR — DESCOBRIR DIA DA SEMANA
// =========================================================

const obterDiaSemana = (data) => {

    const dataObj = new Date(`${data}T12:00:00`);

    const dias = [
        'DOMINGO',
        'SEGUNDA',
        'TERCA',
        'QUARTA',
        'QUINTA',
        'SEXTA',
        'SABADO'
    ];

    return dias[dataObj.getDay()];
};


// =========================================================
// AUXILIAR — DATA ATUAL DO BRASIL
// =========================================================

const obterDataAtualBrasil = () => {

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
};


// =========================================================
// AUXILIAR — HORA ATUAL DO BRASIL
// =========================================================

const obterHoraAtualBrasil = () => {

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date());
};


// =========================================================
// GET /agendamentos
// LISTAR TODOS OS AGENDAMENTOS
// =========================================================

const listarAgendamentos = async (req, res) => {

    console.log('Listando agendamentos...');

    try {

        const resultado = await pool.query(`
            SELECT
                a.id,
                a.data,
                a.aula,
                a.sala,
                a.hora_inicio,
                a.hora_fim,
                a.status,
                a.observacao,

                p.id AS professor_id,
                p.nome AS professor,

                t.id AS turma_id,
                t.nome AS turma

            FROM agendamentos a

            INNER JOIN professores p
                ON p.id = a.professor_id

            INNER JOIN turmas t
                ON t.id = a.turma_id

            ORDER BY
                a.data ASC,
                a.aula ASC,
                a.sala ASC
        `);

        console.log(
            `${resultado.rows.length} agendamento(s) encontrado(s).`
        );

        return res.status(200).json({
            sucesso: true,
            total: resultado.rows.length,
            agendamentos: resultado.rows
        });

    } catch (erro) {

        console.error('ERRO AO LISTAR AGENDAMENTOS');
        console.error(erro.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar agendamentos.'
        });
    }
};


// =========================================================
// GET /agendamentos/:id
// BUSCAR AGENDAMENTO POR ID
// =========================================================

const buscarAgendamentoPorId = async (req, res) => {

    const { id } = req.params;

    console.log(`Buscando agendamento ID: ${id}`);

    try {

        if (isNaN(id)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const resultado = await pool.query(`
            SELECT
                a.id,
                a.data,
                a.aula,
                a.sala,
                a.hora_inicio,
                a.hora_fim,
                a.status,
                a.observacao,

                p.id AS professor_id,
                p.nome AS professor,

                t.id AS turma_id,
                t.nome AS turma

            FROM agendamentos a

            INNER JOIN professores p
                ON p.id = a.professor_id

            INNER JOIN turmas t
                ON t.id = a.turma_id

            WHERE a.id = $1
        `, [id]);

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Agendamento não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            agendamento: resultado.rows[0]
        });

    } catch (erro) {

        console.error('ERRO AO BUSCAR AGENDAMENTO');
        console.error(erro.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar agendamento.'
        });
    }
};


// =========================================================
// POST /agendamentos
// CRIAR NOVO AGENDAMENTO
// =========================================================

const criarAgendamento = async (req, res) => {

    const {
        professor_id,
        turma_id,
        data,
        sala,
        aula,
        observacao
    } = req.body;

    console.log('');
    console.log('==========================================');
    console.log('NOVA TENTATIVA DE AGENDAMENTO');
    console.log('==========================================');
    console.log('Dados recebidos:', req.body);

    try {

        // -------------------------------------------------
        // 1. VALIDAR CAMPOS OBRIGATÓRIOS
        // -------------------------------------------------

        if (
            !professor_id ||
            !turma_id ||
            !data ||
            !sala ||
            !aula
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Professor, turma, data, sala e aula são obrigatórios.'
            });
        }


        // -------------------------------------------------
        // 2. VALIDAR SALA
        // -------------------------------------------------

        if (!SALAS.includes(sala)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Sala inválida.'
            });
        }


        // -------------------------------------------------
        // 3. VALIDAR AULA
        // -------------------------------------------------

        const numeroAula = Number(aula);

        if (
            !Number.isInteger(numeroAula) ||
            numeroAula < 1 ||
            numeroAula > 9
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'A aula deve estar entre 1 e 9.'
            });
        }


        // -------------------------------------------------
        // 4. DESCOBRIR O HORÁRIO DA AULA
        // -------------------------------------------------

        const horario = HORARIOS_AULAS[numeroAula];

        console.log(
            `Aula ${numeroAula}: ${horario.inicio} - ${horario.fim}`
        );


        // -------------------------------------------------
        // 5. VALIDAR DATA E HORÁRIO
        // -------------------------------------------------

        const dataAtualBrasil = obterDataAtualBrasil();
        const horaAtualBrasil = obterHoraAtualBrasil();

        console.log('Data atual:', dataAtualBrasil);
        console.log('Hora atual:', horaAtualBrasil);
        console.log('Data selecionada:', data);


        // Data anterior ao dia atual
        if (data < dataAtualBrasil) {

            console.log('Agendamento bloqueado: data passada.');

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não é possível realizar agendamentos para datas passadas.'
            });
        }


        // Se for hoje, verificar se a aula já começou
        if (data === dataAtualBrasil) {

            if (horario.inicio <= horaAtualBrasil) {

                console.log(
                    `Agendamento bloqueado: a ${numeroAula}ª aula já começou.`
                );

                return res.status(400).json({
                    sucesso: false,
                    mensagem: `A ${numeroAula}ª aula já começou. Selecione uma aula futura.`
                });
            }
        }


        // -------------------------------------------------
        // 6. DESCOBRIR O DIA DA SEMANA
        // -------------------------------------------------

        const diaSemana = obterDiaSemana(data);

        console.log(`Dia da semana: ${diaSemana}`);


        // -------------------------------------------------
        // 7. NÃO PERMITIR FIM DE SEMANA
        // -------------------------------------------------

        if (
            diaSemana === 'SABADO' ||
            diaSemana === 'DOMINGO'
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Agendamentos só podem ser realizados de segunda a sexta.'
            });
        }


        // -------------------------------------------------
        // 8. VERIFICAR SE O TÉCNICO OCUPA O HORÁRIO
        // -------------------------------------------------

        const bloqueio = await pool.query(`
            SELECT
                hb.id,
                hb.dia_semana,
                hb.aula,
                hb.sala,
                hb.hora_inicio,
                hb.hora_fim,
                hb.descricao

            FROM horarios_bloqueados hb

            WHERE hb.dia_semana = $1
              AND hb.aula = $2
              AND hb.sala = $3

            LIMIT 1
        `, [
            diaSemana,
            numeroAula,
            sala
        ]);


        if (bloqueio.rows.length > 0) {

            console.log(
                'Horário bloqueado pelo Técnico.'
            );

            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este horário está reservado para o Técnico.',
                bloqueio: bloqueio.rows[0]
            });
        }


        // -------------------------------------------------
        // 9. VERIFICAR SE JÁ EXISTE AGENDAMENTO
        // -------------------------------------------------

        const conflito = await pool.query(`
            SELECT id
            FROM agendamentos

            WHERE data = $1
              AND sala = $2
              AND aula = $3
              AND status = 'AGENDADO'

            LIMIT 1
        `, [
            data,
            sala,
            numeroAula
        ]);


        if (conflito.rows.length > 0) {

            console.log(
                'Horário já possui agendamento.'
            );

            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este horário já está reservado.'
            });
        }


        // -------------------------------------------------
        // 10. VERIFICAR PROFESSOR
        // -------------------------------------------------

        const professor = await pool.query(`
            SELECT id, nome
            FROM professores
            WHERE id = $1
        `, [professor_id]);


        if (professor.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Professor não encontrado.'
            });
        }


        // -------------------------------------------------
        // 11. VERIFICAR TURMA
        // -------------------------------------------------

        const turma = await pool.query(`
            SELECT id, nome
            FROM turmas
            WHERE id = $1
        `, [turma_id]);


        if (turma.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Turma não encontrada.'
            });
        }


        // -------------------------------------------------
        // 12. CRIAR AGENDAMENTO
        // -------------------------------------------------

        const resultado = await pool.query(`
            INSERT INTO agendamentos (
                professor_id,
                turma_id,
                data,
                sala,
                aula,
                hora_inicio,
                hora_fim,
                status,
                observacao
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                'AGENDADO',
                $8
            )

            RETURNING *
        `, [
            professor_id,
            turma_id,
            data,
            sala,
            numeroAula,
            horario.inicio,
            horario.fim,
            observacao || null
        ]);


        console.log('AGENDAMENTO CRIADO');
        console.log('ID:', resultado.rows[0].id);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Agendamento criado com sucesso!',
            agendamento: resultado.rows[0]
        });

    } catch (erro) {

        console.error('ERRO AO CRIAR AGENDAMENTO');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar agendamento.'
        });
    }
};


// =========================================================
// DELETE /agendamentos/:id
// EXCLUIR AGENDAMENTO
// =========================================================

async function excluirAgendamento(req, res, next) {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            "DELETE FROM agendamentos WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rowCount === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Agendamento não encontrado."
            });
        }

        console.log(
            `[AGENDAMENTOS] Agendamento ${id} excluído.`
        );

        return res.json({
            sucesso: true,
            mensagem: "Agendamento excluído com sucesso."
        });

    } catch (erro) {

        next(erro);
    }
}


// =========================================================
// EXPORTAÇÕES
// =========================================================

module.exports = {
    listarAgendamentos,
    buscarAgendamentoPorId,
    criarAgendamento,
    excluirAgendamento
};