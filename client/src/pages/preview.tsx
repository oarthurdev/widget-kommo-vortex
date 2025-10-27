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
    queryKey: ["/api/kommo/tags/statistics"],
    refetchInterval: 30000,
  });

  const getTagColor = (index: number) => {
    const colors = [
      "#FDB022",
      "#F5A623",
      "#7B8CDE",
      "#A3D977",
      "#98A2B3",
      "#FF6B9D",
      "#50C8FF",
      "#FFD93D",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#4A90E2" }}>
      <Card
        className="w-full max-w-md border-none"
        style={{
          backgroundColor: "#0d2137",
          borderRadius: "8px",
        }}
      >
        <CardContent className="p-4">
          {error ? (
            <div className="text-red-400 text-center py-4">
              Erro ao carregar dados
            </div>
          ) : data ? (
            <div>
              {/* Header */}
              <div className="mb-3 pb-2 border-b border-gray-700">
                <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  TAG
                </div>
                <div className="text-[#7B68EE] text-4xl font-bold">
                  {data.totalTags}
                </div>
              </div>

              {/* Tag List */}
              <div className="space-y-2">
                {data.tags.map((tag, index) => {
                  const color = tag.color || getTagColor(index);
                  return (
                    <div key={tag.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-gray-900 whitespace-nowrap"
                          style={{ backgroundColor: color }}
                        >
                          {tag.name}
                        </span>
                        <span className="text-white text-xs whitespace-nowrap">
                          <strong>{tag.leadCount}</strong> leads
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-sm overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${tag.percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Others */}
                {data.othersCount > 0 && (
                  <div className="text-white text-xs pt-2 border-t border-gray-700 mt-2">
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
