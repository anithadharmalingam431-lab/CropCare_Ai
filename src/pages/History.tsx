import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, Calendar, Leaf, Activity, TrendingUp, ChevronRight, Trash2, Loader2, AlertCircle, ScanLine } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { PredictionRecord } from "../types";

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setRecords((data as PredictionRecord[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from("predictions").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete record.");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button onClick={fetchHistory} className="btn-secondary w-full">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-800 mb-2">Detection History</h1>
        <p className="text-brand-500">Review your past leaf disease analyses.</p>
      </div>

      {records.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-8 h-8 text-brand-300" />
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-700">No analyses yet</p>
            <p className="text-sm text-brand-500 mt-1">Start by analyzing your first leaf.</p>
          </div>
          <button onClick={() => navigate("/detect")} className="btn-primary">
            <ScanLine className="w-5 h-5" />
            Detect Disease
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const isHealthy = record.status === "Healthy";
            return (
              <div key={record.id} className="card-hover p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-50 shrink-0 flex items-center justify-center">
                    {record.image_url ? (
                      <img src={record.image_url} alt="Leaf" className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="w-6 h-6 text-brand-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {isHealthy ? (
                        <span className="badge-healthy text-xs">{record.status}</span>
                      ) : (
                        <span className="badge-diseased text-xs">{record.status}</span>
                      )}
                      <span className="text-xs text-brand-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.created_at)} · {formatTime(record.created_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-brand-800 truncate">{record.disease}</h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-brand-500">
                      <span className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" /> {record.crop}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {record.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate("/result", {
                          state: {
                            result: {
                              crop: record.crop,
                              disease: record.disease,
                              confidence: Number(record.confidence),
                              status: record.status as "Healthy" | "Diseased",
                              description: record.description ?? "",
                              symptoms: record.symptoms ?? [],
                              recommendation: record.recommendation ?? [],
                            },
                            imageUrl: record.image_url,
                          },
                        })
                      }
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {records.length > 0 && (
        <div className="text-center pt-2">
          <button onClick={() => navigate("/detect")} className="btn-primary">
            <ScanLine className="w-5 h-5" />
            Analyze New Leaf
          </button>
        </div>
      )}
    </div>
  );
}
