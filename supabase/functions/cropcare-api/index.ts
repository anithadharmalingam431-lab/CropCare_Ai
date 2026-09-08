import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REFERENCE_IMAGE = "/crop-disease-reference.webp";

const DISEASE_CLASSES = [
  "Healthy",
  "Early Blight",
  "Late Blight",
  "Leaf Spot",
  "Rust",
  "Powdery Mildew",
];

const DISEASE_INFO: Record<string, {
  crop: string; disease: string; status: string;
  description: string; symptoms: string[]; recommendation: string[];
}> = {
  Healthy: {
    crop: "General", disease: "Healthy", status: "Healthy",
    description: "The leaf appears healthy with no visible signs of disease. The tissue shows uniform coloration and no lesions, spots, or fungal growth.",
    symptoms: ["No visible lesions or discoloration", "Uniform green coloration", "No fungal growth or mold present"],
    recommendation: ["Continue regular monitoring of your crops", "Maintain proper irrigation and fertilization", "Inspect plants weekly for early signs of disease"],
  },
  "Early Blight": {
    crop: "Tomato", disease: "Early Blight", status: "Diseased",
    description: "Early blight is a fungal disease caused by Alternaria solani that affects tomato and potato plants. It typically appears on older leaves first and can significantly reduce yield if left untreated.",
    symptoms: ["Dark brown spots with concentric rings (target-like pattern)", "Yellowing of leaf tissue surrounding the spots", "Lesions often start on older, lower leaves", "Spots may merge causing entire leaves to turn yellow and drop"],
    recommendation: ["Remove and destroy severely affected leaves", "Avoid overhead watering to reduce leaf wetness", "Apply copper-based fungicide or chlorothalonil", "Ensure adequate plant spacing for air circulation", "Rotate crops and avoid planting in infected soil for 2-3 years"],
  },
  "Late Blight": {
    crop: "Tomato", disease: "Late Blight", status: "Diseased",
    description: "Late blight is a serious fungal disease caused by Phytophthora infestans. It spreads rapidly in cool, wet weather and can destroy an entire crop within days if conditions are favorable.",
    symptoms: ["Large dark brown or black lesions on leaves", "White fuzzy growth on the underside of leaves in humid conditions", "Greasy, dark green to brown spots on stems", "Rapid defoliation and plant collapse in wet weather"],
    recommendation: ["Remove and destroy infected plants immediately", "Apply fungicides containing chlorothalonil or copper", "Improve drainage and avoid waterlogging", "Space plants to improve air circulation", "Avoid working in the field when plants are wet"],
  },
  "Leaf Spot": {
    crop: "General", disease: "Leaf Spot", status: "Diseased",
    description: "Leaf spot is a common fungal or bacterial disease that causes spots on leaves. It can be caused by various pathogens including Septoria, Cercospora, and bacterial species. Severe infections can lead to significant defoliation.",
    symptoms: ["Small circular spots on leaves, often with dark borders", "Spots may have a lighter center with dark edges", "Yellow halo surrounding the spot", "Multiple spots can merge causing large dead areas"],
    recommendation: ["Remove infected leaves and debris from the field", "Apply appropriate fungicide (copper-based or mancozeb)", "Avoid splashing water on leaves during irrigation", "Practice crop rotation with non-host plants", "Improve air circulation by proper plant spacing"],
  },
  Rust: {
    crop: "General", disease: "Rust", status: "Diseased",
    description: "Rust is a fungal disease caused by various rust fungi (Puccinia spp.). It produces characteristic rust-colored pustules on leaves and stems, reducing plant vigor and yield.",
    symptoms: ["Orange, rust-colored, or reddish-brown pustules on leaves", "Yellowing of leaf tissue around pustules", "Powdery spore masses that rub off on contact", "Premature leaf drop in severe infections"],
    recommendation: ["Remove and destroy infected plant material", "Apply sulfur-based or triazole fungicides", "Avoid high humidity by improving air circulation", "Plant resistant varieties when available", "Remove alternate host plants in the vicinity"],
  },
  "Powdery Mildew": {
    crop: "General", disease: "Powdery Mildew", status: "Diseased",
    description: "Powdery mildew is a fungal disease that creates a white or gray powdery coating on leaf surfaces. It thrives in warm, dry conditions with high humidity and can affect a wide range of crops.",
    symptoms: ["White or gray powdery patches on leaf surfaces", "Yellowing or browning of affected leaf tissue", "Leaf curling or distortion", "Stunted growth in severe infections"],
    recommendation: ["Apply sulfur-based fungicide or neem oil", "Improve air circulation between plants", "Remove and destroy infected plant parts", "Avoid excessive nitrogen fertilization", "Water at the base of plants to keep foliage dry"],
  },
};

