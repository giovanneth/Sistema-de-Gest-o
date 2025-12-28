// Página administrativa - apenas para o email autorizado

const ADMIN_EMAIL = 'giovanneltda@gmail.com';
let adminState = {
    users: [],
    products: [],
    comandas: [],
    transacoes: [],
    metrics: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isAdmin = currentUser && currentUser.email && currentUser.email.toLowerCase() === ADMIN_EMAIL;

    if (!isAdmin) {
        alert('Acesso restrito ao administrador.');
        window.location.href = 'dashboard.html';
        return;
    }

    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', handleBackup);
    }

    await loadAdminData();
});

async function loadAdminData() {
    try {
        const data = await adminFetchAll();
        adminState = data;
        renderMetrics(data.metrics);
        renderUsers(data.users);
    } catch (error) {
        console.error('Erro ao carregar dados de admin:', error);
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 30px; text-align: center; color: var(--danger-color);">${error.message || 'Erro ao carregar dados'}</td></tr>`;
        }
    }
}

function renderMetrics(metrics = {}) {
    const { users = 0, products = 0, comandas = 0, transacoes = 0 } = metrics;
    document.getElementById('metricUsers').textContent = users;
    document.getElementById('metricProducts').textContent = products;
    document.getElementById('metricComandas').textContent = comandas;
    document.getElementById('metricTransacoes').textContent = transacoes;
}

function renderUsers(users = []) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding: 30px; text-align: center; color: var(--text-secondary);">Nenhum usuário cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    users
        .sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))
        .forEach(user => {
            const created = user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : '-';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Usuário">${user.username || '-'}</td>
                <td data-label="Email">${user.email || '-'}</td>
                <td data-label="Criado em">${created}</td>
                <td class="actions-cell" data-label="Ações">
                    <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
}

async function handleBackup() {
    const backupBtn = document.getElementById('backupBtn');
    const backupStatus = document.getElementById('backupStatus');

    if (backupBtn) {
        backupBtn.disabled = true;
        backupBtn.textContent = 'Gerando...';
    }

    try {
        const result = await adminBackup();
        adminState.backup = result.backup;
        if (backupStatus) {
            backupStatus.textContent = `Backup gerado: ${result.filename}`;
        }
        downloadBackup(result.backup, result.filename);
    } catch (error) {
        console.error('Erro ao gerar backup:', error);
        if (backupStatus) {
            backupStatus.textContent = error.message || 'Erro ao gerar backup';
            backupStatus.style.color = 'var(--danger-color)';
        }
    } finally {
        if (backupBtn) {
            backupBtn.disabled = false;
            backupBtn.textContent = 'Gerar backup completo';
        }
    }
}

function downloadBackup(backup, filename = 'backup.json') {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function editUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;

    const newUsername = prompt('Novo usuário (deixe vazio para manter)', user.username || '');
    const newEmail = prompt('Novo email (deixe vazio para manter)', user.email || '');
    const newPassword = prompt('Nova senha (opcional - deixe vazio para manter)');

    const payload = {
        username: newUsername || user.username,
        email: newEmail || user.email
    };

    if (newPassword && newPassword.trim().length > 0) {
        payload.password = newPassword.trim();
    }

    try {
        await adminUpdateUser(userId, payload);
        await loadAdminData();
        alert('Usuário atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar usuário');
    }
}

async function deleteUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;

    const confirmDelete = confirm(`Excluir o usuário "${user.username || user.email}" e todos os dados relacionados?`);
    if (!confirmDelete) return;

    try {
        await adminDeleteUser(userId);
        await loadAdminData();
        alert('Usuário e dados relacionados removidos.');
    } catch (error) {
        alert(error.message || 'Erro ao excluir usuário');
    }
}
