import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Image as ImageIcon, ScanLine, AlertCircle, X, Loader2 } from "lucide-react";
import { predictDisease, savePrediction } from "../lib/api";
import type { PredictionResult } from "../types";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function Detect() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported file format. Please upload a JPEG, PNG, or WebP image.";
    }
    if (file.size === 0) {
      return "The selected file is empty. Please choose a valid image.";
    }
    if (file.size > MAX_SIZE) {
      return "File is too large. Maximum size is 10 MB.";
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setError("Could not access the camera. Please check permissions or use the upload option instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      handleFile(file);
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a leaf image first.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await predictDisease(selectedFile);
      await savePrediction(result, previewUrl);
      navigate("/result", { state: { result, imageUrl: previewUrl } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-800 mb-2">Analyze Your Crop Leaf</h1>
        <p className="text-brand-500">Upload or capture a clear photo of the leaf you want to check.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Camera view */}
      {cameraActive && (
        <div className="card p-4 space-y-3 animate-fade-in">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button onClick={capturePhoto} className="btn-primary flex-1">
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
            <button onClick={stopCamera} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewUrl && !cameraActive && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <div className="relative rounded-xl overflow-hidden bg-brand-50">
            <img src={previewUrl} alt="Selected leaf" className="w-full max-h-80 object-contain" />
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-brand-600 hover:bg-white hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-500">
            <ImageIcon className="w-4 h-4" />
            <span className="truncate">{selectedFile?.name}</span>
            {selectedFile && <span className="text-brand-300">({(selectedFile.size / 1024).toFixed(0)} KB)</span>}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary w-full text-lg py-4"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Leaf...
              </>
            ) : (
              <>
                <ScanLine className="w-5 h-5" />
                Analyze Leaf
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isAnalyzing && (
        <div className="card p-8 text-center space-y-4 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-brand-500 animate-pulse" />
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-800">AI is analyzing your leaf...</p>
            <p className="text-sm text-brand-500 mt-1">Extracting features and comparing against disease patterns</p>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!previewUrl && !cameraActive && !isAnalyzing && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? "border-brand-500 bg-brand-50 scale-[1.02]"
                : "border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50/50"
            }`}
          >
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-brand-500" />
              </div>
              <p className="text-lg font-semibold text-brand-800 mb-1">
                {isDragging ? "Drop your image here" : "Drag & drop a leaf image"}
              </p>
              <p className="text-sm text-brand-500 mb-5">or choose an option below</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                <button onClick={startCamera} className="btn-secondary">
                  <Camera className="w-5 h-5" />
                  Use Camera
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: ImageIcon, label: "JPEG, PNG, WebP" },
              { icon: Upload, label: "Up to 10 MB" },
              { icon: Camera, label: "Camera supported" },
            ].map((item, i) => (
              <div key={i} className="card p-3 flex flex-col items-center gap-1.5">
                <item.icon className="w-5 h-5 text-brand-400" />
                <span className="text-xs text-brand-500 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
