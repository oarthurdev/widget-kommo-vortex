
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface TagData {
  id: number;
  name: string;
  color?: string;
  leadCount: number;
  percentage: number;
}

interface TagStatistics {
  totalTags: number;
  totalLeads: number;
  tags: TagData[];
  othersCount: number;
}

export default function Preview() {
  const { data, error } = useQuery<TagStatistics>({
    queryKey: ['/api/kommo/tags/statistics'],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const getTagColor = (index: number) => {
    const colors = [
      '#FDB022', '#F5A623', '#7B8CDE', '#A3D977',
      '#98A2B3', '#FF6B9D', '#50C8FF', '#FFD93D'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)' }}>
      <Card className="w-full max-w-md" 
            style={{ 
              backgroundColor: '#1a2942',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}>
        <CardContent className="p-6">
          {error ? (
            <div className="text-red-400 text-center py-8">
              Erro ao carregar dados
            </div>
          ) : data ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="text-white text-sm font-semibold uppercase tracking-wide mb-2">
                  TAG
                </div>
                <div className="text-blue-400 text-6xl font-bold">
                  {data.totalTags}
                </div>
              </div>

              {/* Tag List */}
              <div className="space-y-4">
                {data.tags.map((tag, index) => {
                  const color = tag.color || getTagColor(index);
                  return (
                    <div key={tag.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-3 py-1 rounded text-sm font-medium text-gray-900"
                          style={{ backgroundColor: color }}
                        >
                          {tag.name}
                        </span>
                        <span className="text-white text-sm">
                          <strong>{tag.leadCount}</strong> leads
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${tag.percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Others */}
                {data.othersCount > 0 && (
                  <div className="text-white text-sm pt-2">
                    Outros <strong>{data.othersCount}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
