// Lógica do Dashboard

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await updateDashboard();
});

async function updateDashboard() {
    try {
        // Buscar dados da API
        const [comandas, produtos, transacoes] = await Promise.all([
            getComandas(),
            getProducts(),
            getTransacoes()
        ]);
        
        // Calcular vendas do dia
        const today = getTodayDate();
        const vendasHoje = comandas
            .filter(c => {
                const comandaDate = c.data.split('T')[0];
                return comandaDate === today && c.status === 'finalizada';
            })
            .reduce((total, c) => total + c.valorTotal, 0);
        
        document.getElementById('vendasDia').textContent = formatCurrency(vendasHoje);
        
        // Contar comandas abertas
        const comandasAbertas = comandas.filter(c => c.status === 'aberta').length;
        document.getElementById('comandasAbertas').textContent = comandasAbertas;
        
        // Contar produtos em estoque
        const produtosEstoque = produtos
            .filter(p => p.estoque > 0)
            .reduce((total, p) => total + p.estoque, 0);
        document.getElementById('produtosEstoque').textContent = produtosEstoque;
        
        // Calcular saldo do mês
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const transacoesMes = transacoes.filter(t => {
            const transDate = new Date(t.data);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        const entradas = transacoesMes
            .filter(t => t.tipo === 'entrada')
            .reduce((total, t) => total + t.valor, 0);
        
        const saidas = transacoesMes
            .filter(t => t.tipo === 'saida')
            .reduce((total, t) => total + t.valor, 0);
        
        const saldoMes = entradas - saidas;
        const saldoElement = document.getElementById('saldoMes');
        saldoElement.textContent = formatCurrency(saldoMes);
        saldoElement.style.color = saldoMes >= 0 ? '#000000' : '#666666';
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
        // Não mostrar alerta para não incomodar, apenas log
    }
}
