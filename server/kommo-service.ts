import axios, { AxiosInstance } from 'axios';

export interface KommoTag {
  id: number;
  name: string;
  color?: string;
}

export interface KommoLead {
  id: number;
  name: string;
  _embedded?: {
    tags?: Array<{ id: number; name: string; color?: string }>;
  };
}

export interface TagStatistics {
  totalTags: number;
  totalLeads: number;
  tags: Array<{
    id: number;
    name: string;
    color?: string;
    leadCount: number;
    percentage: number;
  }>;
  othersCount: number;
  lastUpdated: string;
}

export class KommoService {
  private apiClient: AxiosInstance;
  private domain: string;
  private apiKey: string;

  constructor(domain: string, apiKey: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.apiKey = apiKey;
    
    this.apiClient = axios.create({
      baseURL: `https://${this.domain}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Fetch all active tags from Kommo
   */
  async getTags(): Promise<KommoTag[]> {
    try {
      const response = await this.apiClient.get('/api/v4/leads/tags');
      return response.data._embedded?.tags || [];
    } catch (error: any) {
      console.error('Error fetching tags from Kommo:', error.message);
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }
  }

  /**
   * Fetch all leads with their tags
   */
  async getLeads(
    limit: number = 250,
    filters?: { period?: string; type?: string; dateFrom?: string; dateTo?: string }
  ): Promise<KommoLead[]> {
    try {
      const leads: KommoLead[] = [];
      let page = 1;
      let hasMore = true;

      const filterParams: any = {
        with: 'tags',
        limit: 50,
        page: page,
      };

      console.log('Applying filters:', filters);

      // Função auxiliar para validar se é uma data válida
      const isValidDate = (value?: string) => {
        if (!value || value === 'false') return false;
        const d = new Date(value);
        return !isNaN(d.getTime());
      };

      // --- CORREÇÃO PRINCIPAL ---
      if (isValidDate(filters?.dateFrom) && isValidDate(filters?.dateTo)) {
        // Usa dateFrom e dateTo se forem válidos
        filterParams['filter[created_at][from]'] = new Date(filters!.dateFrom!).getTime() / 1000;
        filterParams['filter[created_at][to]'] = new Date(filters!.dateTo!).getTime() / 1000;
      } else if (filters?.period) {
        // Usa o período se datas não forem válidas
        const now = new Date();
        let from = new Date();

        switch (filters.period) {
          case 'day':
            from.setHours(0, 0, 0, 0);
            break;
          case 'yesterday':
            from.setDate(now.getDate() - 1);
            from.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            break;
          case 'week':
            from.setDate(now.getDate() - 7);
            break;
          case 'month':
            from.setMonth(now.getMonth() - 1);
            break;
          case 'custom':
            if (isValidDate(filters?.dateFrom) && isValidDate(filters?.dateTo)) {
              filterParams['filter[created_at][from]'] = new Date(filters!.dateFrom!).getTime() / 1000;
              filterParams['filter[created_at][to]'] = new Date(filters!.dateTo!).getTime() / 1000;
            }
            break;
          default:
            from = new Date(0); // Epoch
        }

        console.log(`Filtering leads from ${from.toISOString()} to ${now.toISOString()}`);
        filterParams['filter[created_at][from]'] = Math.floor(from.getTime() / 1000);
        filterParams['filter[created_at][to]'] = Math.floor(now.getTime() / 1000);
      }

      console.log('Fetching leads with filters:', filterParams);

      while (hasMore && leads.length < limit) {
        filterParams.page = page;
        const response = await this.apiClient.get('/api/v4/leads', { params: filterParams });

        const pageLeads = response.data._embedded?.leads || [];
        leads.push(...pageLeads);

        hasMore = pageLeads.length === 50;
        page++;
      }

      console.log(`Fetched total of ${leads.length} leads from Kommo`);
      return leads;
    } catch (error: any) {
      console.error('Error fetching leads from Kommo:', error.message);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }
  }

  /**
   * Calculate tag statistics from leads
   */
  async getTagStatistics(filters?: { period?: string; type?: string; dateFrom?: string; dateTo?: string }): Promise<TagStatistics> {
    try {
      // Fetch tags and leads in parallel
      const [allTags, allLeads] = await Promise.all([
        this.getTags(),
        this.getLeads(250, filters)
      ]);

      console.log(`Fetched ${allTags.length} tags and ${allLeads.length} leads`);
      // Count leads per tag
      const tagLeadCounts = new Map<number, number>();
      let totalLeadsWithTags = 0;

      allLeads.forEach(lead => {
        const leadTags = lead._embedded?.tags || [];
        if (leadTags.length > 0) {
          totalLeadsWithTags++;
          leadTags.forEach(tag => {
            tagLeadCounts.set(tag.id, (tagLeadCounts.get(tag.id) || 0) + 1);
          });
        }
      });

      // Build tag statistics
      const tags = allTags
        .map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          leadCount: tagLeadCounts.get(tag.id) || 0,
          percentage: 0 // Will be calculated after sorting
        }))
        .filter(tag => tag.leadCount > 0) // Only include tags with leads
        .sort((a, b) => b.leadCount - a.leadCount); // Sort by lead count descending

      // Calculate percentages
      const totalLeads = totalLeadsWithTags;
      tags.forEach(tag => {
        tag.percentage = totalLeads > 0 
          ? Math.round((tag.leadCount / totalLeads) * 100) 
          : 0;
      });

      // Limit to top tags and calculate "others"
      const maxTagsToShow = 10;
      const topTags = tags.slice(0, maxTagsToShow);
      const otherTags = tags.slice(maxTagsToShow);
      const othersCount = otherTags.reduce((sum, tag) => sum + tag.leadCount, 0);

      return {
        totalTags: tags.length,
        totalLeads: totalLeads,
        tags: topTags,
        othersCount: othersCount,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error calculating tag statistics:', error);
      throw error;
    }
  }

  /**
   * Search tags by name
   */
  async searchTags(query: string): Promise<KommoTag[]> {
    const allTags = await this.getTags();
    const normalizedQuery = query.toLowerCase();
    
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(normalizedQuery)
    );
  }
}

/**
 * Create a Kommo service instance from environment variables
 */
export function createKommoService(): KommoService {
  const domain = process.env.KOMMO_DOMAIN;
  const apiKey = process.env.KOMMO_API_KEY;

  if (!domain || !apiKey) {
    throw new Error('KOMMO_DOMAIN and KOMMO_API_KEY must be set');
  }

  return new KommoService(domain, apiKey);
}
