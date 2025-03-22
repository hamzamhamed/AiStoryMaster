import OpenAI from "openai";
import { GenerateStoryParams } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing_api_key",
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

type GeneratedStory = {
  title: string;
  content: string;
};

export async function generateStoryWithOpenAI(params: GenerateStoryParams): Promise<GeneratedStory> {
  try {
    // Build the prompt based on user parameters
    const prompt = createStoryPrompt(params);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert storyteller and creative writer. You craft engaging, coherent, and thoughtful stories based on the provided parameters. Always output in a JSON format with a 'title' and 'content' field."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(responseContent);

    // If title wasn't provided, use the one from OpenAI
    if (!params.title && result.title) {
      return {
        title: result.title,
        content: result.content,
      };
    }

    // If title was provided by user, use that one
    return {
      title: params.title || result.title || "Untitled Story",
      content: result.content,
    };
  } catch (error) {
    console.error("Error generating story with OpenAI:", error);
    throw new Error("Failed to generate story. Please try again later.");
  }
}

function createStoryPrompt(params: GenerateStoryParams): string {
  // Calculate approximate word count based on length
  const wordCounts = {
    short: "250-500",
    medium: "500-1000",
    long: "1000-1500",
  };

  // Build list of characters
  const characterDetails = params.characters && params.characters.length > 0
    ? params.characters.map(char => {
        return `${char.name}${char.description ? ` - ${char.description}` : ''}`;
      }).join("\n- ")
    : "Create suitable characters for this story";

  // Create the prompt
  return `
Please create a complete story with the following specifications:

THEME: ${params.theme}
${params.title ? `TITLE: ${params.title}` : "Please generate an engaging title"}
${params.setting ? `SETTING: ${params.setting}` : ""}

CHARACTERS:
- ${characterDetails}

LENGTH: ${wordCounts[params.length]} words

${params.plotElements ? `ADDITIONAL PLOT ELEMENTS: ${params.plotElements}` : ""}

Please write a coherent, engaging, and complete story based on these parameters. Make it creative and compelling with a clear beginning, middle, and end. Format the story with proper paragraphs.

Respond with a JSON object containing:
1. "title" - The title of the story (use the provided one if given)
2. "content" - The full text of the story with proper paragraph breaks
`;
}
