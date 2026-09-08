const notFoundMiddleware = (req, res) => {

    console.warn('⚠️ Rota não encontrada:', req.method, req.originalUrl);

    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada.'
    });
};

module.exports = notFoundMiddleware;