const { z } = require("zod");
const { GoogleGenAI } = require("@google/genai");

const aiPromptSchema = z.object({
  topic: z.string().min(3).max(200),
});

const buildFallbackSuggestions = (topic) => {
  const cleanTopic = topic.trim();
  return [
    `Define a clear goal and success criteria for ${cleanTopic}`,
    `Break ${cleanTopic} into 3 small milestones with deadlines`,
    `Research tools/resources required for ${cleanTopic}`,
    `Create a first draft or prototype for ${cleanTopic}`,
    `Review progress and refine the next steps for ${cleanTopic}`,
  ];
};

const generateTaskSuggestion = async (req, res, next) => {
  try {
    const parsed = aiPromptSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        suggestions: buildFallbackSuggestions(parsed.data.topic),
        source: "fallback",
        message: "GEMINI_API_KEY is not configured. Returned fallback suggestions.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate exactly 5 concise actionable task suggestions for this goal: "${parsed.data.topic}". Return only the plain newline-separated list without numbering or extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = (response.text || "").trim();
    const suggestions = text
      .split("\n")
      .map((line) => line.trim().replace(/^[-*\d.\s]+/, ""))
      .filter(Boolean)
      .slice(0, 5);

    if (suggestions.length > 0) {
      return res.json({ suggestions, source: "gemini" });
    }

    return res.json({
      suggestions: buildFallbackSuggestions(parsed.data.topic),
      source: "fallback",
      message: "AI returned empty content. Returned fallback suggestions.",
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    return res.json({
      suggestions: buildFallbackSuggestions(req.body.topic || "your goal"),
      source: "fallback",
      message: "Unable to reach AI service. Returned fallback suggestions.",
    });
  }
};

module.exports = {
  generateTaskSuggestion,
};
