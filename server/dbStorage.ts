import { db } from './db';
import { eq } from 'drizzle-orm';
import { 
  users, type User, type InsertUser,
  stories, type Story, type InsertStory, 
  characters, type Character, type InsertCharacter
} from "@shared/schema";
import { IStorage } from './storage';

export class PostgresStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }
  
  // Story methods
  async getStoryById(id: number): Promise<Story | undefined> {
    const storyResults = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
    if (storyResults.length === 0) return undefined;
    
    const story = storyResults[0];
    // Get associated characters
    const storyCharacters = await this.getCharactersByStoryId(id);
    
    return {
      ...story,
      characters: storyCharacters
    };
  }

  async getRecentStories(limit: number): Promise<Story[]> {
    const storyResults = await db
      .select()
      .from(stories)
      .orderBy(stories.dateGenerated)
      .limit(limit);
    
    // For simplicity, not fetching characters for all stories here
    return storyResults;
  }

  async createStory(storyData: Omit<InsertStory, 'userId'> & { userId: number | null }): Promise<Story> {
    const results = await db.insert(stories).values({
      userId: storyData.userId,
      title: storyData.title,
      content: storyData.content,
      theme: storyData.theme,
      setting: storyData.setting || null
    }).returning();
    
    return results[0];
  }
  
  // Character methods
  async getCharacterById(id: number): Promise<Character | undefined> {
    const results = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return results[0];
  }

  async getCharactersByStoryId(storyId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.storyId, storyId));
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const results = await db.insert(characters).values({
      storyId: characterData.storyId,
      name: characterData.name,
      description: characterData.description || null
    }).returning();
    
    return results[0];
  }
}