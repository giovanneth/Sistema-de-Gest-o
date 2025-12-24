// Lógica de Controle de Comandas

let comandas = [];
let produtos = [];
let editingComandaId = null;
let produtosComanda = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await loadComandas();
    await loadProdutosForComanda();
    
    const comandaForm = document.getElementById('comandaForm');
    if (comandaForm) {
        comandaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveComanda();
        });
    }
});

async function loadComandas() {
    try {
        comandas = await getComandas();
        renderComandas();
    } catch (error) {
        console.error('Erro ao carregar comandas:', error);
        alert('Erro ao carregar comandas. Verifique se o servidor está rodando.');
    }
}

async function loadProdutosForComanda() {
    try {
        produtos = await getProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function renderComandas() {
    const tbody = document.getElementById('comandasTableBody');
    if (!tbody) return;
    
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    let filteredComandas = comandas;
    
    if (filterStatus !== 'all') {
        filteredComandas = comandas.filter(c => c.status === filterStatus);
    }
    
    tbody.innerHTML = '';
    
    if (filteredComandas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">Nenhuma comanda encontrada</td></tr>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filteredComandas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    filteredComandas.forEach(comanda => {
        const produtosList = comanda.produtos.map(p => {
            const produto = produtos.find(pr => pr.id === p.produtoId);
            return produto ? `${produto.nome} (${p.quantidade})` : 'Produto removido';
        }).join(', ');
        
        const totalQuantidade = comanda.produtos.reduce((sum, p) => sum + p.quantidade, 0);
        const statusClass = comanda.status === 'aberta' ? 'status-aberta' : 'status-finalizada';
        const nomeExibicao = comanda.nome ? `${comanda.numero} - ${comanda.nome}` : comanda.numero;
        
        if (isMobile) {
            // Layout de card para mobile
            const row = document.createElement('tr');
            row.className = 'comanda-card-mobile';
            row.innerHTML = `
                <td colspan="7">
                    <div class="comanda-card">
                        <div class="comanda-card-header">
                            <div>
                                <strong style="font-size: 16px;">${nomeExibicao}</strong>
                                <span class="status-badge ${statusClass}" style="margin-left: 10px;">${comanda.status.charAt(0).toUpperCase() + comanda.status.slice(1)}</span>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">${formatDate(comanda.data)}</div>
                        </div>
                        <div class="comanda-card-body">
                            <div class="comanda-card-info">
                                <span><strong>Total:</strong> ${formatCurrency(comanda.valorTotal)}</span>
                                <span><strong>Itens:</strong> ${totalQuantidade}</span>
                            </div>
                            <div class="comanda-card-produtos">
                                ${produtosList.substring(0, 60)}${produtosList.length > 60 ? '...' : ''}
                            </div>
                        </div>
                        <div class="comanda-card-actions">
                            <button onclick="visualizarComanda('${comanda.id}')" class="btn btn-secondary btn-sm">👁️</button>
                            ${comanda.status === 'aberta' ? `<button onclick="finalizarComanda('${comanda.id}')" class="btn btn-success btn-sm">✓</button>` : ''}
                            <button onclick="editComanda('${comanda.id}')" class="btn btn-secondary btn-sm">Editar</button>
                            <button onclick="deleteComanda('${comanda.id}')" class="btn btn-danger btn-sm">Excluir</button>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        } else {
            // Layout de tabela para desktop
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${nomeExibicao}</strong></td>
                <td>${produtosList || 'Nenhum produto'}</td>
                <td>${totalQuantidade}</td>
                <td>${formatCurrency(comanda.valorTotal)}</td>
                <td><span class="status-badge ${statusClass}">${comanda.status.charAt(0).toUpperCase() + comanda.status.slice(1)}</span></td>
                <td>${formatDate(comanda.data)}</td>
                <td>
                    <button onclick="visualizarComanda('${comanda.id}')" class="btn btn-secondary btn-sm" title="Visualizar pedidos">👁️ Visualizar</button>
                    ${comanda.status === 'aberta' ? `<button onclick="finalizarComanda('${comanda.id}')" class="btn btn-success btn-sm" title="Finalizar comanda">✓ Finalizar</button>` : ''}
                    <button onclick="editComanda('${comanda.id}')" class="btn btn-secondary btn-sm">Editar</button>
                    <button onclick="deleteComanda('${comanda.id}')" class="btn btn-danger btn-sm">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
    
    // Re-renderizar se a janela for redimensionada
    let resizeTimeout;
    if (!window.comandasResizeHandler) {
        window.comandasResizeHandler = function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderComandas();
            }, 250);
        };
        window.addEventListener('resize', window.comandasResizeHandler);
    }
}

function filterComandas() {
    renderComandas();
}

function openComandaModal(comandaId = null) {
    const modal = document.getElementById('comandaModal');
    const form = document.getElementById('comandaForm');
    const modalTitle = document.getElementById('modalTitle');
    
    editingComandaId = comandaId;
    produtosComanda = [];
    
    if (comandaId) {
        const comanda = comandas.find(c => c.id === comandaId);
        if (comanda) {
            modalTitle.textContent = 'Editar Comanda';
            document.getElementById('comandaId').value = comanda.id;
            document.getElementById('comandaNumero').value = comanda.numero || '';
            document.getElementById('comandaNome').value = comanda.nome || '';
            document.getElementById('comandaStatus').value = comanda.status;
            produtosComanda = [...comanda.produtos];
            renderProdutosComanda();
        }
    } else {
        modalTitle.textContent = 'Nova Comanda';
        form.reset();
        document.getElementById('comandaId').value = '';
        // Gerar número automático baseado em números existentes
        const numeros = comandas
            .map(c => {
                const num = parseInt(c.numero);
                return isNaN(num) ? 0 : num;
            })
            .filter(n => n > 0);
        const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
        document.getElementById('comandaNumero').value = maxNumero + 1;
        document.getElementById('comandaNome').value = '';
    }
    
    updateComandaTotal();
    modal.style.display = 'block';
}

function closeComandaModal() {
    const modal = document.getElementById('comandaModal');
    modal.style.display = 'none';
    editingComandaId = null;
    produtosComanda = [];
    document.getElementById('produtosComanda').innerHTML = '';
    document.getElementById('comandaForm').reset();
}

function addProdutoToComanda() {
    if (produtos.length === 0) {
        alert('Nenhum produto cadastrado. Cadastre produtos primeiro.');
        return;
    }
    
    produtosComanda.push({
        produtoId: produtos[0].id,
        quantidade: 1
    });
    
    renderProdutosComanda();
    updateComandaTotal();
}

function renderProdutosComanda() {
    const container = document.getElementById('produtosComanda');
    container.innerHTML = '';
    
    produtosComanda.forEach((item, index) => {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (!produto) return;
        
        const div = document.createElement('div');
        div.className = 'produto-item';
        div.innerHTML = `
            <select onchange="updateProdutoComanda(${index}, this.value)" style="flex: 2;">
                ${produtos.map(p => 
                    `<option value="${p.id}" ${p.id === item.produtoId ? 'selected' : ''}>${p.nome} - ${formatCurrency(p.preco)}</option>`
                ).join('')}
            </select>
            <input type="number" value="${item.quantidade}" min="1" 
                   onchange="updateQuantidadeComanda(${index}, this.value)" 
                   style="width: 80px;">
            <button type="button" onclick="removeProdutoComanda(${index})" class="btn btn-danger btn-sm">Remover</button>
        `;
        container.appendChild(div);
    });
}

function updateProdutoComanda(index, produtoId) {
    produtosComanda[index].produtoId = produtoId;
    updateComandaTotal();
}

function updateQuantidadeComanda(index, quantidade) {
    produtosComanda[index].quantidade = parseInt(quantidade) || 1;
    updateComandaTotal();
}

function removeProdutoComanda(index) {
    produtosComanda.splice(index, 1);
    renderProdutosComanda();
    updateComandaTotal();
}

function updateComandaTotal() {
    const total = produtosComanda.reduce((sum, item) => {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (produto) {
            return sum + (produto.preco * item.quantidade);
        }
        return sum;
    }, 0);
    
    document.getElementById('comandaTotal').textContent = formatCurrency(total);
}

async function saveComanda() {
    const id = document.getElementById('comandaId').value;
    const numero = document.getElementById('comandaNumero').value.trim();
    const nome = document.getElementById('comandaNome').value.trim();
    const status = document.getElementById('comandaStatus').value;
    
    if (!numero || produtosComanda.length === 0) {
        alert('Por favor, preencha o número/nome da comanda e adicione pelo menos um produto.');
        return;
    }
    
    // Verificar se número já existe (exceto na edição)
    if (!id && comandas.some(c => c.numero === numero)) {
        alert('Já existe uma comanda com este número/nome.');
        return;
    }
    
    const valorTotal = produtosComanda.reduce((sum, item) => {
        const produto = produtos.find(p => p.id === item.produtoId);
        return sum + (produto ? produto.preco * item.quantidade : 0);
    }, 0);
    
    try {
        const comandaData = {
            numero,
            nome: nome || null,
            produtos: produtosComanda,
            valorTotal,
            status
        };
        
        if (id) {
            // Editar comanda existente
            const comandaAntiga = comandas.find(c => c.id === id);
            
            // Se estava finalizada e agora está aberta, reverter estoque
            if (comandaAntiga.status === 'finalizada' && status === 'aberta') {
                for (const item of comandaAntiga.produtos) {
                    const produto = produtos.find(p => p.id === item.produtoId);
                    if (produto) {
                        await updateProduct(produto.id, {
                            nome: produto.nome,
                            categoria: produto.categoria,
                            preco: produto.preco,
                            estoque: produto.estoque + item.quantidade
                        });
                    }
                }
                await loadProdutosForComanda();
            }
            
            // Se estava aberta e agora está finalizada, debitar estoque
            if (comandaAntiga.status === 'aberta' && status === 'finalizada') {
                for (const item of produtosComanda) {
                    const produto = produtos.find(p => p.id === item.produtoId);
                    if (produto && produto.estoque >= item.quantidade) {
                        await updateProduct(produto.id, {
                            nome: produto.nome,
                            categoria: produto.categoria,
                            preco: produto.preco,
                            estoque: produto.estoque - item.quantidade
                        });
                    }
                }
                await loadProdutosForComanda();
                
                // Registrar como entrada financeira
                await createTransacao({
                    tipo: 'entrada',
                    descricao: `Comanda #${numero}`,
                    categoria: 'Venda',
                    valor: valorTotal,
                    data: getCurrentDateTime()
                });
            }
            
            await updateComanda(id, comandaData);
        } else {
            // Criar nova comanda
            // Se já criar como finalizada, debitar estoque e registrar entrada
            if (status === 'finalizada') {
                for (const item of produtosComanda) {
                    const produto = produtos.find(p => p.id === item.produtoId);
                    if (produto && produto.estoque >= item.quantidade) {
                        await updateProduct(produto.id, {
                            nome: produto.nome,
                            categoria: produto.categoria,
                            preco: produto.preco,
                            estoque: produto.estoque - item.quantidade
                        });
                    }
                }
                await loadProdutosForComanda();
                
                await createTransacao({
                    tipo: 'entrada',
                    descricao: `Comanda #${numero}`,
                    categoria: 'Venda',
                    valor: valorTotal,
                    data: getCurrentDateTime()
                });
            }
            
            await createComanda(comandaData);
        }
        
        await loadComandas();
        closeComandaModal();
    } catch (error) {
        console.error('Erro ao salvar comanda:', error);
        alert('Erro ao salvar comanda. Verifique se o servidor está rodando.');
    }
}

