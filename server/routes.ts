import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStoryWithOpenAI } from "./services/openai";
import { generatePDF } from "./services/pdfGenerator";
import { generateStorySchema } from "../shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/stories/recent", async (req: Request, res: Response) => {
    try {
      // For now, get all stories (in a real app, this would be paginated and filtered by user)
      const stories = await storage.getRecentStories(10);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching recent stories:", error);
      res.status(500).json({ message: "Failed to fetch recent stories" });
    }
  });

  app.get("/api/stories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid story ID" });
      }

      const story = await storage.getStoryById(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Get characters for this story
      const characters = await storage.getCharactersByStoryId(id);
      res.json({ ...story, characters });
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories/generate", async (req: Request, res: Response) => {
    try {
      // Validate the request
      const params = generateStorySchema.parse(req.body);
      
      // Generate story with OpenAI
      const generatedStory = await generateStoryWithOpenAI(params);
      
      // Save story to storage
      const savedStory = await storage.createStory({
        title: generatedStory.title,
        content: generatedStory.content,
        theme: params.theme,
        setting: params.setting || "",
        userId: null, // In a real app, you would get this from the authenticated user
      });
      
      // Save characters if provided
      if (params.characters && params.characters.length > 0) {
        for (const character of params.characters) {
          await storage.createCharacter({
            storyId: savedStory.id,
            name: character.name,
            description: character.description || "",
          });
        }
      }
      
      // Get the full story with characters
      const fullStory = await storage.getStoryById(savedStory.id);
      const characters = await storage.getCharactersByStoryId(savedStory.id);
      
      res.json({ ...fullStory, characters });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error generating story:", error);
      res.status(500).json({ message: "Failed to generate story" });
    }
  });

  app.post("/api/stories/export-pdf", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        storyId: z.number(),
      });
      
      const { storyId } = schema.parse(req.body);
      
      // Get the story
      const story = await storage.getStoryById(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      // Get characters for this story
      const characters = await storage.getCharactersByStoryId(storyId);
      
      // Generate PDF
      const pdfBuffer = await generatePDF({ ...story, characters });
      
      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename=${encodeURIComponent(story.title)}.pdf`
      );
      
      // Send the PDF
      res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request" });
      }
      
      console.error("Error exporting story to PDF:", error);
      res.status(500).json({ message: "Failed to export story to PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
