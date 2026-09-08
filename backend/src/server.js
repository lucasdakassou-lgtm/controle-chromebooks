const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('');
    console.log('=================================');
    console.log('🚀 SERVIDOR SISTEMA PROATI');
    console.log('=================================');
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🧪 Teste: http://localhost:${PORT}/teste-banco`);
    console.log('=================================');
    console.log('');
});