// Disease prototype signatures for nearest-prototype classification
const PROTOTYPES: Record<number, Record<string, number>> = {
  0: { greenRatio: 0.42, brownRatio: 0.03, yellowRatio: 0.02, whiteRatio: 0.01, rustRatio: 0.01, darkSpotRatio: 0.01, edgeDensity: 0.08 },
  1: { greenRatio: 0.36, brownRatio: 0.12, yellowRatio: 0.08, whiteRatio: 0.01, rustRatio: 0.02, darkSpotRatio: 0.06, edgeDensity: 0.18 },
  2: { greenRatio: 0.32, brownRatio: 0.18, yellowRatio: 0.06, whiteRatio: 0.02, rustRatio: 0.02, darkSpotRatio: 0.12, edgeDensity: 0.22 },
  3: { greenRatio: 0.37, brownRatio: 0.10, yellowRatio: 0.07, whiteRatio: 0.01, rustRatio: 0.02, darkSpotRatio: 0.08, edgeDensity: 0.20 },
  4: { greenRatio: 0.35, brownRatio: 0.08, yellowRatio: 0.05, whiteRatio: 0.01, rustRatio: 0.15, darkSpotRatio: 0.04, edgeDensity: 0.16 },
  5: { greenRatio: 0.38, brownRatio: 0.03, yellowRatio: 0.04, whiteRatio: 0.14, rustRatio: 0.01, darkSpotRatio: 0.02, edgeDensity: 0.12 },
};

const FEATURE_KEYS = ["greenRatio", "brownRatio", "yellowRatio", "whiteRatio", "rustRatio", "darkSpotRatio", "edgeDensity"];

interface ImageFeatures {
  greenRatio: number; brownRatio: number; yellowRatio: number;
  whiteRatio: number; rustRatio: number; darkSpotRatio: number; edgeDensity: number;
}

function extractFeatures(pixels: Uint8Array, width: number, height: number): ImageFeatures {
  let rSum = 0, gSum = 0, bSum = 0;
  let brownCount = 0, yellowCount = 0, whiteCount = 0, rustCount = 0, darkSpotCount = 0;
  const total = width * height;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const sum = r + g + b || 1;
    rSum += r; gSum += g; bSum += b;

    if (r > 80 && r > g + 15 && g > b + 10 && r < 200) brownCount++;
    if (r > 150 && g > 130 && b < 100 && r > b + 40) yellowCount++;
    if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) whiteCount++;
    if (r > 140 && g > 60 && g < 140 && b < 80 && r > g + 20) rustCount++;
    if (sum < 120) darkSpotCount++;
  }

  const rMean = rSum / total, gMean = gSum / total, bMean = bSum / total;
  const greenRatio = gMean / (rMean + gMean + bMean || 1);

  // Edge density proxy
  let edgeCount = 0, edgeSamples = 0;
  const step = Math.max(1, Math.floor(total / 5000));
  for (let y = 1; y < height - 1; y += Math.max(1, Math.floor(step / width))) {
    for (let x = 1; x < width - 1; x += step) {
      const idx = (y * width + x) * 4;
      const idxR = (y * width + (x + 1)) * 4;
      const idxD = ((y + 1) * width + x) * 4;
      const lum = pixels[idx] + pixels[idx + 1] + pixels[idx + 2];
      const lumR = pixels[idxR] + pixels[idxR + 1] + pixels[idxR + 2];
      const lumD = pixels[idxD] + pixels[idxD + 1] + pixels[idxD + 2];
      if (Math.abs(lum - lumR) > 60 || Math.abs(lum - lumD) > 60) edgeCount++;
      edgeSamples++;
    }
  }

  return {
    greenRatio,
    brownRatio: brownCount / total,
    yellowRatio: yellowCount / total,
    whiteRatio: whiteCount / total,
    rustRatio: rustCount / total,
    darkSpotRatio: darkSpotCount / total,
    edgeDensity: edgeSamples > 0 ? edgeCount / edgeSamples : 0,
  };
}

