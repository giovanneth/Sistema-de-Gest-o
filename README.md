# 🍢 Sistema de Gestão de Espetinho

Sistema completo de gestão para espetarias com controle de comandas, produtos, estoque e finanças.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- npm (geralmente vem com Node.js)

### Passos para Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Iniciar o servidor:**
```bash
npm start
```

3. **Acessar o sistema:**
   - No mesmo computador: `http://localhost:3000/index.html`
   - Em outros dispositivos na mesma rede: use o IP que aparecerá no terminal
     - Exemplo: `http://192.168.1.100:3000/index.html`
   - O terminal mostrará ambos os endereços quando o servidor iniciar

O servidor ficará rodando na porta 3000. **IMPORTANTE:** Mantenha o servidor rodando enquanto usar o sistema.

### 🌐 Acessar de Outros Dispositivos

Para acessar o sistema de tablets, celulares ou outros computadores na mesma rede:

1. **Certifique-se de que todos os dispositivos estão na mesma rede Wi-Fi/Ethernet**
2. **Quando iniciar o servidor (`npm start`), ele mostrará o IP da rede local**
   - Exemplo: `http://192.168.1.100:3000/index.html`
3. **Use esse IP nos outros dispositivos**
4. **Firewall:** Se não funcionar, pode ser necessário permitir a porta 3000 no firewall do sistema

## Funcionalidades

### 🔐 Autenticação
- Sistema de login com usuário/email e senha
- Registro automático na primeira utilização
- Cada usuário tem seus próprios dados isolados
- Dados salvos em arquivos JSON no servidor

### 📊 Dashboard
- Visão geral das vendas do dia
- Número de comandas abertas
- Controle de estoque
- Relatórios financeiros resumidos
- Navegação rápida para todas as funcionalidades

### 📋 Controle de Comandas
- Cadastro, edição e exclusão de comandas
- Adição de múltiplos produtos por comanda
- Controle de quantidade
- Status: Aberta ou Finalizada
- Atualização automática de estoque ao finalizar
- Registro automático de vendas no financeiro

### 🍢 Controle de Produtos
- Cadastro completo de produtos (nome, categoria, preço, estoque)
- Edição e exclusão de produtos
- Atualização automática de estoque quando vendidos
- Categorização de produtos

### 💰 Controle Financeiro
- Registro de entradas (vendas)
- Registro de saídas (despesas) com categorização
- Filtros por tipo e mês
- Relatórios de entradas, saídas e saldo
- Categorização de despesas (ex: compra de carne, gás, aluguel)

## Como Usar

### Primeiro Acesso

1. Certifique-se de que o servidor está rodando (`npm start`)
2. Abra `http://localhost:3000/index.html` no navegador
3. Insira um nome de usuário (ou email) e senha
4. Clique em "Entrar" - uma nova conta será criada automaticamente

### Navegação

- **Dashboard**: Página inicial com visão geral
- **Comandas**: Gerenciar pedidos e comandas
- **Produtos**: Cadastrar e gerenciar produtos
- **Financeiro**: Controlar entradas e saídas

### Fluxo de Trabalho Sugerido

1. **Cadastre os produtos** primeiro (Produtos → Novo Produto)
2. **Crie comandas** conforme os pedidos chegam (Comandas → Nova Comanda)
3. **Finalize as comandas** quando o cliente pagar (isso atualiza o estoque e registra a venda)
4. **Registre despesas** no Financeiro (Financeiro → Nova Saída)
5. **Acompanhe o saldo** no Dashboard e na página Financeiro

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- Sistema de arquivos para armazenamento (JSON)

## Estrutura de Arquivos

```
Sistema Financeiro/
├── index.html              # Página de login
├── dashboard.html          # Dashboard principal
├── comandas.html           # Controle de comandas
├── produtos.html           # Controle de produtos
├── financeiro.html         # Controle financeiro
├── server.js               # Servidor Node.js/Express
├── package.json            # Configurações e dependências npm
├── css/
│   └── style.css          # Estilos globais
├── js/
│   ├── api.js             # Funções de comunicação com API
│   ├── auth.js            # Autenticação
│   ├── app.js             # Funções auxiliares
│   ├── dashboard.js       # Lógica do dashboard
│   ├── comandas.js        # Lógica de comandas
│   ├── produtos.js        # Lógica de produtos
│   └── financeiro.js      # Lógica financeira
├── data/                   # Dados armazenados (JSON)
│   ├── users.json         # Usuários cadastrados
│   ├── products.json      # Produtos
│   ├── comandas.json      # Comandas
│   └── transacoes.json    # Transações financeiras
└── README.md              # Este arquivo
```

## Armazenamento de Dados

Todos os dados são salvos em arquivos JSON na pasta `data/`:
- `users.json` - Usuários e suas credenciais
- `products.json` - Todos os produtos cadastrados (separados por usuário)
- `comandas.json` - Todas as comandas (separadas por usuário)
- `transacoes.json` - Todas as transações financeiras (separadas por usuário)

**Importante:** Cada usuário só pode acessar seus próprios dados. O sistema isola os dados por ID do usuário.

## Características do Sistema

- ✅ **Multiusuário**: Cada usuário tem seus próprios dados isolados
- ✅ **Armazenamento no Servidor**: Dados salvos em arquivos JSON no servidor
- ✅ **Autenticação Simples**: Usuário/email e senha
- ✅ **Responsivo**: Funciona bem em desktop e dispositivos móveis
- ✅ **Design Minimalista**: Interface preto e branco, moderna e limpa
- ✅ **Atualização Automática**: Estoque e finanças atualizados automaticamente

## Observações Importantes

- O servidor precisa estar rodando para o sistema funcionar
- Os dados são armazenados localmente na pasta `data/` do projeto
- Para fazer backup, basta copiar a pasta `data/`
- Se você parar o servidor, os dados não serão perdidos (estão salvos nos arquivos JSON)

## Solução de Problemas

### Erro: "Erro ao carregar produtos. Verifique se o servidor está rodando."
- Certifique-se de que executou `npm start`
- Verifique se a porta 3000 está disponível
- Veja os logs no terminal onde o servidor está rodando

### Erro ao fazer login
- Certifique-se de que o servidor está rodando
- Verifique o console do navegador (F12) para mais detalhes
- Tente criar uma nova conta com outro usuário/senha

## Desenvolvimento

Para desenvolvimento, você pode usar:
```bash
npm start
```

O servidor ficará rodando e você pode fazer alterações nos arquivos HTML, CSS e JavaScript. Recarregue a página no navegador para ver as mudanças.

## Suporte

Este é um sistema desenvolvido para uso local. Para personalizações ou melhorias, você pode editar os arquivos HTML, CSS e JavaScript diretamente.
