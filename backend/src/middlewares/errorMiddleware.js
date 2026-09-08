const errorMiddleware = (erro, req, res, next) => {

    console.error('');
    console.error('=================================');
    console.error('❌ ERRO GLOBAL DETECTADO');
    console.error('=================================');
    console.error('Mensagem:', erro.message);
    console.error('Código:', erro.code || 'Não informado');
    console.error('Rota:', req.method, req.originalUrl);
    console.error('=================================');

    res.status(500).json({
        sucesso: false,
        mensagem: 'Ocorreu um erro interno no servidor.'
    });
};

module.exports = errorMiddleware;