define(['jquery'], function($) {
  var TagAnalyticsWidget = function() {
    var self = this;
    var apiBaseUrl = '';
    var refreshInterval = null; // Variable to hold the interval ID

    // Initialize API base URL from widget settings
    this.getApiBaseUrl = function() {
      if (!apiBaseUrl) {
        var settings = self.get_settings();
        // Use configured backend URL or fallback to current domain for local testing
        if (settings.backend_url) {
          apiBaseUrl = settings.backend_url.replace(/\/$/, '') + '/api/kommo';
        } else {
          // Fallback for local testing
          apiBaseUrl = window.location.protocol + '//' + window.location.hostname + '/api/kommo';
        }
      }
      return apiBaseUrl;
    };

    // Parse URL parameters for filters
    this.parseUrlFilters = function() {
      var params = {};
      var urlParams = new URLSearchParams(window.location.search);

      // Check for period parameter
      if (urlParams.has('period')) {
        params.period = urlParams.get('period');
      }

      // Check for custom date range
      if (urlParams.has('from') && urlParams.has('to')) {
        params.dateFrom = urlParams.get('from');
        params.dateTo = urlParams.get('to');
      }

      // Check for type parameter
      if (urlParams.has('type')) {
        params.type = urlParams.get('type');
      }

      return params;
    },

    // Fetch tag statistics from backend
    this.fetchTagStats = function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        var filters = self.parseUrlFilters();
        var queryString = $.param(filters);
        var url = self.getApiBaseUrl() + '/tags/statistics'; // Use getApiBaseUrl
        if (queryString) {
          url += '?' + queryString;
        }

        var settings = self.get_settings(); // Get settings here

        $.ajax({
          url: url,
          method: 'GET',
          dataType: 'json',
          headers: {
            'X-Widget-Settings': JSON.stringify({
              apiKey: settings.api_key || '', // Use settings from get_settings
              domain: settings.domain || '' // Use settings from get_settings
            })
          },
          success: function(data) {
            resolve(data);
          },
          error: function(xhr, status, error) {
            console.error('Error fetching tag stats:', error);
            reject(error);
          }
        });
      });
    };

    // Render the tag analytics dashboard
    this.renderDashboard = function() {
      var $container = $('#tag-analytics-widget');

      if ($container.length === 0) {
        return;
      }

      // Show loading state
      $container.html('<div class="tag-loading">' + self.i18n('dashboard').loading + '</div>');

      self.fetchTagStats().then(function(data) {
        var html = self.buildDashboardHTML(data);
        $container.html(html);
        self.bindDashboardActions();
      }).catch(function(error) {
        $container.html('<div class="tag-error">' + self.i18n('dashboard').error + '</div>');
      });
    };

    // Build dashboard HTML
    this.buildDashboardHTML = function(data) {
      var i18n = self.i18n('dashboard');
      var totalTags = data.totalTags || 0;
      var tags = data.tags || [];
      var totalLeads = data.totalLeads || 0;

      var html = '<div class="tag-analytics-container">';

      // Header with total count
      html += '<div class="tag-header">';
      html += '<div class="tag-title">' + i18n.title + '</div>';
      html += '<div class="tag-total">' + totalTags + '</div>';
      html += '<button class="tag-refresh" data-testid="button-refresh">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>';
      html += '</svg>';
      html += '</button>';
      html += '</div>';

      // Tags list
      html += '<div class="tag-list">';

      if (tags.length === 0) {
        html += '<div class="tag-empty">' + i18n.no_tags + '</div>';
      } else {
        tags.forEach(function(tag, index) {
          var percentage = totalLeads > 0 ? Math.round((tag.leadCount / totalLeads) * 100) : 0;
          var tagColor = tag.color || self.getTagColor(index);

          html += '<div class="tag-item" data-testid="tag-item-' + tag.id + '">';
          html += '<div class="tag-item-header">';
          html += '<span class="tag-name" style="background-color: ' + tagColor + '">' + tag.name + '</span>';
          html += '<span class="tag-count"><strong>' + tag.leadCount + '</strong> ' + i18n.leads + '</span>';
          html += '</div>';
          html += '<div class="tag-progress-container">';
          html += '<div class="tag-progress-bar">';
          html += '<div class="tag-progress-fill" style="width: ' + percentage + '%; background-color: ' + tagColor + '"></div>';
          html += '</div>';
          html += '<span class="tag-percentage">' + percentage + '%</span>';
          html += '</div>';
          html += '</div>';
        });

        // Others section if needed
        if (data.othersCount && data.othersCount > 0) {
          html += '<div class="tag-others">' + i18n.others + ' <strong>' + data.othersCount + '</strong></div>';
        }
      }

      html += '</div>';
      html += '</div>';

      return html;
    };

    // Get tag color by index
    this.getTagColor = function(index) {
      var colors = [
        '#FDB022', // Yellow/Orange
        '#F5A623', // Orange
        '#7B8CDE', // Blue/Purple
        '#A3D977', // Light Green
        '#98A2B3', // Gray/Blue
        '#FF6B9D', // Pink
        '#50C8FF', // Cyan
        '#FFD93D'  // Yellow
      ];
      return colors[index % colors.length];
    };

    // Bind dashboard actions
    this.bindDashboardActions = function() {
      $('.tag-refresh').off('click').on('click', function(e) {
        e.preventDefault();
        self.renderDashboard();
      });
    };

    // Card SDK callbacks (required but adapted for tags)
    this.callbacks = {
      // Called when widget initializes
      render: function() {
        console.log('Tag Analytics Widget rendered');
        // Clear any existing interval to prevent duplicates
        if (self.refreshInterval) {
          clearInterval(self.refreshInterval);
        }
        // Start the rendering and auto-refresh process
        self.startRenderingAndRefresh();
        return true;
      },

      // Initialize widget
      init: function() {
        console.log('Tag Analytics Widget initialized');
        return true;
      },

      // Bind widget actions
      bind_actions: function() {
        var area = self.system().area;

        // Render dashboard in card areas
        if (area === 'lcard' || area === 'ccard' || area === 'comcard') {
          // The rendering is now handled by startRenderingAndRefresh
        }

        return true;
      },

      // Settings page
      settings: function() {
        var settings = self.get_settings();
        var i18n = self.i18n('settings');

        var html = '<div class="widget_settings_block">';
        html += '<div class="widget_settings_block__title">' + i18n.title + '</div>';
        html += '<div class="widget_settings_block__descr"></div>';

        html += '<div class="settings-form">';
        html += '<div class="form-group">';
        html += '<label>' + i18n.backend_url + '</label>';
        html += '<input type="text" class="js-widget-input" name="backend_url" value="' + (settings.backend_url || '') + '" placeholder="https://your-replit.repl.co" />';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>' + i18n.api_key + '</label>';
        html += '<input type="text" class="js-widget-input" name="api_key" value="' + (settings.api_key || '') + '" />';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>' + i18n.domain + '</label>';
        html += '<input type="text" class="js-widget-input" name="domain" value="' + (settings.domain || '') + '" placeholder="yourdomain.kommo.com" />';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>' + i18n.refresh_interval + '</label>';
        html += '<input type="number" class="js-widget-input" name="refresh_interval" value="' + (settings.refresh_interval || '60') + '" min="30" max="3600" />';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        $('.widget_settings_block__descr').html(html);

        return true;
      },

      // Save settings
      onSave: function() {
        console.log('Settings saved');
        // Clear interval on save to re-initialize with new settings if needed
        if (self.refreshInterval) {
          clearInterval(self.refreshInterval);
        }
        return true;
      },

      // Destroy widget
      destroy: function() {
        console.log('Tag Analytics Widget destroyed');
        // Clear the interval when the widget is destroyed
        if (self.refreshInterval) {
          clearInterval(self.refreshInterval);
        }
      },

      // Card SDK: Load preloaded data (tags as "products")
      loadPreloadedData: function() {
        return new Promise(function(resolve, reject) {
          self.fetchTagStats().then(function(data) {
            // Convert tags to Card SDK format
            var items = (data.tags || []).map(function(tag) {
              return {
                id: tag.id,
                sku: 'TAG-' + tag.id,
                name: tag.name,
                price: String(tag.leadCount)
              };
            });
            resolve(items);
          }).catch(function(error) {
            reject(error);
          });
        });
      },

      // Card SDK: Load elements attached to card
      loadElements: function(type, id) {
        return new Promise(function(resolve, reject) {
          // Return empty array as we don't attach tags to cards
          resolve([]);
        });
      },

      // Card SDK: Link/unlink tags (not used for analytics)
      linkCard: function(links) {
        return new Promise(function(resolve, reject) {
          console.log('Link card called:', links);
          resolve();
        });
      },

      // Card SDK: Search tags
      searchDataInCard: function(query, type, id) {
        return new Promise(function(resolve, reject) {
          self.fetchTagStats().then(function(data) {
            var filtered = (data.tags || []).filter(function(tag) {
              return tag.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });

            var items = filtered.map(function(tag) {
              return {
                id: tag.id,
                sku: 'TAG-' + tag.id,
                name: tag.name,
                price: String(tag.leadCount)
              };
            });

            resolve(items);
          }).catch(function(error) {
            reject(error);
          });
        });
      },

      // New method to handle rendering and auto-refresh
      startRenderingAndRefresh: function() {
        var $container = $('#tag-analytics-widget');

        // Function to update data
        var updateData = function() {
          // Show loading state only on initial load or if there's an error
          if ($container.html().trim() === '' || $container.find('.tag-error').length > 0) {
            $container.html('<div class="tag-loading">' + self.i18n('dashboard').loading + '</div>');
          }

          self.fetchTagStats().then(function(data) {
            var html = self.buildDashboardHTML(data);
            $container.html(html);
            self.bindDashboardActions(); // Re-bind actions after rendering
          }).catch(function(error) {
            console.error('Error rendering widget:', error);
            $container.html('<div class="tag-error">' + self.i18n('dashboard').error + '</div>');
          });
        };

        // Initial load
        updateData();

        // Get refresh interval from settings, default to 30 seconds
        var settings = self.get_settings();
        var intervalDuration = parseInt(settings.refresh_interval, 10) || 30;
        intervalDuration = Math.max(intervalDuration, 30); // Ensure minimum of 30 seconds

        // Clear any existing interval before setting a new one
        if (self.refreshInterval) {
          clearInterval(self.refreshInterval);
        }
        self.refreshInterval = setInterval(updateData, intervalDuration * 1000);
      }
    };

    return this;
  };

  return TagAnalyticsWidget;
});