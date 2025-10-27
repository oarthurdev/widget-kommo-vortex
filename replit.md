# Kommo Tag Analytics Widget

## 📋 Visão Geral do Projeto

Este projeto implementa um widget customizado para Kommo CRM que exibe análises visuais de leads organizados por tags ativas. O widget é instalado diretamente no Kommo e aparece como uma tab nos cards de leads, contatos e empresas.

## 🎯 Objetivo

Fornecer aos usuários do Kommo uma visualização clara e imediata da distribuição de leads por tags, incluindo:
- Total de tags ativas
- Quantidade de leads por tag
- Percentual de distribuição
- Interface visual com tema azul escuro profissional

## 🏗️ Arquitetura

### Estrutura do Widget (Frontend - Kommo Native)
```
widget/
├── manifest.json          # Configuração e metadados do widget
├── script.js             # Lógica principal (padrão AMD/RequireJS do Kommo)
├── style.css             # Tema visual azul escuro
├── index.html            # Preview/teste local
└── i18n/                 # Internacionalização
    ├── en.json          # Inglês
    └── pt.json          # Português
```

### Backend (Node.js + Express)
```
server/
├── kommo-service.ts      # Serviço de integração com API Kommo
├── routes.ts             # Endpoints REST para o widget
├── storage.ts            # Interface de storage (não usado para tags)
└── index.ts              # Servidor Express principal
```

## 🔧 Tecnologias Utilizadas

**Widget Kommo:**
- JavaScript (padrão AMD/RequireJS)
- jQuery (disponível no ambiente Kommo)
- HTML5/CSS3
- Kommo Card SDK

**Backend:**
- Node.js 20
- Express.js
- TypeScript
- Axios (cliente HTTP para API Kommo)

**API Externa:**
- Kommo REST API v4

## 📡 Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Preview do widget com dados reais |
| `/widget/*` | GET | Arquivos estáticos do widget |
| `/api/kommo/tags/statistics` | GET | Retorna estatísticas completas de tags e leads |
| `/api/kommo/tags` | GET | Lista todas as tags ativas |
| `/api/kommo/tags/search?q=` | GET | Busca tags por nome |
| `/api/kommo/leads?limit=` | GET | Lista leads com suas tags |

## 🔐 Variáveis de Ambiente

```env
KOMMO_API_KEY=your_api_key_here
KOMMO_DOMAIN=yourdomain.kommo.com
SESSION_SECRET=random_secret_for_sessions
```

## 🎨 Design System

### Tema de Cores (Dark Blue)

**Principais:**
- Fundo principal: `#1a2332`
- Fundo gradiente: `#1e2a3d` → `#2a3b52`
- Número total (destaque): `#7e8ae6` (roxo/azul)
- Texto primário: `#e1e8ed`
- Texto secundário: `#8b95a8`

**Cores das Tags (Auto-atribuídas):**
1. `#FDB022` - Amarelo/Laranja
2. `#F5A623` - Laranja
3. `#7B8CDE` - Azul/Roxo
4. `#A3D977` - Verde Claro
5. `#98A2B3` - Cinza/Azul
6. `#FF6B9D` - Rosa
7. `#50C8FF` - Ciano
8. `#FFD93D` - Amarelo

### Tipografia
- Família: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- Título "TAG": 14px, uppercase, weight 600
- Número total: 56px, weight 700
- Nomes de tags: 13px, weight 500
- Contagens: 13-14px, weight 400-600

### Componentes
- Cards com fundo semi-transparente
- Progress bars com altura de 8px
- Border radius de 4-8px
- Scrollbar customizada (6px de largura)
- Hover states suaves

## 📦 Instalação e Deploy

### Passo 1: Configurar Backend (Replit)
1. As variáveis de ambiente já estão configuradas
2. O servidor roda automaticamente em `npm run dev`
3. Acesse a URL do Replit para testar

### Passo 2: Criar Widget ZIP
```bash
./create-widget-zip.sh
```

Ou manualmente:
```bash
cd widget
zip -r ../kommo-tag-analytics.zip manifest.json script.js style.css index.html i18n/
cd ..
```

### Passo 3: Upload no Kommo
1. Kommo CRM → Configurações → API → Widgets
2. Upload do arquivo ZIP
3. Configurar credenciais (API Key e Domain)
4. Ativar widget

