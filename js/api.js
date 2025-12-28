// Configuração da API - usa o mesmo host da página atual
// Isso permite acesso de outros dispositivos na mesma rede
function getApiBaseUrl() {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
}

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
    const userId = localStorage.getItem('currentUserId');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (userId) {
        defaultHeaders['user-id'] = userId;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// ============= AUTENTICAÇÃO =============

async function login(username, password) {
    const result = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    return result;
}

async function register(username, email, password) {
    const result = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    return result;
}

// ============= PRODUTOS =============

async function getProducts() {
    return await apiRequest('/products');
}

async function createProduct(product) {
    return await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(product)
    });
}

async function updateProduct(id, product) {
    return await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
    });
}

async function deleteProduct(id) {
    return await apiRequest(`/products/${id}`, {
        method: 'DELETE'
    });
}

// ============= COMANDAS =============

async function getComandas() {
    return await apiRequest('/comandas');
}

async function createComanda(comanda) {
    return await apiRequest('/comandas', {
        method: 'POST',
        body: JSON.stringify(comanda)
    });
}

async function updateComanda(id, comanda) {
    return await apiRequest(`/comandas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(comanda)
    });
}

async function deleteComanda(id) {
    return await apiRequest(`/comandas/${id}`, {
        method: 'DELETE'
    });
}

// ============= TRANSAÇÕES =============

async function getTransacoes() {
    return await apiRequest('/transacoes');
}

async function createTransacao(transacao) {
    return await apiRequest('/transacoes', {
        method: 'POST',
        body: JSON.stringify(transacao)
    });
}

async function updateTransacao(id, transacao) {
    return await apiRequest(`/transacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transacao)
    });
}

async function deleteTransacao(id) {
    return await apiRequest(`/transacoes/${id}`, {
        method: 'DELETE'
    });
}

// ============= ADMIN =============

async function adminFetchAll() {
    return await apiRequest('/admin/data');
}

async function adminBackup() {
    return await apiRequest('/admin/backup', {
        method: 'POST'
    });
}

async function adminUpdateUser(id, payload) {
    return await apiRequest(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
}

async function adminDeleteUser(id) {
    return await apiRequest(`/admin/users/${id}`, {
        method: 'DELETE'
    });
}