function classify(features: ImageFeatures): { classId: number; confidence: number } {
  const allDists: number[] = [];
  for (let c = 0; c < 6; c++) {
    let d = 0;
    for (const key of FEATURE_KEYS) {
      const protoVal = PROTOTYPES[c][key] ?? 0;
      const weight = key === "edgeDensity" ? 1.5 : 3.0;
      d += weight * Math.pow((features as Record<string, number>)[key] - protoVal, 2);
    }
    allDists.push(d);
  }
  const maxD = Math.max(...allDists);
  const expVals = allDists.map((d) => Math.exp(-(d - maxD) * 8));
  const sumExp = expVals.reduce((a, b) => a + b, 0);
  const probs = expVals.map((e) => e / sumExp);
  const bestClass = probs.indexOf(Math.max(...probs));
  const confidence = Math.round(probs[bestClass] * 1000) / 10;
  return { classId: bestClass, confidence };
}

async function decodeImage(file: File, size = 128): Promise<{ pixels: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { resizeWidth: size, resizeHeight: size, resizeQuality: "high" });
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");
  ctx.drawImage(bitmap, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  return { pixels: new Uint8Array(imageData.data.buffer), width: size, height: size };
}

function getSupabase() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase config");
  return createClient(url, key);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status: number, details?: string): Response {
  return json({ error: msg, details, status }, status);
}

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);
  const route = url.pathname.replace(/^.*\/cropcare-api/, "") || url.pathname;

  try {
    if (route === "/health" && req.method === "GET") {
      return json({ status: "healthy", model_loaded: true, classes: DISEASE_CLASSES });
    }

    if (route === "/diseases" && req.method === "GET") {
      return json({
        diseases: DISEASE_CLASSES.map((name, i) => ({
          id: i, name, ...DISEASE_INFO[name],
        })),
      });
    }

    if (route === "/predict" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") || formData.get("image");
      if (!file || !(file instanceof File)) return err("No image uploaded. Please provide a leaf image file.", 400);
      if (file.size === 0) return err("The uploaded file is empty.", 400);
      if (file.size > MAX_SIZE) return err("File too large. Maximum size is 10 MB.", 413);
      if (!ALLOWED.includes(file.type)) return err(`Unsupported format: ${file.type}. Use JPEG, PNG, or WebP.`, 415);

      let pixels: Uint8Array, w: number, h: number;
      try {
        const decoded = await decodeImage(file, 128);
        pixels = decoded.pixels; w = decoded.width; h = decoded.height;
      } catch (e) {
        return err("Failed to process image. The file may be corrupted.", 422, e instanceof Error ? e.message : String(e));
      }

      let result: { classId: number; confidence: number };
      try {
        result = classify(extractFeatures(pixels, w, h));
      } catch (e) {
        return err("Model analysis failed.", 500, e instanceof Error ? e.message : String(e));
      }

      const info = DISEASE_INFO[DISEASE_CLASSES[result.classId]];
      if (!info) return err("Unknown class returned.", 500);

      const isLow = result.confidence < 50;
      return json({
        crop: info.crop, disease: info.disease, confidence: result.confidence,
        status: info.status, description: info.description,
        symptoms: info.symptoms, recommendation: info.recommendation,
        reference_image: REFERENCE_IMAGE,
        warning: isLow ? "Low confidence prediction. The image may be unclear or the disease may not match known patterns. Consider consulting an agricultural expert." : null,
      });
    }

    if (route === "/history" && req.method === "POST") {
      let body: Record<string, unknown>;
      try { body = await req.json(); } catch { return err("Invalid JSON body.", 400); }
      const { crop, disease, confidence, status, image_path, image_url, description, symptoms, recommendation } = body;
      if (!crop || !disease || confidence === undefined || !status) return err("Missing required fields.", 400);

      const supabase = getSupabase();
      const { data, error: dbError } = await supabase.from("predictions").insert({
        crop: String(crop), disease: String(disease), confidence: Number(confidence),
        status: String(status), image_url: image_url ? String(image_url) : (image_path ? String(image_path) : null),
        description: description ? String(description) : null,
        symptoms: symptoms ?? null, recommendation: recommendation ?? null,
      }).select().single();

      if (dbError) return err("Failed to save history.", 500, dbError.message);
      return json({ success: true, prediction: data }, 201);
    }

    if (route === "/history" && req.method === "GET") {
      const supabase = getSupabase();
      const { data, error: dbError } = await supabase.from("predictions").select("*").order("created_at", { ascending: false }).limit(100);
      if (dbError) return err("Failed to retrieve history.", 500, dbError.message);
      return json({ predictions: data ?? [] });
    }

    return err(`Not found: ${route}`, 404);
  } catch (e) {
    return err("Internal server error.", 500, e instanceof Error ? e.message : String(e));
  }
});