### Passo 4: Adicionar aos Cards
1. Abrir um card (Lead/Contato/Empresa)
2. Menu de tabs (...) → Selecionar "Tag Analytics"
3. Widget carrega automaticamente

## 🔄 Fluxo de Dados

```
[Kommo Card] 
    ↓ (usuário abre tab)
[Widget Script.js] 
    ↓ (AJAX request)
[Backend /api/kommo/tags/statistics]
    ↓ (busca dados)
[Kommo API v4]
    ↓ (retorna leads e tags)
[KommoService] 
    ↓ (processa estatísticas)
[Widget] 
    ↓ (renderiza HTML)
[Usuário vê dashboard]
```

## 🧪 Testes

### Testar Backend Localmente
```bash
# Teste endpoint de estatísticas
curl https://your-replit.repl.co/api/kommo/tags/statistics

# Teste lista de tags
curl https://your-replit.repl.co/api/kommo/tags
```

### Testar Widget
1. Acesse a URL principal do Replit
2. Veja o preview com dados reais
3. Verifique se as tags estão sendo exibidas corretamente

## 📊 Estrutura de Dados

### Tag Statistics Response
```typescript
{
  totalTags: number;        // Total de tags únicas com leads
  totalLeads: number;       // Total de leads com tags
  tags: Array<{
    id: number;            // ID da tag no Kommo
    name: string;          // Nome da tag
    color?: string;        // Cor hexadecimal (opcional)
    leadCount: number;     // Quantidade de leads com esta tag
    percentage: number;    // Percentual sobre o total
  }>;
  othersCount: number;     // Leads em tags não mostradas (após top 10)
  lastUpdated: string;     // ISO timestamp da última atualização
}
```

## 🔍 Implementação do Card SDK

O widget implementa os 4 callbacks obrigatórios do Kommo Card SDK:

### loadPreloadedData()
Retorna tags iniciais para o dropdown de busca (convertidas para formato "produto")

### loadElements(type, id)
Retorna array vazio pois não vinculamos tags aos cards (apenas análise)

### linkCard(links)
Log das ações mas não implementa vínculo (widget é read-only)

### searchDataInCard(query, type, id)
Filtra tags por nome baseado na query do usuário

## 🛠️ Desenvolvimento

### Executar Localmente
```bash
npm install
npm run dev
```

### Estrutura de Scripts
- `npm run dev` - Inicia servidor de desenvolvimento
- `./create-widget-zip.sh` - Cria arquivo ZIP do widget

### Adicionar Nova Tradução
1. Criar arquivo `widget/i18n/[codigo].json`
2. Adicionar código em `manifest.json` → `locale`
3. Traduzir todas as chaves do i18n

## 🐛 Problemas Conhecidos

### Widget não carrega dados
- Verificar credenciais KOMMO_API_KEY e KOMMO_DOMAIN
- Confirmar que backend está acessível
- Checar logs do navegador (F12)

### Tags não aparecem
- Verificar se há leads com tags na conta Kommo
- Confirmar que tags estão ativas
- Testar endpoint `/api/kommo/tags` diretamente

### Erro de CORS
- Backend está configurado para aceitar requisições do Kommo
- Verificar se domínio do Replit está público

## 📝 Histórico de Mudanças

**Versão 1.0.0** (27/10/2025)
- ✅ Implementação inicial do widget
- ✅ Backend com integração Kommo API v4
- ✅ Interface visual tema azul escuro
- ✅ Suporte para português e inglês
- ✅ Card SDK callbacks implementados
- ✅ Preview standalone funcionando
- ✅ Documentação completa

## 🤝 Contribuindo

Este widget foi desenvolvido especificamente para Kommo CRM. Para modificações:

1. Edite os arquivos em `widget/`
2. Teste localmente acessando a URL do Replit
3. Recrie o ZIP com `./create-widget-zip.sh`
4. Faça novo upload no Kommo

## 📚 Referências

- [Kommo Card SDK Documentation](https://www.kommo.com/developers/content/integrations/sdk_card/)
- [Kommo API v4 Documentation](https://developers.kommo.com/reference/api-overview)
- [Widget Structure](https://developers.kommo.com/docs/structure-widget)
- [Kommo Locations](https://developers.kommo.com/docs/widget-locations)

## 👤 Autoria

Desenvolvido para análise de leads por tags no Kommo CRM.

---

**Status do Projeto**: ✅ Pronto para produção
**Última Atualização**: 27 de Outubro de 2025
