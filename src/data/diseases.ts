// Disease catalog — maps model class names to display info.
// Each class has: crop, disease, status, description, symptoms, recommendation.
// The edge function returns the class index; this catalog provides the metadata.

export interface DiseaseInfo {
  crop: string;
  disease: string;
  status: "Healthy" | "Diseased";
  description: string;
  symptoms: string[];
  recommendation: string[];
}

export interface DiseaseClass {
  id: number;
  name: string;
  info: DiseaseInfo;
}

export const DISEASE_CLASSES: DiseaseClass[] = [
  {
    id: 0,
    name: "Healthy",
    info: {
      crop: "General",
      disease: "Healthy",
      status: "Healthy",
      description:
        "The leaf appears healthy with no visible signs of disease. The tissue shows uniform coloration and no lesions, spots, or fungal growth.",
      symptoms: ["No visible lesions or discoloration", "Uniform green coloration", "No fungal growth or mold present"],
      recommendation: [
        "Continue regular monitoring of your crops",
        "Maintain proper irrigation and fertilization",
        "Inspect plants weekly for early signs of disease",
      ],
    },
  },
  {
    id: 1,
    name: "Early Blight",
    info: {
      crop: "Tomato",
      disease: "Early Blight",
      status: "Diseased",
      description:
        "Early blight is a fungal disease caused by Alternaria solani that affects tomato and potato plants. It typically appears on older leaves first and can significantly reduce yield if left untreated.",
      symptoms: [
        "Dark brown spots with concentric rings (target-like pattern)",
        "Yellowing of leaf tissue surrounding the spots",
        "Lesions often start on older, lower leaves",
        "Spots may merge causing entire leaves to turn yellow and drop",
      ],
      recommendation: [
        "Remove and destroy severely affected leaves",
        "Avoid overhead watering to reduce leaf wetness",
        "Apply copper-based fungicide or chlorothalonil",
        "Ensure adequate plant spacing for air circulation",
        "Rotate crops and avoid planting in infected soil for 2-3 years",
      ],
    },
  },
  {
    id: 2,
    name: "Late Blight",
    info: {
      crop: "Tomato",
      disease: "Late Blight",
      status: "Diseased",
      description:
        "Late blight is a serious fungal disease caused by Phytophthora infestans. It spreads rapidly in cool, wet weather and can destroy an entire crop within days if conditions are favorable.",
      symptoms: [
        "Large dark brown or black lesions on leaves",
        "White fuzzy growth on the underside of leaves in humid conditions",
        "Greasy, dark green to brown spots on stems",
        "Rapid defoliation and plant collapse in wet weather",
      ],
      recommendation: [
        "Remove and destroy infected plants immediately",
        "Apply fungicides containing chlorothalonil or copper",
        "Improve drainage and avoid waterlogging",
        "Space plants to improve air circulation",
        "Avoid working in the field when plants are wet",
      ],
    },
  },
  {
    id: 3,
    name: "Leaf Spot",
    info: {
      crop: "General",
      disease: "Leaf Spot",
      status: "Diseased",
      description:
        "Leaf spot is a common fungal or bacterial disease that causes spots on leaves. It can be caused by various pathogens including Septoria, Cercospora, and bacterial species. Severe infections can lead to significant defoliation.",
      symptoms: [
        "Small circular spots on leaves, often with dark borders",
        "Spots may have a lighter center with dark edges",
        "Yellow halo surrounding the spot",
        "Multiple spots can merge causing large dead areas",
      ],
      recommendation: [
        "Remove infected leaves and debris from the field",
        "Apply appropriate fungicide (copper-based or mancozeb)",
        "Avoid splashing water on leaves during irrigation",
        "Practice crop rotation with non-host plants",
        "Improve air circulation by proper plant spacing",
      ],
    },
  },
  {
    id: 4,
    name: "Rust",
    info: {
      crop: "General",
      disease: "Rust",
      status: "Diseased",
      description:
        "Rust is a fungal disease caused by various rust fungi (Puccinia spp.). It produces characteristic rust-colored pustules on leaves and stems, reducing plant vigor and yield.",
      symptoms: [
        "Orange, rust-colored, or reddish-brown pustules on leaves",
        "Yellowing of leaf tissue around pustules",
        "Powdery spore masses that rub off on contact",
        "Premature leaf drop in severe infections",
      ],
      recommendation: [
        "Remove and destroy infected plant material",
        "Apply sulfur-based or triazole fungicides",
        "Avoid high humidity by improving air circulation",
        "Plant resistant varieties when available",
        "Remove alternate host plants in the vicinity",
      ],
    },
  },
  {
    id: 5,
    name: "Powdery Mildew",
    info: {
      crop: "General",
      disease: "Powdery Mildew",
      status: "Diseased",
      description:
        "Powdery mildew is a fungal disease that creates a white or gray powdery coating on leaf surfaces. It thrives in warm, dry conditions with high humidity and can affect a wide range of crops.",
      symptoms: [
        "White or gray powdery patches on leaf surfaces",
        "Yellowing or browning of affected leaf tissue",
        "Leaf curling or distortion",
        "Stunted growth in severe infections",
      ],
      recommendation: [
        "Apply sulfur-based fungicide or neem oil",
        "Improve air circulation between plants",
        "Remove and destroy infected plant parts",
        "Avoid excessive nitrogen fertilization",
        "Water at the base of plants to keep foliage dry",
      ],
    },
  },
];

export function getDiseaseById(id: number): DiseaseClass | undefined {
  return DISEASE_CLASSES.find((c) => c.id === id);
}

export function getDiseasesForApi() {
  return DISEASE_CLASSES.map((c) => ({
    id: c.id,
    name: c.name,
    crop: c.info.crop,
    disease: c.info.disease,
    status: c.info.status,
    description: c.info.description,
    symptoms: c.info.symptoms,
    recommendation: c.info.recommendation,
  }));
}
