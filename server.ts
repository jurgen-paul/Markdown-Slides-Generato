import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. Generate Presentation from prompt
  app.post("/api/gemini/generate-slides", async (req, res) => {
    try {
      const { prompt, slideCount = 6, themeStyle = "Modern" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAi();
      const systemInstruction = `
You are an expert presentation designer and copywriter.
Generate a structured, visually compelling Markdown presentation based on the user's prompt.
Use clear, impactful slide headings, bullet points, callouts, stat callouts, and layout directives.

Markdown formatting rules to strictly follow:
1. Separate slides using '---' on a new line.
2. The first line of each slide should be an H1 ('# Slide Title') or H2 ('## Slide Title').
3. Use '<!-- layout: layout_type -->' comments to specify visual layout where appropriate. Supported layouts:
   - 'title' (for cover/hero slide)
   - 'split' (2-column layout)
   - 'stats' (big numbers and metrics)
   - 'grid' (3 or 4 feature cards)
   - 'quote' (key quote or testimonial)
   - 'code' (technical/code block slide)
4. For stat slides or metric callouts, format like this:
   > **98%** Customer Satisfaction Rate
   or
   ### 4.5x
   Faster workflow execution speed
5. For speaker notes, put '<!-- notes: Speaker notes text here -->' at the bottom of the slide.
6. Create exactly ${slideCount} slides.
7. Return ONLY the raw markdown string, without markdown block wrappers like \`\`\`markdown.
`;

      const userMessage = `Create a ${slideCount}-slide presentation on the topic: "${prompt}". Style tone: ${themeStyle}. Make it highly visual, engaging, and structured with stats, quotes, and layout directives.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      let markdown = response.text || "";
      // Strip outer ```markdown wrappers if present
      markdown = markdown.replace(/^```markdown\n?/i, "").replace(/```\s*$/i, "").trim();

      res.json({ markdown });
    } catch (err: any) {
      console.error("Error generating presentation:", err);
      res.status(500).json({ error: err.message || "Failed to generate presentation" });
    }
  });

  // 2. Enhance or Redesign a Single Slide
  app.post("/api/gemini/enhance-slide", async (req, res) => {
    try {
      const { slideMarkdown, action } = req.body;
      if (!slideMarkdown) {
        return res.status(400).json({ error: "Slide markdown is required" });
      }

      const ai = getAi();
      let promptInstruction = "";
      if (action === "stats") {
        promptInstruction = "Transform numbers and bullet points in this slide into bold metric callouts (e.g., > **90%** Success Rate). Add '<!-- layout: stats -->'.";
      } else if (action === "expand") {
        promptInstruction = "Elaborate on these points with concise, impactful subtitle explanations and visual bullet points.";
      } else if (action === "split") {
        promptInstruction = "Reformat content into a clean 2-column split layout using markdown subsections. Add '<!-- layout: split -->'.";
      } else if (action === "simplify") {
        promptInstruction = "Make this slide punchier, removing fluff and keeping only high-impact keywords and numbers.";
      } else {
        promptInstruction = "Improve the copywriting, clarity, visual structure, and formatting of this slide.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `${promptInstruction}\n\nCurrent Slide Content:\n${slideMarkdown}`,
        config: {
          systemInstruction: "You are an elite slide designer. Return ONLY the enhanced slide Markdown without markdown codeblock wrappers.",
          temperature: 0.6,
        },
      });

      let markdown = response.text || "";
      markdown = markdown.replace(/^```markdown\n?/i, "").replace(/```\s*$/i, "").trim();

      res.json({ markdown });
    } catch (err: any) {
      console.error("Error enhancing slide:", err);
      res.status(500).json({ error: err.message || "Failed to enhance slide" });
    }
  });

  // 3. Auto-generate Speaker Notes
  app.post("/api/gemini/generate-notes", async (req, res) => {
    try {
      const { slideMarkdown } = req.body;
      if (!slideMarkdown) {
        return res.status(400).json({ error: "Slide markdown is required" });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Generate 2-3 bullet points of speaker notes (what the presenter should say when presenting this slide):\n\n${slideMarkdown}`,
        config: {
          systemInstruction: "You are an executive speechwriter. Keep speaker notes concise, conversational, and direct. Return only the speaker notes text.",
          temperature: 0.5,
        },
      });

      res.json({ notes: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("Error generating notes:", err);
      res.status(500).json({ error: err.message || "Failed to generate speaker notes" });
    }
  });

  // 4. Generate AI Image for Slide Illustration
  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: `Modern, minimal, clean 3D vector or illustration for presentation slide: ${prompt}` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let imageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: "No image was generated" });
      }

      res.json({ imageUrl });
    } catch (err: any) {
      console.error("Error generating image:", err);
      res.status(500).json({ error: err.message || "Failed to generate slide image" });
    }
  });

  // Vite middleware for dev or Static serve for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
