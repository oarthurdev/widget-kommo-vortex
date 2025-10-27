# Kommo Tag Analytics Widget - Guia de Instalação

## 🎯 Visão Geral

Este projeto contém um widget para Kommo CRM que exibe análises visuais de leads organizados por tags ativas. O widget mostra:

- Total de tags únicas na conta
- Distribuição de leads por tag
- Barras de progresso mostrando percentuais
- Interface com tema azul escuro profissional

## 📋 Pré-requisitos

1. Conta ativa no Kommo CRM
2. Acesso de administrador à conta Kommo
3. Chave de API do Kommo
4. Servidor para hospedar o backend (ou usar este Replit)

## 🚀 Instalação Rápida

### Passo 1: Configurar Variáveis de Ambiente

As variáveis já estão configuradas no Replit:

- ✅ `KOMMO_API_KEY` - Sua chave de API do Kommo
- ✅ `KOMMO_DOMAIN` - Seu domínio Kommo (ex: seudominio.kommo.com)

### Passo 2: Testar o Backend

1. Acesse a URL principal do Replit para ver o preview do widget
2. Verifique se os dados de tags estão sendo carregados corretamente
3. Teste os endpoints da API:
   - `GET /api/kommo/tags/statistics` - Estatísticas de tags
   - `GET /api/kommo/tags` - Lista de tags
   - `GET /api/kommo/leads` - Lista de leads

### Passo 3: Preparar Widget para Upload no Kommo

Execute os seguintes comandos para criar o arquivo ZIP:

```bash
# Navegue até a pasta widget
cd widget

# Crie o arquivo ZIP (arquivos devem estar na raiz)
zip -r ../kommo-tag-analytics.zip manifest.json script.js style.css index.html i18n/

# Volte para a raiz
cd ..
```

### Passo 4: Upload no Kommo

1. **Acesse o Kommo CRM**
   - Faça login na sua conta Kommo
   - Vá em **Configurações** (ícone de engrenagem)

2. **Navegue até Widgets**
   - Clique em **API**
   - Selecione **Widgets**
   - Clique em **Upload Widget**

3. **Faça Upload do Arquivo**
   - Selecione o arquivo `kommo-tag-analytics.zip`
   - Aguarde o processamento
   - Clique em **Salvar**

4. **Configure o Widget**
   - **Backend URL**: Cole a URL do seu servidor Replit (ex: `https://seu-replit.repl.co`)
   - API Key: Cole sua chave de API
   - Domain: Digite seu domínio (ex: `seudominio.kommo.com`)
   - Refresh Interval: 60 (segundos)

5. **Ative o Widget**
   - Marque a caixa "Ativo"
   - Clique em **Salvar**

### Passo 5: Adicionar aos Cards

1. Abra um **Lead**, **Contato** ou **Empresa**
2. No card, clique no **menu de tabs** (ícone "..." ao lado das abas)
3. Selecione **Tag Analytics** para adicionar a tab
4. O widget carregará e exibirá as estatísticas

## 🔧 Configuração Avançada

### Customizar URL do Backend

Se você quiser usar um servidor diferente para o backend, edite o arquivo `widget/script.js`:

```javascript
// Linha ~7
this.getApiBaseUrl = function() {
  if (!apiBaseUrl) {
    // Altere para sua URL customizada
    apiBaseUrl = 'https://seu-servidor.com/api/kommo';
  }
  return apiBaseUrl;
};
```

### Ajustar Limite de Tags Exibidas

No arquivo `server/kommo-service.ts`, linha ~115:

```typescript
// Altere o valor para exibir mais ou menos tags
const maxTagsToShow = 10; // Padrão: 10 tags
```

### Modificar Intervalo de Atualização Padrão

No widget, você pode forçar atualizações automáticas adicionando em `script.js`:

```javascript
// Adicione no callback bind_actions
setInterval(function() {
  self.renderDashboard();
}, 60000); // Atualiza a cada 60 segundos
```

## 🎨 Personalização Visual

### Mudar Cores das Tags

Edite `widget/script.js`, função `getTagColor()`:

