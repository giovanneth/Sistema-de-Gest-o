// Lógica de Controle Financeiro

let transacoes = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await loadTransacoes();
    
    const transacaoForm = document.getElementById('transacaoForm');
    if (transacaoForm) {
        transacaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveTransacao();
        });
    }
    
    // Definir data padrão como hoje
    const dataInput = document.getElementById('transacaoData');
    if (dataInput) {
        dataInput.value = getTodayDate();
    }
    
    // Configurar filtro de mês para o mês atual
    const monthInput = document.getElementById('filterMonth');
    if (monthInput) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
});

async function loadTransacoes() {
    try {
        transacoes = await getTransacoes();
        renderTransacoes();
        updateSummary();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        alert('Erro ao carregar transações. Verifique se o servidor está rodando.');
    }
}

function renderTransacoes() {
    const tbody = document.getElementById('transacoesTableBody');
    if (!tbody) return;
    
    const filterTipo = document.getElementById('filterTipo')?.value || 'all';
    const filterMonth = document.getElementById('filterMonth')?.value;
    
    let filteredTransacoes = transacoes;
    
    if (filterTipo !== 'all') {
        filteredTransacoes = filteredTransacoes.filter(t => t.tipo === filterTipo);
    }
    
    if (filterMonth) {
        filteredTransacoes = filteredTransacoes.filter(t => {
            const transDate = new Date(t.data);
            const filterDate = new Date(filterMonth + '-01');
            return transDate.getMonth() === filterDate.getMonth() && 
                   transDate.getFullYear() === filterDate.getFullYear();
        });
    }
    
    tbody.innerHTML = '';
    
    if (filteredTransacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">Nenhuma transação encontrada</td></tr>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filteredTransacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    filteredTransacoes.forEach(transacao => {
        const row = document.createElement('tr');
        const tipoClass = transacao.tipo === 'entrada' ? 'positive' : 'negative';
        const tipoText = transacao.tipo === 'entrada' ? 'Entrada' : 'Saída';
        
        row.innerHTML = `
            <td>${formatDate(transacao.data)}</td>
            <td><span class="${tipoClass}">${tipoText}</span></td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td class="${tipoClass}">${transacao.tipo === 'entrada' ? '+' : '-'} ${formatCurrency(transacao.valor)}</td>
            <td>
                <button onclick="editTransacao('${transacao.id}')" class="btn btn-secondary btn-sm">Editar</button>
                <button onclick="deleteTransacao('${transacao.id}')" class="btn btn-danger btn-sm">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterTransacoes() {
    renderTransacoes();
    updateSummary();
}

function updateSummary() {
    const filterMonth = document.getElementById('filterMonth')?.value;
    
    let transacoesToSum = transacoes;
    
    if (filterMonth) {
        transacoesToSum = transacoes.filter(t => {
            const transDate = new Date(t.data);
            const filterDate = new Date(filterMonth + '-01');
            return transDate.getMonth() === filterDate.getMonth() && 
                   transDate.getFullYear() === filterDate.getFullYear();
        });
    }
    
    const totalEntradas = transacoesToSum
        .filter(t => t.tipo === 'entrada')
        .reduce((total, t) => total + t.valor, 0);
    
    const totalSaidas = transacoesToSum
        .filter(t => t.tipo === 'saida')
        .reduce((total, t) => total + t.valor, 0);
    
    const saldo = totalEntradas - totalSaidas;
    
    document.getElementById('totalEntradas').textContent = formatCurrency(totalEntradas);
    document.getElementById('totalSaidas').textContent = formatCurrency(totalSaidas);
    document.getElementById('saldoTotal').textContent = formatCurrency(saldo);
    
    const saldoElement = document.getElementById('saldoTotal');
    saldoElement.className = 'summary-value';
    if (saldo > 0) {
        saldoElement.classList.add('positive');
    } else if (saldo < 0) {
        saldoElement.classList.add('negative');
    }
}

function openTransacaoModal(tipo, transacaoId = null) {
    const modal = document.getElementById('transacaoModal');
    const form = document.getElementById('transacaoForm');
    const modalTitle = document.getElementById('modalTitle');
    const tipoInput = document.getElementById('transacaoTipo');
    
    tipoInput.value = tipo;
    
    if (transacaoId) {
        const transacao = transacoes.find(t => t.id === transacaoId);
        if (transacao) {
            modalTitle.textContent = `Editar ${tipo === 'entrada' ? 'Entrada' : 'Saída'}`;
            document.getElementById('transacaoId').value = transacao.id;
            document.getElementById('transacaoDescricao').value = transacao.descricao;
            document.getElementById('transacaoCategoria').value = transacao.categoria;
            document.getElementById('transacaoValor').value = transacao.valor;
            document.getElementById('transacaoData').value = transacao.data.split('T')[0];
            tipoInput.value = transacao.tipo;
        }
    } else {
        modalTitle.textContent = `Nova ${tipo === 'entrada' ? 'Entrada' : 'Saída'}`;
        form.reset();
        document.getElementById('transacaoId').value = '';
        tipoInput.value = tipo;
        document.getElementById('transacaoData').value = getTodayDate();
    }
    
    modal.style.display = 'block';
}

function closeTransacaoModal() {
    const modal = document.getElementById('transacaoModal');
    modal.style.display = 'none';
    document.getElementById('transacaoForm').reset();
    document.getElementById('transacaoData').value = getTodayDate();
}

async function saveTransacao() {
    const id = document.getElementById('transacaoId').value;
    const tipo = document.getElementById('transacaoTipo').value;
    const descricao = document.getElementById('transacaoDescricao').value.trim();
    const categoria = document.getElementById('transacaoCategoria').value.trim();
    const valor = parseFloat(document.getElementById('transacaoValor').value);
    const data = document.getElementById('transacaoData').value;
    
    if (!descricao || !categoria || !isValidNumber(valor) || !data) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    try {
        const transacaoData = {
            tipo,
            descricao,
            categoria,
            valor,
            data: new Date(data).toISOString()
        };
        
        if (id) {
            await updateTransacao(id, transacaoData);
        } else {
            await createTransacao(transacaoData);
        }
        
        await loadTransacoes();
        closeTransacaoModal();
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
        alert('Erro ao salvar transação. Verifique se o servidor está rodando.');
    }
}

function editTransacao(id) {
    const transacao = transacoes.find(t => t.id === id);
    if (transacao) {
        openTransacaoModal(transacao.tipo, id);
    }
}

async function deleteTransacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
        return;
    }
    
    try {
        await deleteTransacaoAPI(id);
        await loadTransacoes();
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação. Verifique se o servidor está rodando.');
    }
}

// Função auxiliar para chamar a API
async function deleteTransacaoAPI(id) {
    const apiUrl = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const response = await fetch(`${apiUrl}/transacoes/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': localStorage.getItem('currentUserId')
        }
    });
    
    if (!response.ok) {
        throw new Error('Erro ao excluir transação');
    }
    
    return await response.json();
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('transacaoModal');
    if (event.target === modal) {
        closeTransacaoModal();
    }
}
