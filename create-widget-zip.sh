#!/bin/bash

# Script para criar o arquivo ZIP do widget Kommo
# Os arquivos devem estar na raiz do ZIP, não em uma pasta

echo "🔧 Criando widget ZIP para Kommo..."

# Remove ZIP anterior se existir
rm -f kommo-tag-analytics.zip

# Navega até a pasta widget
cd widget

# Cria o ZIP com os arquivos necessários na raiz
zip -r ../kommo-tag-analytics.zip \
  manifest.json \
  script.js \
  style.css \
  index.html \
  i18n/ \
  images/ \
  -x "*.DS_Store" \
  -x "__MACOSX/*" \
  -x "README.md"

cd ..

echo "✅ Widget ZIP criado: kommo-tag-analytics.zip"
echo ""
echo "📋 Próximos passos:"
echo "1. Baixe o arquivo kommo-tag-analytics.zip"
echo "2. Acesse Kommo CRM → Configurações → API → Widgets"
echo "3. Faça upload do arquivo ZIP"
echo "4. Configure com suas credenciais (API Key e Domain)"
echo "5. Ative o widget e adicione-o aos cards"
echo ""
echo "📖 Para mais detalhes, consulte WIDGET_SETUP.md"
