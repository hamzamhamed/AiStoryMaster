import TelegramBot from 'node-telegram-bot-api';
import { generateStoryWithOpenAI } from './openai';
import { storage } from '../storage';
import type { GenerateStoryParams } from '@shared/schema';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

// State management for user conversations
const userStates = new Map<number, {
  step: 'theme' | 'character' | 'setting' | 'length';
  storyParams: Partial<GenerateStoryParams>;
}>();

// Available themes matching the web interface
const themes = [
  "adventure", "fantasy", "scifi",
  "mystery", "romance", "comedy"
];

// Story length options
const lengths = {
  "short": "Short (250-500 words)",
  "medium": "Medium (500-1000 words)",
  "long": "Long (1000-1500 words)"
};

// Initialize bot commands
export function initializeBot() {
  // Start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      "Welcome to StoryForge AI Bot! 🤖📚\n\n" +
      "I can help you generate unique stories based on your preferences.\n\n" +
      "Use /generate to start creating a new story!"
    );
  });

  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      "Available commands:\n\n" +
      "/start - Start the bot\n" +
      "/generate - Create a new story\n" +
      "/cancel - Cancel story creation\n" +
      "/help - Show this help message"
    );
  });

  // Generate command
  bot.onText(/\/generate/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    
    // Initialize user state
    userStates.set(userId, {
      step: 'theme',
      storyParams: {}
    });
    
    // Create theme selection keyboard
    const keyboard = themes.map(theme => [{
      text: theme.charAt(0).toUpperCase() + theme.slice(1)
    }]);
    
    bot.sendMessage(chatId,
      "Let's create a story! First, choose a theme:",
      {
        reply_markup: {
          keyboard,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );
  });

  // Cancel command
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    
    userStates.delete(userId);
    
    bot.sendMessage(chatId,
      "Story creation cancelled. Use /generate to start again!",
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );
  });

  // Handle all other messages
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    const userState = userStates.get(userId);
    
    if (!userState) return;
    
    switch (userState.step) {
      case 'theme':
        const theme = msg.text.toLowerCase();
        if (!themes.includes(theme)) {
          bot.sendMessage(chatId, "Please select a valid theme from the keyboard.");
          return;
        }
        
        userState.storyParams.theme = theme;
        userState.step = 'character';
        
        bot.sendMessage(chatId,
          "Great! Now, tell me the name of the main character:",
          {
            reply_markup: {
              remove_keyboard: true
            }
          }
        );
        break;
        
      case 'character':
        userState.storyParams.characters = [{
          name: msg.text,
          description: ""
        }];
        userState.step = 'setting';
        
        bot.sendMessage(chatId,
          "Where does your story take place? (Enter the setting):"
        );
        break;
        
      case 'setting':
        userState.storyParams.setting = msg.text;
        userState.step = 'length';
        
        const lengthKeyboard = Object.entries(lengths).map(([key, value]) => [{
          text: value
        }]);
        
        bot.sendMessage(chatId,
          "Finally, choose the story length:",
          {
            reply_markup: {
              keyboard: lengthKeyboard,
              one_time_keyboard: true,
              resize_keyboard: true
            }
          }
        );
        break;
        
      case 'length':
        let length = Object.entries(lengths).find(([_, value]) => value === msg.text)?.[0];
        if (!length) {
          bot.sendMessage(chatId, "Please select a valid length from the keyboard.");
          return;
        }
        
        userState.storyParams.length = length as "short" | "medium" | "long";
        
        // Generate the story
        try {
          bot.sendMessage(chatId,
            "🎨 Generating your story... This might take a moment!",
            {
              reply_markup: {
                remove_keyboard: true
              }
            }
          );
          
          const generatedStory = await generateStoryWithOpenAI(userState.storyParams as GenerateStoryParams);
          
          // Save the story
          const savedStory = await storage.createStory({
            title: generatedStory.title,
            content: generatedStory.content,
            theme: userState.storyParams.theme!,
            setting: userState.storyParams.setting || "",
            userId: null
          });
          
          // Save character if provided
          if (userState.storyParams.characters?.[0]) {
            await storage.createCharacter({
              storyId: savedStory.id,
              name: userState.storyParams.characters[0].name,
              description: userState.storyParams.characters[0].description || ""
            });
          }
          
          // Send the story in multiple messages if needed
          const storyMessage = 
            `📖 *${generatedStory.title}*\n\n` +
            `Theme: ${userState.storyParams.theme}\n` +
            `Setting: ${userState.storyParams.setting}\n\n` +
            generatedStory.content;
            
          // Split message if it's too long
          if (storyMessage.length > 4000) {
            const parts = storyMessage.match(/.{1,4000}/g) || [];
            for (const part of parts) {
              await bot.sendMessage(chatId, part, { parse_mode: 'Markdown' });
            }
          } else {
            await bot.sendMessage(chatId, storyMessage, { parse_mode: 'Markdown' });
          }
          
          bot.sendMessage(chatId,
            "Story generated successfully! Use /generate to create another story."
          );
          
        } catch (error) {
          console.error('Error generating story:', error);
          bot.sendMessage(chatId,
            "Sorry, there was an error generating your story. Please try again with /generate"
          );
        }
        
        // Clear user state
        userStates.delete(userId);
        break;
    }
  });

  console.log('Telegram bot initialized and ready!');
}

// Error handling
bot.on('polling_error', (error) => {
  console.error('Telegram bot polling error:', error);
});

bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
});