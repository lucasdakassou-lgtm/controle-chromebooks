const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./database/database');
//rotas 
const professorRoutes = require('./routes/professorRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');

// middlewares 
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
//usar rotas 
app.use('/professores', professorRoutes);
app.use('/turmas', turmaRoutes);
app.use('/emprestimos', emprestimoRoutes);

app.get('/', (req, res) => {

    console.log('📡 Requisição recebida na rota principal');

    res.json({
        mensagem: 'API Sistema PROATI funcionando!'
    });
});


app.get('/teste-banco', async (req, res) => {

    console.log('🔄 Testando conexão com o PostgreSQL...');

    try {

        const resultado = await pool.query('SELECT NOW()');

        console.log('✅ Banco conectado com sucesso!');

        res.status(200).json({
            sucesso: true,
            mensagem: 'Banco conectado com sucesso!',
            horarioBanco: resultado.rows[0].now
        });

    } catch (erro) {

        console.error('❌ ERRO AO CONECTAR COM O BANCO');
        console.error('Mensagem:', erro.message);
        console.error('Código:', erro.code);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao conectar com o banco.'
        });

    }

});

module.exports = app;