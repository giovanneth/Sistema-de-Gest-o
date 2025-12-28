# 📦 Guia de Backup do Sistema Financeiro

Este documento descreve as diferentes formas de fazer backup do projeto.

## 🔧 Métodos de Backup

### 1. Backup Manual (Recomendado - Rápido)

Use o script `backup.sh` para criar um backup compactado sem node_modules:

```bash
chmod +x backup.sh
./backup.sh
```

O backup será salvo em `~/Backups/Sistema Financeiro_backup_YYYY-MM-DD_HH-MM-SS.tar.gz`

### 2. Backup Completo

Use o script `backup_completo.sh` para criar um backup incluindo node_modules:

```bash
chmod +x backup_completo.sh
./backup_completo.sh
```

⚠️ **Nota**: Este backup será maior pois inclui todas as dependências.

### 3. Usando Git (Recomendado para Controle de Versão)

O projeto já está configurado com Git. Para fazer backup remoto:

```bash
# Adicionar todas as mudanças
git add .

# Fazer commit
git commit -m "Backup: $(date +'%Y-%m-%d %H:%M:%S')"

# Enviar para repositório remoto (se configurado)
git push origin main

# Ou criar um novo repositório remoto:
# 1. Criar repositório no GitHub/GitLab
# 2. git remote add origin <URL_DO_REPOSITORIO>
# 3. git push -u origin main
```

### 4. Backup Manual com tar

Para criar um backup manual sem script:

```bash
# Backup sem node_modules (mais leve)
tar -czf ~/Backups/sistema_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    -C "/home/giovanne-queiroz/Downloads/Sistema Financeiro" .

# Backup completo
tar -czf ~/Backups/sistema_backup_completo_$(date +%Y%m%d_%H%M%S).tar.gz \
    -C "/home/giovanne-queiroz/Downloads/Sistema Financeiro" .
```

## 📍 Localização dos Backups

Por padrão, os backups são salvos em: `~/Backups/`

Para alterar o diretório, edite a variável `BACKUP_DIR` nos scripts.

## 🔄 Restaurar um Backup

Para restaurar um backup:

```bash
# Criar diretório de destino
mkdir -p ~/restauracao

# Extrair o backup
tar -xzf ~/Backups/Sistema\ Financeiro_backup_YYYY-MM-DD_HH-MM-SS.tar.gz -C ~/restauracao

# Se necessário, reinstalar dependências
cd ~/restauracao
npm install
```

## ⏰ Agendamento Automático (Opcional)

Para fazer backups automáticos diários, adicione ao crontab:

```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 2h da manhã
0 2 * * * cd "/home/giovanne-queiroz/Downloads/Sistema Financeiro" && ./backup.sh
```

## 📋 Checklist de Backup

- [ ] Dados importantes em `data/` (comandas.json, products.json, transacoes.json, users.json)
- [ ] Código fonte (HTML, CSS, JavaScript)
- [ ] Configurações (package.json, server.js)
- [ ] Arquivos de documentação (README.md)

## ⚠️ Importante

- Faça backups regulares dos dados em `data/`
- Considere usar Git para controle de versão do código
- Para dados críticos, considere fazer backup em múltiplos locais
- Teste periodicamente a restauração dos backups

