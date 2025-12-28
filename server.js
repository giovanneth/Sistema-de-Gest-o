const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const ADMIN_EMAIL = 'giovanneltda@gmail.com';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Garantir que o diretório data existe
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Erro ao criar diretório data:', error);
    }
}

// Função auxiliar para ler arquivo JSON
async function readJsonFile(filename) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Função auxiliar para escrever arquivo JSON
async function writeJsonFile(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper: validar admin
async function requireAdmin(req, res) {
    const userId = req.headers['user-id'];
    if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return null;
    }

    const users = await readJsonFile('users.json');
    const adminUser = users.find(u => u.id === userId);
    const emailMatch = adminUser && adminUser.email && adminUser.email.toLowerCase() === ADMIN_EMAIL;
    const usernameMatch = adminUser && adminUser.username && adminUser.username.toLowerCase() === ADMIN_EMAIL;
    const isAdmin = emailMatch || usernameMatch;

    if (!isAdmin) {
        res.status(403).json({ error: 'Acesso restrito ao administrador' });
        return null;
    }

    return { users, adminUser };
}

// ============= ROTAS DE AUTENTICAÇÃO =============

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }
        
        const users = await readJsonFile('users.json');
        const user = users.find(u => 
            u.username === username || u.email === username
        );
        
        if (!user) {
            // Usuário não encontrado
            res.status(401).json({ error: 'Usuário não encontrado' });
            return;
        }
        
        if (user.password !== password) {
            // Senha incorreta
            res.status(401).json({ error: 'Senha incorreta' });
            return;
        }

        // Se o usuário não tiver email salvo e o login foi via email, persistir
        if (!user.email && username && username.includes('@')) {
            user.email = username;
            await writeJsonFile('users.json', users);
        }
        
        // Login bem-sucedido
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Registrar novo usuário
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }
        
        const users = await readJsonFile('users.json');
        
        // Verificar se usuário ou email já existe
        const exists = users.find(u => 
            u.username === username || (email && u.email === email)
        );
        
        if (exists) {
            return res.status(400).json({ error: 'Usuário ou email já cadastrado' });
        }
        
        const derivedEmail = email || (username && username.includes('@') ? username : null);

        const newUser = {
            id: Date.now().toString(),
            username,
            email: derivedEmail,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeJsonFile('users.json', users);
        
        res.json({ 
            success: true, 
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ============= ROTAS DE PRODUTOS =============

// Obter todos os produtos do usuário
app.get('/api/products', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const products = await readJsonFile('products.json');
        const userProducts = products.filter(p => p.userId === userId);
        res.json(userProducts);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Criar produto
app.post('/api/products', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { nome, categoria, preco, estoque } = req.body;
        
        const products = await readJsonFile('products.json');
        const newProduct = {
            id: Date.now().toString(),
            userId,
            nome,
            categoria,
            preco: parseFloat(preco),
            estoque: parseInt(estoque) || 0,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        await writeJsonFile('products.json', products);
        
        res.json(newProduct);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Atualizar produto
app.put('/api/products/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const { nome, categoria, preco, estoque } = req.body;
        
        const products = await readJsonFile('products.json');
        const index = products.findIndex(p => p.id === id && p.userId === userId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        products[index] = {
            ...products[index],
            nome,
            categoria,
            preco: parseFloat(preco),
            estoque: parseInt(estoque) || 0,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile('products.json', products);
        res.json(products[index]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Deletar produto
app.delete('/api/products/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const products = await readJsonFile('products.json');
        const filtered = products.filter(p => !(p.id === id && p.userId === userId));
        
        await writeJsonFile('products.json', filtered);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ============= ROTAS DE COMANDAS =============

// Obter todas as comandas do usuário
app.get('/api/comandas', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const comandas = await readJsonFile('comandas.json');
        const userComandas = comandas.filter(c => c.userId === userId);
        res.json(userComandas);
    } catch (error) {
        console.error('Erro ao buscar comandas:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Criar comanda
app.post('/api/comandas', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { numero, nome, produtos, valorTotal, status } = req.body;
        
        const comandas = await readJsonFile('comandas.json');
        const newComanda = {
            id: Date.now().toString(),
            userId,
            numero,
            nome: nome || null,
            produtos,
            valorTotal: parseFloat(valorTotal),
            status,
            data: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        comandas.push(newComanda);
        await writeJsonFile('comandas.json', comandas);
        
        res.json(newComanda);
    } catch (error) {
        console.error('Erro ao criar comanda:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Atualizar comanda
app.put('/api/comandas/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const { numero, nome, produtos, valorTotal, status } = req.body;
        
        const comandas = await readJsonFile('comandas.json');
        const index = comandas.findIndex(c => c.id === id && c.userId === userId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Comanda não encontrada' });
        }
        
        comandas[index] = {
            ...comandas[index],
            numero,
            nome: nome || null,
            produtos,
            valorTotal: parseFloat(valorTotal),
            status,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile('comandas.json', comandas);
        res.json(comandas[index]);
    } catch (error) {
        console.error('Erro ao atualizar comanda:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Deletar comanda
app.delete('/api/comandas/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const comandas = await readJsonFile('comandas.json');
        const filtered = comandas.filter(c => !(c.id === id && c.userId === userId));
        
        await writeJsonFile('comandas.json', filtered);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar comanda:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ============= ROTAS DE TRANSAÇÕES FINANCEIRAS =============

// Obter todas as transações do usuário
app.get('/api/transacoes', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const transacoes = await readJsonFile('transacoes.json');
        const userTransacoes = transacoes.filter(t => t.userId === userId);
        res.json(userTransacoes);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Criar transação
app.post('/api/transacoes', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { tipo, descricao, categoria, valor, data } = req.body;
        
        const transacoes = await readJsonFile('transacoes.json');
        const newTransacao = {
            id: Date.now().toString(),
            userId,
            tipo,
            descricao,
            categoria,
            valor: parseFloat(valor),
            data: data || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        transacoes.push(newTransacao);
        await writeJsonFile('transacoes.json', transacoes);
        
        res.json(newTransacao);
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Atualizar transação
app.put('/api/transacoes/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const { tipo, descricao, categoria, valor, data } = req.body;
        
        const transacoes = await readJsonFile('transacoes.json');
        const index = transacoes.findIndex(t => t.id === id && t.userId === userId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }
        
        transacoes[index] = {
            ...transacoes[index],
            tipo,
            descricao,
            categoria,
            valor: parseFloat(valor),
            data,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile('transacoes.json', transacoes);
        res.json(transacoes[index]);
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Deletar transação
app.delete('/api/transacoes/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const { id } = req.params;
        const transacoes = await readJsonFile('transacoes.json');
        const filtered = transacoes.filter(t => !(t.id === id && t.userId === userId));
        
        await writeJsonFile('transacoes.json', filtered);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ============= ROTAS DE ADMIN (apenas email autorizado) =============

// Resumo completo
app.get('/api/admin/data', async (req, res) => {
    try {
        const adminContext = await requireAdmin(req, res);
        if (!adminContext) return;

        const [products, comandas, transacoes] = await Promise.all([
            readJsonFile('products.json'),
            readJsonFile('comandas.json'),
            readJsonFile('transacoes.json')
        ]);

        res.json({
            users: adminContext.users,
            products,
            comandas,
            transacoes,
            metrics: {
                users: adminContext.users.length,
                products: products.length,
                comandas: comandas.length,
                transacoes: transacoes.length
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dados de admin:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Backup completo (gera arquivo na pasta data/backups e devolve payload)
app.post('/api/admin/backup', async (req, res) => {
    try {
        const adminContext = await requireAdmin(req, res);
        if (!adminContext) return;

        const [products, comandas, transacoes] = await Promise.all([
            readJsonFile('products.json'),
            readJsonFile('comandas.json'),
            readJsonFile('transacoes.json')
        ]);

        const backup = {
            createdAt: new Date().toISOString(),
            users: adminContext.users,
            products,
            comandas,
            transacoes
        };

        const backupDir = path.join(DATA_DIR, 'backups');
        await fs.mkdir(backupDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        await fs.writeFile(path.join(backupDir, filename), JSON.stringify(backup, null, 2), 'utf8');

        res.json({
            success: true,
            filename,
            backup
        });
    } catch (error) {
        console.error('Erro ao criar backup:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Atualizar usuário (nome/email/senha)
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const adminContext = await requireAdmin(req, res);
        if (!adminContext) return;

        const { id } = req.params;
        const { username, email, password } = req.body;
        const users = adminContext.users;
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Impedir emails duplicados
        if (email) {
            const emailExists = users.some(u => u.id !== id && u.email === email);
            if (emailExists) {
                return res.status(400).json({ error: 'Email já utilizado por outro usuário' });
            }
        }

        users[index] = {
            ...users[index],
            username: username || users[index].username,
            email: email || users[index].email,
            password: password ? password : users[index].password,
            updatedAt: new Date().toISOString()
        };

        await writeJsonFile('users.json', users);

        const { password: _removed, ...safeUser } = users[index];
        res.json({ success: true, user: safeUser });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Deletar usuário e dados associados
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const adminContext = await requireAdmin(req, res);
        if (!adminContext) return;

        const { id } = req.params;
        const users = adminContext.users;
        const exists = users.find(u => u.id === id);

        if (!exists) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const filteredUsers = users.filter(u => u.id !== id);
        const [products, comandas, transacoes] = await Promise.all([
            readJsonFile('products.json'),
            readJsonFile('comandas.json'),
            readJsonFile('transacoes.json')
        ]);

        const cleanedProducts = products.filter(p => p.userId !== id);
        const cleanedComandas = comandas.filter(c => c.userId !== id);
        const cleanedTransacoes = transacoes.filter(t => t.userId !== id);

        await Promise.all([
            writeJsonFile('users.json', filteredUsers),
            writeJsonFile('products.json', cleanedProducts),
            writeJsonFile('comandas.json', cleanedComandas),
            writeJsonFile('transacoes.json', cleanedTransacoes)
        ]);

        res.json({
            success: true,
            removedUserId: id,
            removedData: {
                products: products.length - cleanedProducts.length,
                comandas: comandas.length - cleanedComandas.length,
                transacoes: transacoes.length - cleanedTransacoes.length
            }
        });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ============= INICIALIZAR SERVIDOR =============

async function startServer() {
    try {
        await ensureDataDir();
        
        const os = require('os');
        const networkInterfaces = os.networkInterfaces();
        let localIP = 'localhost';
        
        // Encontrar o IP da rede local
        for (const interfaceName in networkInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            for (const iface of interfaces) {
                // Ignorar endereços não IPv4 ou internos
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIP = iface.address;
                    break;
                }
            }
            if (localIP !== 'localhost') break;
        }
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Servidor rodando!`);
            console.log(`📱 Acesse localmente: http://localhost:${PORT}/index.html`);
            if (localIP !== 'localhost') {
                console.log(`🌐 Acesse de outros dispositivos na rede: http://${localIP}:${PORT}/index.html`);
            }
            console.log(`\n💡 Para acessar de outros dispositivos, use o IP acima na mesma rede Wi-Fi/Ethernet`);
        });
        
        // Tratamento de erros não capturados
        app.use((err, req, res, next) => {
            console.error('Erro no servidor:', err);
            res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();
