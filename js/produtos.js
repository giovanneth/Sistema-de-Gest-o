// Lógica de Controle de Produtos

let produtos = [];
let editingProdutoId = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await loadProdutos();
    
    const produtoForm = document.getElementById('produtoForm');
    if (produtoForm) {
        produtoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveProduto();
        });
    }
});

async function loadProdutos() {
    try {
        produtos = await getProducts();
        renderProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos. Verifique se o servidor está rodando.');
    }
}

function renderProdutos() {
    const tbody = document.getElementById('produtosTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    // Agrupar produtos por categoria
    const produtosPorCategoria = {};
    produtos.forEach(produto => {
        const categoria = produto.categoria || 'Sem Categoria';
        if (!produtosPorCategoria[categoria]) {
            produtosPorCategoria[categoria] = [];
        }
        produtosPorCategoria[categoria].push(produto);
    });
    
    // Ordenar categorias alfabeticamente
    const categoriasOrdenadas = Object.keys(produtosPorCategoria).sort();
    
    // Renderizar por categoria
    categoriasOrdenadas.forEach((categoria, index) => {
        // Cabeçalho da categoria mais sutil
        if (index > 0) {
            // Espaçamento leve antes de cada categoria (exceto a primeira)
            const espacoRow = document.createElement('tr');
            espacoRow.className = 'categoria-spacer';
            espacoRow.innerHTML = '<td colspan="5" style="height: 20px; border-top: 1px solid var(--border-color);"></td>';
            tbody.appendChild(espacoRow);
        }
        
        const categoriaRow = document.createElement('tr');
        categoriaRow.className = 'categoria-header';
        categoriaRow.innerHTML = `
            <td colspan="5" style="background: var(--bg-secondary); padding: 12px 15px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); border-left: 3px solid var(--bg-dark);">
                ${categoria}
            </td>
        `;
        tbody.appendChild(categoriaRow);
        
        // Produtos da categoria (ordenados por nome)
        const produtosCategoria = produtosPorCategoria[categoria].sort((a, b) => 
            a.nome.localeCompare(b.nome)
        );
        
        produtosCategoria.forEach(produto => {
            const row = document.createElement('tr');
            const estoqueClass = produto.estoque === 0 ? 'estoque-zero' : produto.estoque < 10 ? 'estoque-baixo' : '';
            row.className = estoqueClass;
            row.innerHTML = `
                <td data-label="Nome">${produto.nome}</td>
                <td data-label="Categoria" style="color: var(--text-secondary);">${produto.categoria}</td>
                <td data-label="Preço">${formatCurrency(produto.preco)}</td>
                <td data-label="Estoque"><strong>${produto.estoque}</strong></td>
                <td class="actions-cell" data-label="Ações">
                    <button onclick="openEstoqueModal('${produto.id}')" class="btn btn-success btn-sm" title="Adicionar estoque">+ Estoque</button>
                    <button onclick="editProduto('${produto.id}')" class="btn btn-secondary btn-sm">Editar</button>
                    <button onclick="deleteProduto('${produto.id}')" class="btn btn-danger btn-sm">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

function openProdutoModal(produtoId = null) {
    const modal = document.getElementById('produtoModal');
    const form = document.getElementById('produtoForm');
    const modalTitle = document.getElementById('modalTitle');
    
    editingProdutoId = produtoId;
    
    if (produtoId) {
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) {
            modalTitle.textContent = 'Editar Produto';
            document.getElementById('produtoId').value = produto.id;
            document.getElementById('produtoNome').value = produto.nome;
            document.getElementById('produtoCategoria').value = produto.categoria;
            document.getElementById('produtoPreco').value = produto.preco;
            document.getElementById('produtoEstoque').value = produto.estoque;
        }
    } else {
        modalTitle.textContent = 'Novo Produto';
        form.reset();
        document.getElementById('produtoId').value = '';
        document.getElementById('produtoEstoque').value = 0;
    }
    
    modal.style.display = 'block';
}

function closeProdutoModal() {
    const modal = document.getElementById('produtoModal');
    modal.style.display = 'none';
    editingProdutoId = null;
    document.getElementById('produtoForm').reset();
}

async function saveProduto() {
    const id = document.getElementById('produtoId').value;
    const nome = document.getElementById('produtoNome').value.trim();
    const categoria = document.getElementById('produtoCategoria').value.trim();
    const preco = parseFloat(document.getElementById('produtoPreco').value);
    const estoque = parseInt(document.getElementById('produtoEstoque').value);
    
    if (!nome || !categoria || !isValidNumber(preco) || !isValidNumber(estoque)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    try {
        if (id) {
            // Editar produto existente
            await updateProduct(id, { nome, categoria, preco, estoque });
        } else {
            // Criar novo produto
            await createProduct({ nome, categoria, preco, estoque });
        }
        
        await loadProdutos();
        closeProdutoModal();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto. Verifique se o servidor está rodando.');
    }
}

function editProduto(id) {
    openProdutoModal(id);
}

async function deleteProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    try {
        await deleteProduct(id);
        await loadProdutos();
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Verifique se o servidor está rodando.');
    }
}

function getProdutoById(id) {
    return produtos.find(p => p.id === id);
}

// Modal de adicionar estoque
function openEstoqueModal(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    const modal = document.getElementById('estoqueModal');
    document.getElementById('estoqueProdutoId').value = produto.id;
    document.getElementById('estoqueProdutoNome').textContent = produto.nome;
    document.getElementById('estoqueAtual').textContent = produto.estoque;
    
    const quantidadeInput = document.getElementById('estoqueQuantidade');
    quantidadeInput.value = 1;
    document.getElementById('estoqueNovo').textContent = produto.estoque + 1;
    
    // Atualizar preview quando quantidade mudar
    quantidadeInput.oninput = function() {
        const quantidade = parseInt(this.value) || 0;
        const novoEstoque = produto.estoque + quantidade;
        document.getElementById('estoqueNovo').textContent = novoEstoque;
    };
    
    modal.style.display = 'block';
}

function closeEstoqueModal() {
    const modal = document.getElementById('estoqueModal');
    modal.style.display = 'none';
    document.getElementById('estoqueForm').reset();
}

// Event listener para formulário de estoque
document.addEventListener('DOMContentLoaded', function() {
    const estoqueForm = document.getElementById('estoqueForm');
    if (estoqueForm) {
        estoqueForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await adicionarEstoque();
        });
    }
});

async function adicionarEstoque() {
    const produtoId = document.getElementById('estoqueProdutoId').value;
    const quantidade = parseInt(document.getElementById('estoqueQuantidade').value);
    
    if (!produtoId || !quantidade || quantidade < 1) {
        alert('Por favor, informe uma quantidade válida.');
        return;
    }
    
    try {
        const produto = produtos.find(p => p.id === produtoId);
        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }
        
        const novoEstoque = produto.estoque + quantidade;
        
        await updateProduct(produtoId, {
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco,
            estoque: novoEstoque
        });
        
        await loadProdutos();
        closeEstoqueModal();
        alert(`Estoque atualizado! Novo estoque: ${novoEstoque}`);
    } catch (error) {
        console.error('Erro ao adicionar estoque:', error);
        alert('Erro ao adicionar estoque. Verifique se o servidor está rodando.');
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('produtoModal');
    const estoqueModal = document.getElementById('estoqueModal');
    if (event.target === modal) {
        closeProdutoModal();
    }
    if (event.target === estoqueModal) {
        closeEstoqueModal();
    }
}
