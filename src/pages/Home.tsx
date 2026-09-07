import { useNavigate } from "react-router-dom";
import { Leaf, ScanLine, ShieldCheck, TrendingDown, Eye, ArrowRight, Sprout, Bug, FlaskConical, Camera } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-2xl shadow-brand-900/20">
        {/* Decorative leaf shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 opacity-10">
          <Leaf className="w-full h-full -rotate-12" strokeWidth={1} />
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
          <Leaf className="w-full h-full rotate-45" strokeWidth={1} />
        </div>

        <div className="relative px-6 py-12 sm:px-12 sm:py-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6 animate-fade-in">
            <Sprout className="w-4 h-4" />
            AI-Powered Crop Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5 animate-slide-up">
            Detect Crop Diseases Early with AI
          </h1>
          <p className="text-lg sm:text-xl text-brand-50 leading-relaxed mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Snap a photo of a leaf and let AI identify crop diseases in seconds.
            Early detection reduces crop loss, saves money, and protects your harvest.
          </p>
          <button
            onClick={() => navigate("/detect")}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-4 text-lg font-semibold text-brand-700 shadow-xl transition-all hover:bg-brand-50 hover:scale-105 active:scale-100"
          >
            <ScanLine className="w-5 h-5" />
            Detect Disease
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-800 text-center mb-2">How It Works</h2>
        <p className="text-brand-500 text-center mb-10 max-w-xl mx-auto">
          Three simple steps from leaf to diagnosis — no technical knowledge needed.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Camera, title: "Capture or Upload", desc: "Take a photo of a crop leaf with your phone or upload an existing image." },
            { icon: ScanLine, title: "AI Analysis", desc: "Our system analyzes the leaf for signs of disease using computer vision." },
            { icon: ShieldCheck, title: "Get Results", desc: "Receive the disease name, confidence score, and treatment recommendations." },
          ].map((step, i) => (
            <div key={i} className="card-hover p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-brand-600" />
              </div>
              <div className="text-sm font-semibold text-brand-400 mb-1">Step {i + 1}</div>
              <h3 className="text-lg font-semibold text-brand-800 mb-2">{step.title}</h3>
              <p className="text-sm text-brand-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why early detection matters */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-7">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-800 mb-2">The Cost of Late Detection</h3>
              <p className="text-sm text-brand-600 leading-relaxed">
                Crop diseases can spread rapidly across a field. Left unchecked, fungal infections
                like late blight can destroy an entire harvest within days, leading to significant
                financial losses for farmers.
              </p>
            </div>
          </div>
        </div>
        <div className="card p-7">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-800 mb-2">Catch It Early</h3>
              <p className="text-sm text-brand-600 leading-relaxed">
                Identifying diseases at the first sign of symptoms lets you act quickly — removing
                affected leaves, applying targeted treatments, and preventing spread before it
                threatens your entire crop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diseases we detect */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-800 text-center mb-2">Diseases We Detect</h2>
        <p className="text-brand-500 text-center mb-10 max-w-xl mx-auto">
          Our system identifies common crop diseases across multiple plant types.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "Healthy", icon: Leaf, color: "brand" },
            { name: "Early Blight", icon: Bug, color: "amber" },
            { name: "Late Blight", icon: Bug, color: "red" },
            { name: "Leaf Spot", icon: FlaskConical, color: "orange" },
            { name: "Rust", icon: Bug, color: "yellow" },
            { name: "Powdery Mildew", icon: FlaskConical, color: "slate" },
          ].map((d) => (
            <div key={d.name} className="card-hover p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-2">
                <d.icon className="w-5 h-5 text-brand-600" />
              </div>
              <span className="text-xs font-medium text-brand-700">{d.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-800 mb-3">Ready to Check Your Crops?</h2>
        <p className="text-brand-500 mb-6 max-w-md mx-auto">
          Upload a leaf photo and get an instant disease analysis.
        </p>
        <button onClick={() => navigate("/detect")} className="btn-primary text-lg px-8 py-4">
          <ScanLine className="w-5 h-5" />
          Start Detection
        </button>
      </section>
    </div>
  );
}


