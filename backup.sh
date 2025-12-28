#!/bin/bash

# Script de Backup do Sistema Financeiro
# Cria um arquivo compactado com todos os arquivos do projeto (exceto node_modules)

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="Sistema Financeiro"

# Diretório onde salvar o backup (pode ser alterado)
BACKUP_DIR="$HOME/Backups"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Data e hora para nomear o backup
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${PROJECT_NAME}_backup_${DATE}.tar.gz"

# Criar o backup
echo "🔄 Criando backup do projeto..."
echo "📦 Diretório: $PROJECT_DIR"
echo "💾 Arquivo: $BACKUP_FILE"

# Criar arquivo tar.gz excluindo node_modules e outros arquivos desnecessários
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    -C "$PROJECT_DIR" .

# Verificar se o backup foi criado com sucesso
if [ $? -eq 0 ]; then
    # Obter tamanho do arquivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup criado com sucesso!"
    echo "📊 Tamanho: $SIZE"
    echo "📍 Localização: $BACKUP_FILE"
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