function editComanda(id) {
    openComandaModal(id);
}

async function deleteComanda(id) {
    if (!confirm('Tem certeza que deseja excluir esta comanda?')) {
        return;
    }
    
    try {
        const comanda = comandas.find(c => c.id === id);
        
        // Se comanda finalizada, reverter estoque e remover transação
        if (comanda && comanda.status === 'finalizada') {
            for (const item of comanda.produtos) {
                const produto = produtos.find(p => p.id === item.produtoId);
                if (produto) {
                    await updateProduct(produto.id, {
                        nome: produto.nome,
                        categoria: produto.categoria,
                        preco: produto.preco,
                        estoque: produto.estoque + item.quantidade
                    });
                }
            }
            await loadProdutosForComanda();
            
            // Remover transação financeira relacionada
            const transacoesList = await getTransacoes();
            const nomeExibicao = comanda.nome ? `${comanda.numero} - ${comanda.nome}` : comanda.numero;
            const transacao = transacoesList.find(t => 
                (t.descricao.includes(`Comanda ${nomeExibicao}`) || t.descricao.includes(`Comanda #${comanda.numero}`)) && t.tipo === 'entrada'
            );
            if (transacao) {
                const apiUrl = `${window.location.protocol}//${window.location.hostname}:3000/api`;
                const deleteResponse = await fetch(`${apiUrl}/transacoes/${transacao.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': localStorage.getItem('currentUserId')
                    }
                });
                if (!deleteResponse.ok) {
                    console.error('Erro ao excluir transação relacionada');
                }
            }
        }
        
        // Chamar API diretamente usando fetch
        const apiUrl = `${window.location.protocol}//${window.location.hostname}:3000/api`;
        const response = await fetch(`${apiUrl}/comandas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-id': localStorage.getItem('currentUserId')
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir comanda');
        }
        
        await loadComandas();
    } catch (error) {
        console.error('Erro ao excluir comanda:', error);
        alert('Erro ao excluir comanda. Verifique se o servidor está rodando.');
    }
}

// Visualizar comanda de forma limpa
function visualizarComanda(id) {
    const comanda = comandas.find(c => c.id === id);
    if (!comanda) return;
    
    const modal = document.getElementById('visualizarModal');
    const title = document.getElementById('visualizarTitle');
    const content = document.getElementById('visualizarContent');
    
    const nomeExibicao = comanda.nome ? `${comanda.numero} - ${comanda.nome}` : comanda.numero;
    title.textContent = `Comanda: ${nomeExibicao}`;
    
    let html = `
        <div style="margin-bottom: 10px;">
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-bottom: 12px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong>${nomeExibicao}</strong>
                    <span class="status-badge ${comanda.status === 'aberta' ? 'status-aberta' : 'status-finalizada'}">${comanda.status.charAt(0).toUpperCase() + comanda.status.slice(1)}</span>
                </div>
                ${comanda.nome ? `<div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Cliente: ${comanda.nome}</div>` : ''}
                <div style="color: var(--text-secondary); font-size: 12px;">Data: ${formatDate(comanda.data)}</div>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; font-size: 13px;">
    `;
    
    if (comanda.produtos.length === 0) {
        html += '<p style="color: var(--text-secondary); margin: 0; font-size: 13px;">Nenhum produto adicionado</p>';
    } else {
        html += '<div style="font-weight: 600; margin-bottom: 10px; font-size: 13px; color: var(--text-secondary);">Produtos:</div>';
        
        comanda.produtos.forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto) {
                const subtotal = produto.preco * item.quantidade;
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 13px;">${produto.nome}</div>
                            <div style="color: var(--text-secondary); font-size: 11px;">${item.quantidade}x ${formatCurrency(produto.preco)}</div>
                        </div>
                        <div style="font-weight: 600; font-size: 13px; margin-left: 10px;">${formatCurrency(subtotal)}</div>
                    </div>
                `;
            }
        });
    }
    
    html += `
            </div>
            <div style="margin-top: 12px; padding: 12px; background: var(--bg-dark); color: white; border-radius: 6px; text-align: right;">
                <div style="font-size: 18px; font-weight: 700;">Total: ${formatCurrency(comanda.valorTotal)}</div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'block';
}

function closeVisualizarModal() {
    const modal = document.getElementById('visualizarModal');
    modal.style.display = 'none';
}

// Finalizar comanda
async function finalizarComanda(id) {
    if (!confirm('Tem certeza que deseja finalizar esta comanda?')) {
        return;
    }
    
    const comanda = comandas.find(c => c.id === id);
    if (!comanda || comanda.status === 'finalizada') {
        alert('Esta comanda já está finalizada.');
        return;
    }
    
    try {
        // Verificar estoque antes de finalizar
        for (const item of comanda.produtos) {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto && produto.estoque < item.quantidade) {
                alert(`Estoque insuficiente para ${produto.nome}. Estoque disponível: ${produto.estoque}`);
                return;
            }
        }
        
        // Atualizar estoque
        for (const item of comanda.produtos) {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto) {
                await updateProduct(produto.id, {
                    nome: produto.nome,
                    categoria: produto.categoria,
                    preco: produto.preco,
                    estoque: produto.estoque - item.quantidade
                });
            }
        }
        
        await loadProdutosForComanda();
        
        // Atualizar status da comanda
        const nomeExibicao = comanda.nome ? `${comanda.numero} - ${comanda.nome}` : comanda.numero;
        await updateComanda(id, {
            numero: comanda.numero,
            nome: comanda.nome || null,
            produtos: comanda.produtos,
            valorTotal: comanda.valorTotal,
            status: 'finalizada'
        });
        
        // Registrar como entrada financeira
        await createTransacao({
            tipo: 'entrada',
            descricao: `Comanda ${nomeExibicao}`,
            categoria: 'Venda',
            valor: comanda.valorTotal,
            data: getCurrentDateTime()
        });
        
        await loadComandas();
        alert('Comanda finalizada com sucesso!');
    } catch (error) {
        console.error('Erro ao finalizar comanda:', error);
        alert('Erro ao finalizar comanda. Verifique se o servidor está rodando.');
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('comandaModal');
    const visualizarModal = document.getElementById('visualizarModal');
    if (event.target === modal) {
        closeComandaModal();
    }
    if (event.target === visualizarModal) {
        closeVisualizarModal();
    }
}
