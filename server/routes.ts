import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createKommoService, KommoService } from "./kommo-service";
import express from "express";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware - allow requests from Kommo domains
  app.use((req, res, next) => {
    // Allow requests from any Kommo subdomain and localhost for testing
    const origin = req.headers.origin;
    const allowedOrigins = [
      /^https?:\/\/.*\.kommo\.com$/,
      /^https?:\/\/.*\.amocrm\.(ru|com)$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/.*\.replit\.dev$/,
      /^https?:\/\/.*\.repl\.co$/
    ];

    if (origin && allowedOrigins.some(pattern => pattern.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Widget-Settings');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Serve widget files statically

  app.use(
    '/widget',
    express.static(path.resolve(__dirname, 'widget'), {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache');
      },
    })
  );


  // Kommo API endpoints
  app.get('/api/kommo/tags/statistics', async (req, res) => {
    try {
      // Get settings from header (sent by widget) or use environment variables
      const widgetSettings = req.headers['x-widget-settings'];
      let kommoService: KommoService;

      if (widgetSettings && typeof widgetSettings === 'string') {
        const settings = JSON.parse(widgetSettings);
        if (settings.apiKey && settings.domain) {
          kommoService = new KommoService(settings.domain, settings.apiKey);
        } else {
          kommoService = createKommoService();
        }
      } else {
        kommoService = createKommoService();
      }

      // Get filter parameters from query string
      const filters: any = {};

      if (req.headers.referer) {
        try {
          // Cria um objeto URL a partir do referer
          const refererUrl = new URL(req.headers.referer);

          // Extrai os parâmetros da query string
          const params = refererUrl.searchParams;

          // Mapeia os filtros conforme a necessidade
          if (params.get("period")) filters.period = params.get("period");
          if (params.get("type")) filters.type = params.get("type");
          if (params.get("date_from")) filters.dateFrom = params.get("date_from");
          if (params.get("date_to")) filters.dateTo = params.get("date_to");
        } catch (error) {
          console.error("Erro ao processar referer:", error);
        }
      }

      const statistics = await kommoService.getTagStatistics(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.json(statistics);
    } catch (error: any) {
      console.error('Error getting tag statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tag statistics', 
        message: error.message 
      });
    }
  });

  app.get('/api/kommo/tags', async (req, res) => {
    try {
      const kommoService = createKommoService();
      const tags = await kommoService.getTags();
      res.json({ tags });
    } catch (error: any) {
      console.error('Error getting tags:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tags', 
        message: error.message 
      });
    }
  });

  app.get('/api/kommo/tags/search', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const kommoService = createKommoService();
      const tags = await kommoService.searchTags(query);
      res.json({ tags });
    } catch (error: any) {
      console.error('Error searching tags:', error);
      res.status(500).json({ 
        error: 'Failed to search tags', 
        message: error.message 
      });
    }
  });

  app.get('/api/kommo/leads', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 250;
      const kommoService = createKommoService();
      const leads = await kommoService.getLeads(limit);
      res.json({ leads, count: leads.length });
    } catch (error: any) {
      console.error('Error getting leads:', error);
      res.status(500).json({ 
        error: 'Failed to fetch leads', 
        message: error.message 
      });
    }
  });

  // Widget preview page
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kommo Tag Analytics Widget</title>
        <link rel="stylesheet" href="/widget/style.css">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .preview-container {
            max-width: 600px;
            width: 100%;
          }
          h1 {
            color: white;
            text-align: center;
            margin-bottom: 12px;
            font-size: 32px;
            font-weight: 700;
          }
          .subtitle {
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            margin-bottom: 32px;
            font-size: 16px;
          }
          .widget-wrapper {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .info {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
            color: #333;
          }
          .info h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 18px;
          }
          .info ul {
            margin: 12px 0;
            padding-left: 20px;
          }
          .info li {
            margin: 8px 0;
          }
          .info code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 13px;
          }
          .download-btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 16px;
            transition: background 0.2s;
          }
          .download-btn:hover {
            background: #5568d3;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="widget-wrapper">
            <div id="tag-analytics-widget"></div>
          </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
          $(document).ready(function() {
            var $container = $('#tag-analytics-widget');
            $container.html('<div class="tag-loading">Carregando dados de tags...</div>');

            $.ajax({
              url: '/api/kommo/tags/statistics',
              method: 'GET',
              dataType: 'json',
              success: function(data) {
                var html = buildDashboardHTML(data);
                $container.html(html);
              },
              error: function(xhr, status, error) {
                $container.html('<div class="tag-error">Erro ao carregar dados. Verifique se as credenciais KOMMO_API_KEY e KOMMO_DOMAIN estão configuradas.</div>');
              }
            });

            function buildDashboardHTML(data) {
              var totalTags = data.totalTags || 0;
              var tags = data.tags || [];
              var totalLeads = data.totalLeads || 0;

              var html = '<div class="tag-analytics-container">';
              
              html += '<div class="tag-header">';
              html += '<div class="tag-title">TAG</div>';
              html += '<div class="tag-total">' + totalTags + '</div>';
              html += '</div>';

              html += '<div class="tag-list">';
              
              if (tags.length === 0) {
                html += '<div class="tag-empty">Nenhuma tag ativa encontrada</div>';
              } else {
                tags.forEach(function(tag, index) {
                  var percentage = tag.percentage || 0;
                  var tagColor = tag.color || getTagColor(index);
                  
                  html += '<div class="tag-item">';
                  html += '<div class="tag-item-header">';
                  html += '<span class="tag-name" style="background-color: ' + tagColor + '">' + tag.name + '</span>';
                  html += '<span class="tag-count"><strong>' + tag.leadCount + '</strong> leads</span>';
                  html += '</div>';
                  html += '<div class="tag-progress-container">';
                  html += '<div class="tag-progress-bar">';
                  html += '<div class="tag-progress-fill" style="width: ' + percentage + '%; background-color: ' + tagColor + '"></div>';
                  html += '</div>';
                  html += '<span class="tag-percentage">' + percentage + '%</span>';
                  html += '</div>';
                  html += '</div>';
                });

                if (data.othersCount && data.othersCount > 0) {
                  html += '<div class="tag-others">Outros <strong>' + data.othersCount + '</strong></div>';
                }
              }
              
              html += '</div>';
              html += '</div>';

              return html;
            }

            function getTagColor(index) {
              var colors = [
                '#FDB022', '#F5A623', '#7B8CDE', '#A3D977',
                '#98A2B3', '#FF6B9D', '#50C8FF', '#FFD93D'
              ];
              return colors[index % colors.length];
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
