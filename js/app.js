// Funções auxiliares globais

// Formatar valor monetário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Obter data de hoje no formato YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Obter data atual completa
function getCurrentDateTime() {
    return new Date().toISOString();
}

// Validar número
function isValidNumber(value) {
    return !isNaN(value) && value >= 0;
}

// Função para redirecionar se não autenticado
if (!window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        if (!checkAuth()) {
            window.location.href = 'index.html';
        }
    });
}

