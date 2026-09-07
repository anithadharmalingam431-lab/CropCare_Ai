import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  CheckCircle2, AlertTriangle, Leaf, ScanLine, RotateCcw,
  TrendingUp, Activity, ListChecks, Lightbulb, AlertCircle, Image as ImageIcon,
} from "lucide-react";
import type { PredictionResult } from "../types";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, imageUrl } = (location.state as { result: PredictionResult; imageUrl: string | null }) || { result: null, imageUrl: null };

  useEffect(() => {
    if (!result) navigate("/detect", { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const isHealthy = result.status === "Healthy";
  const confidenceColor = result.confidence >= 80 ? "text-brand-600" : result.confidence >= 50 ? "text-amber-600" : "text-red-600";
  const confidenceBg = result.confidence >= 80 ? "bg-brand-500" : result.confidence >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status banner */}
      <div
        className={`rounded-2xl p-6 text-center shadow-lg ${
          isHealthy
            ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-600/20"
            : "bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-red-600/20"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          {isHealthy ? <CheckCircle2 className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {isHealthy ? "Your Crop Looks Healthy!" : `${result.disease} Detected`}
        </h1>
        <p className="text-white/80 text-sm">
          {isHealthy
            ? "No signs of disease were found in this leaf."
            : `The AI identified signs of ${result.disease} on this ${result.crop} leaf.`}
        </p>
      </div>

      {/* Warning */}
      {result.warning && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{result.warning}</p>
        </div>
      )}

      {/* Image + key info */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Image */}
        <div className="card p-4">
          {imageUrl ? (
            <div className="rounded-xl overflow-hidden bg-brand-50">
              <img src={imageUrl} alt="Analyzed leaf" className="w-full h-56 object-contain" />
            </div>
          ) : (
            <div className="rounded-xl bg-brand-50 h-56 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-brand-300" />
            </div>
          )}
        </div>

        {/* Key metrics */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-brand-500">
                <Leaf className="w-4 h-4" /> Crop
              </span>
              <span className="text-base font-semibold text-brand-800">{result.crop}</span>
            </div>
            <div className="h-px bg-brand-50" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-brand-500">
                <Activity className="w-4 h-4" /> Disease
              </span>
              <span className="text-base font-semibold text-brand-800">{result.disease}</span>
            </div>
            <div className="h-px bg-brand-50" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-brand-500">
                <ScanLine className="w-4 h-4" /> Status
              </span>
              {isHealthy ? (
                <span className="badge-healthy"><CheckCircle2 className="w-3.5 h-3.5" /> Healthy</span>
              ) : (
                <span className="badge-diseased"><AlertTriangle className="w-3.5 h-3.5" /> Diseased</span>
              )}
            </div>
          </div>

          {/* Confidence */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-medium text-brand-500">
                <TrendingUp className="w-4 h-4" /> Confidence
              </span>
              <span className={`text-2xl font-bold ${confidenceColor}`}>{result.confidence}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-brand-50 overflow-hidden">
              <div
                className={`h-full rounded-full ${confidenceBg} transition-all duration-700`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-800 mb-3">
          <Lightbulb className="w-5 h-5 text-brand-500" />
          About This Disease
        </h2>
        <p className="text-sm text-brand-600 leading-relaxed">{result.description}</p>
      </div>

      {/* Symptoms */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-800 mb-4">
          <ListChecks className="w-5 h-5 text-brand-500" />
          Symptoms to Look For
        </h2>
        <ul className="space-y-3">
          {result.symptoms?.map((symptom, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-brand-700 leading-relaxed">{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-800 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand-500" />
          Recommended Treatment & Prevention
        </h2>
        <ul className="space-y-3">
          {result.recommendation?.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-brand-700 leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={() => navigate("/detect")} className="btn-primary flex-1 text-lg py-4">
          <RotateCcw className="w-5 h-5" />
          Check Another Leaf
        </button>
        <button onClick={() => navigate("/history")} className="btn-secondary flex-1">
          View History
        </button>
      </div>
    </div>
  );
}
