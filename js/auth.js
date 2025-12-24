// Sistema de Autenticação

// Verificar se o usuário está logado
function checkAuth() {
    const currentUserId = localStorage.getItem('currentUserId');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUserId || !currentUser) {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }
    
    // Atualizar informação do usuário na interface
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const user = JSON.parse(currentUser);
        userInfoElement.textContent = user.username || user.email || 'Usuário';
    }
    
    return true;
}

// Fazer login ou registrar
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        // Tentar fazer login primeiro
        let result = null;
        
        try {
            result = await login(username, password);
            
            // Se login funcionou, verificar se tem user
            if (result && result.user) {
                // Salvar informações do usuário
                localStorage.setItem('currentUserId', result.user.id);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redirecionar para dashboard
                window.location.href = 'dashboard.html';
                return;
            }
        } catch (loginError) {
            // Se o erro for "usuário não encontrado", tentar criar novo usuário
            if (loginError.message && loginError.message.includes('não encontrado')) {
                try {
                    result = await register(username, null, password);
                    
                    if (result && result.user) {
                        // Novo usuário criado com sucesso
                        localStorage.setItem('currentUserId', result.user.id);
                        localStorage.setItem('currentUser', JSON.stringify(result.user));
                        window.location.href = 'dashboard.html';
                        return;
                    }
                } catch (registerError) {
                    // Erro ao criar usuário
                    alert(registerError.message || 'Erro ao criar usuário. Tente novamente.');
                    return;
                }
            }
            
            // Se o erro for "senha incorreta" ou outro erro, mostrar mensagem
            if (loginError.message && loginError.message.includes('Senha incorreta')) {
                alert('Senha incorreta. Verifique sua senha e tente novamente.');
                return;
            }
            
            // Outro tipo de erro no login
            alert(loginError.message || 'Erro ao fazer login. Tente novamente.');
        }
        
        // Se chegou aqui sem fazer login, erro desconhecido
        alert('Erro ao fazer login. Tente novamente.');
    } catch (error) {
        alert(error.message || 'Erro ao fazer login. Tente novamente.');
        console.error('Erro no login:', error);
    }
}

// Fazer logout
function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação em páginas protegidas
    if (!window.location.pathname.includes('index.html')) {
        checkAuth();
    }
    
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
});
