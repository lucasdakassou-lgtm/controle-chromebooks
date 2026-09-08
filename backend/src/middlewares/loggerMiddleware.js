const loggerMiddleware = (req, res, next) => {

    const data = new Date().toLocaleString();

    console.log('');
    console.log('=================================');
    console.log('📥 NOVA REQUISIÇÃO');
    console.log('=================================');
    console.log(`🕒 Data: ${data}`);
    console.log(`📌 Método: ${req.method}`);
    console.log(`🔗 Rota: ${req.originalUrl}`);
    console.log(`🌐 IP: ${req.ip}`);
    console.log('=================================');

    next();
};

module.exports = loggerMiddleware;