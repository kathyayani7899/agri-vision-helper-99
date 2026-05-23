import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(body: Record<string, unknown>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to your workspace.");
    throw new Error(`AI error ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

/* ---------- 1. Crop Disease Detection ---------- */
export const detectDisease = createServerFn({ method: "POST" })
  .inputValidator((d: { imageBase64: string; crop: string }) => d)
  .handler(async ({ data }) => {
    const tool = {
      type: "function",
      function: {
        name: "report_diagnosis",
        description: "Return crop disease diagnosis",
        parameters: {
          type: "object",
          properties: {
            disease_name: { type: "string" },
            severity: { type: "string", enum: ["healthy", "mild", "moderate", "severe"] },
            confidence: { type: "number", description: "0-100" },
            affected_area: { type: "string", description: "What part of the plant is affected" },
            causes: { type: "array", items: { type: "string" } },
            treatment: { type: "array", items: { type: "string" } },
            prevention: { type: "array", items: { type: "string" } },
            organic_alternatives: { type: "array", items: { type: "string" } },
            urgency: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["disease_name", "severity", "confidence", "causes", "treatment", "prevention", "urgency"],
        },
      },
    };
    const result = await callAI({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an agricultural plant pathologist. Analyze the crop image and diagnose any disease, pest damage, or nutrient deficiency. Use simple farmer-friendly language." },
        {
          role: "user",
          content: [
            { type: "text", text: `Crop: ${data.crop}. Analyze this leaf/plant photo.` },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_diagnosis" } },
    });
    const args = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return JSON.parse(args || "{}");
  });

/* ---------- 2. Farming Advisor Chat ---------- */
export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(30),
    }).parse,
  )
  .handler(async ({ data }) => {
    const result = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are AgriVision, a friendly farming advisor for rural communities. Answer in simple, clear language a farmer with basic literacy can understand. Use short sentences. Give practical, locally feasible steps. When the issue is severe or unclear, gently recommend consulting a local agricultural extension officer. Cover topics like crop care, irrigation, fertilizer, pests, weather, and sustainable practices.",
        },
        ...data.messages,
      ],
    });
    return { reply: result.choices?.[0]?.message?.content ?? "" };
  });

/* ---------- 3. Soil Health Analyzer ---------- */
export const analyzeSoil = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ph: z.number().min(0).max(14),
      moisture: z.number().min(0).max(100),
      nitrogen: z.number().min(0).max(500),
      phosphorus: z.number().min(0).max(500),
      potassium: z.number().min(0).max(500),
      crop: z.string().max(50),
    }).parse,
  )
  .handler(async ({ data }) => {
    const tool = {
      type: "function",
      function: {
        name: "soil_report",
        parameters: {
          type: "object",
          properties: {
            overall_status: { type: "string", enum: ["healthy", "moderate", "critical"] },
            score: { type: "number", description: "0-100" },
            summary: { type: "string" },
            ph_assessment: { type: "string" },
            nutrient_balance: { type: "string" },
            fertilizer_recommendation: { type: "array", items: { type: "string" } },
            suitable_crops: { type: "array", items: { type: "string" } },
            over_fertilization_risk: { type: "string" },
            actions: { type: "array", items: { type: "string" } },
          },
          required: ["overall_status", "score", "summary", "fertilizer_recommendation", "suitable_crops", "actions"],
        },
      },
    };
    const result = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a soil scientist. Give practical recommendations farmers can act on." },
        {
          role: "user",
          content: `Analyze soil for ${data.crop}: pH=${data.ph}, moisture=${data.moisture}%, N=${data.nitrogen} kg/ha, P=${data.phosphorus} kg/ha, K=${data.potassium} kg/ha.`,
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "soil_report" } },
    });
    const args = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return JSON.parse(args || "{}");
  });

/* ---------- 4. Weather & Yield Prediction ---------- */
export const predictWeather = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      location: z.string().max(120),
      crop: z.string().max(50),
      season: z.string().max(40),
    }).parse,
  )
  .handler(async ({ data }) => {
    const tool = {
      type: "function",
      function: {
        name: "weather_yield_report",
        parameters: {
          type: "object",
          properties: {
            rainfall_outlook: { type: "string" },
            drought_risk: { type: "string", enum: ["low", "medium", "high"] },
            flood_risk: { type: "string", enum: ["low", "medium", "high"] },
            heat_stress_risk: { type: "string", enum: ["low", "medium", "high"] },
            irrigation_advice: { type: "string" },
            sowing_advice: { type: "string" },
            harvesting_alert: { type: "string" },
            yield_forecast: { type: "string" },
            sustainability_score: { type: "number" },
            key_actions: { type: "array", items: { type: "string" } },
          },
          required: ["drought_risk", "flood_risk", "heat_stress_risk", "irrigation_advice", "yield_forecast", "sustainability_score", "key_actions"],
        },
      },
    };
    const result = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are an agro-meteorologist. Give realistic seasonal estimates and clear, actionable farming guidance." },
        { role: "user", content: `Location: ${data.location}. Crop: ${data.crop}. Season: ${data.season}. Provide a seasonal risk assessment, irrigation/sowing/harvest guidance, and a sustainability score 0-100.` },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "weather_yield_report" } },
    });
    const args = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return JSON.parse(args || "{}");
  });

/* ---------- 5. Sustainability Score ---------- */
export const sustainabilityReport = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      farmSize: z.number().min(0).max(10000),
      crop: z.string().max(50),
      waterSource: z.string().max(80),
      fertilizerKgPerAcre: z.number().min(0).max(2000),
      usesOrganic: z.boolean(),
      cropRotation: z.boolean(),
    }).parse,
  )
  .handler(async ({ data }) => {
    const tool = {
      type: "function",
      function: {
        name: "sustainability_report",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number" },
            grade: { type: "string", enum: ["A", "B", "C", "D"] },
            water_usage_estimate: { type: "string" },
            fertilizer_assessment: { type: "string" },
            carbon_footprint: { type: "string" },
            rainwater_tips: { type: "array", items: { type: "string" } },
            organic_alternatives: { type: "array", items: { type: "string" } },
            crop_rotation_plan: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array", items: { type: "string" } },
          },
          required: ["score", "grade", "water_usage_estimate", "fertilizer_assessment", "carbon_footprint", "quick_wins"],
        },
      },
    };
    const result = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a sustainable agriculture expert. Be specific, practical, and encouraging." },
        {
          role: "user",
          content: `Farm: ${data.farmSize} acres of ${data.crop}. Water: ${data.waterSource}. Fertilizer use: ${data.fertilizerKgPerAcre} kg/acre. Uses organic methods: ${data.usesOrganic}. Practices crop rotation: ${data.cropRotation}. Provide a sustainability score 0-100, grade, water/fertilizer/carbon assessment, and tips.`,
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "sustainability_report" } },
    });
    const args = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return JSON.parse(args || "{}");
  });