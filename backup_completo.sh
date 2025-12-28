#!/bin/bash

# Script de Backup Completo do Sistema Financeiro
# Inclui tudo, incluindo node_modules (útil para backup completo)

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="Sistema Financeiro"

# Diretório onde salvar o backup (pode ser alterado)
BACKUP_DIR="$HOME/Backups"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Data e hora para nomear o backup
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${PROJECT_NAME}_backup_completo_${DATE}.tar.gz"

# Criar o backup
echo "🔄 Criando backup completo do projeto..."
echo "📦 Diretório: $PROJECT_DIR"
echo "💾 Arquivo: $BACKUP_FILE"

# Criar arquivo tar.gz (inclui tudo, exceto alguns arquivos temporários)
tar -czf "$BACKUP_FILE" \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    -C "$PROJECT_DIR" .

# Verificar se o backup foi criado com sucesso
if [ $? -eq 0 ]; then
    # Obter tamanho do arquivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup completo criado com sucesso!"
    echo "📊 Tamanho: $SIZE"
    echo "📍 Localização: $BACKUP_FILE"
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