```javascript
this.getTagColor = function(index) {
  var colors = [
    '#FDB022', // Suas cores aqui
    '#F5A623',
    // ... adicione mais cores
  ];
  return colors[index % colors.length];
};
```

### Alterar Tema de Cores

Edite `widget/style.css`:

```css
.tag-analytics-container {
  background-color: #1a2332; /* Mude para sua cor */
}

.tag-total {
  color: #7e8ae6; /* Cor do número total */
}
```

## 📊 API do Backend

### Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/kommo/tags/statistics` | GET | Retorna estatísticas completas de tags |
| `/api/kommo/tags` | GET | Lista todas as tags ativas |
| `/api/kommo/tags/search?q=query` | GET | Busca tags por nome |
| `/api/kommo/leads?limit=250` | GET | Lista leads com suas tags |

### Exemplo de Resposta

```json
{
  "totalTags": 5,
  "totalLeads": 100,
  "tags": [
    {
      "id": 1234,
      "name": "atendimento humano",
      "color": "#FDB022",
      "leadCount": 46,
      "percentage": 46
    }
  ],
  "othersCount": 0,
  "lastUpdated": "2025-10-27T15:30:00.000Z"
}
```

## 🐛 Solução de Problemas

### Widget não aparece nos cards

**Problema**: Após instalação, o widget não aparece no menu de tabs.

**Solução**:
1. Verifique se o widget está marcado como "Ativo" nas configurações
2. Atualize a página do Kommo (F5)
3. Verifique se você tem permissões de administrador

### Erro ao carregar dados

**Problema**: Widget exibe mensagem de erro.

**Solução**:
1. Verifique as credenciais (API Key e Domain) nas configurações do widget
2. Confirme que o backend está rodando
3. Teste o endpoint diretamente: `https://seu-replit.repl.co/api/kommo/tags/statistics`
4. Verifique os logs do navegador (F12 → Console)

### Tags não aparecem ou estão vazias

**Problema**: O widget mostra "0 tags" ou lista vazia.

**Solução**:
1. Verifique se há leads com tags na sua conta Kommo
2. Confirme que as tags estão ativas
3. Teste a API do Kommo diretamente para ver se retorna dados

### Erro de CORS

**Problema**: Console mostra erro de CORS ao acessar a API.

**Solução**:
Este projeto já está configurado para aceitar requisições do Kommo. Se o problema persistir:

1. Adicione o domínio do Kommo aos headers CORS no backend
2. Verifique se o Replit está público e acessível

## 📦 Estrutura de Arquivos do Projeto

```
.
├── widget/                    # Arquivos do widget Kommo
│   ├── manifest.json         # Configuração do widget
│   ├── script.js             # Lógica principal (AMD)
│   ├── style.css             # Estilos (tema azul)
│   ├── index.html            # Preview
│   ├── i18n/                 # Traduções
│   │   ├── en.json          # Inglês
│   │   └── pt.json          # Português
│   └── README.md             # Documentação do widget
├── server/                    # Backend Node.js
│   ├── kommo-service.ts      # Serviço da API Kommo
│   └── routes.ts             # Endpoints da API
└── WIDGET_SETUP.md           # Este arquivo
```

## 🔐 Segurança

- **Nunca** compartilhe sua `KOMMO_API_KEY` publicamente
- Use variáveis de ambiente (Replit Secrets) para credenciais
- O widget não armazena dados sensíveis localmente
- Todas as comunicações com a API usam HTTPS

## 📞 Suporte

Se você encontrar problemas:

1. Verifique este guia de solução de problemas
2. Consulte a [documentação oficial do Kommo](https://developers.kommo.com)
3. Verifique os logs do servidor e do navegador

## ✅ Checklist de Instalação

- [ ] Variáveis de ambiente configuradas (KOMMO_API_KEY, KOMMO_DOMAIN)
- [ ] Backend testado e funcionando
- [ ] Arquivo ZIP do widget criado
- [ ] Widget enviado para o Kommo
- [ ] Widget configurado com credenciais
- [ ] Widget ativado nas configurações
- [ ] Widget adicionado a um card de teste
- [ ] Dados de tags carregando corretamente

---

**Desenvolvido para Kommo CRM** | Versão 1.0.0
