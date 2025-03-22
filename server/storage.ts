import { 
  users, type User, type InsertUser,
  stories, type Story, type InsertStory, 
  characters, type Character, type InsertCharacter
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Story methods
  getStoryById(id: number): Promise<Story | undefined>;
  getRecentStories(limit: number): Promise<Story[]>;
  createStory(story: Omit<InsertStory, 'userId'> & { userId: number | null }): Promise<Story>;
  
  // Character methods
  getCharacterById(id: number): Promise<Character | undefined>;
  getCharactersByStoryId(storyId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private characters: Map<number, Character>;
  private userId: number;
  private storyId: number;
  private characterId: number;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.characters = new Map();
    this.userId = 1;
    this.storyId = 1;
    this.characterId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Story methods
  async getStoryById(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getRecentStories(limit: number): Promise<Story[]> {
    // Sort stories by date generated (newest first) and take the specified limit
    return Array.from(this.stories.values())
      .sort((a, b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime())
      .slice(0, limit);
  }

  async createStory(storyData: Omit<InsertStory, 'userId'> & { userId: number | null }): Promise<Story> {
    const id = this.storyId++;
    
    const story: Story = { 
      ...storyData, 
      id,
      setting: storyData.setting || null,
      dateGenerated: new Date()
    };
    
    this.stories.set(id, story);
    return story;
  }

  // Character methods
  async getCharacterById(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersByStoryId(storyId: number): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(character => character.storyId === storyId);
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    
    const character: Character = {
      ...characterData,
      id,
      description: characterData.description || null
    };
    
    this.characters.set(id, character);
    return character;
  }
}

// Import PostgreSQL storage
import { PostgresStorage } from './dbStorage';

// Use PostgreSQL storage if DATABASE_URL is available, otherwise fall back to MemStorage
// The MemStorage is only used for local development without a database
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage()
  : new MemStorage();

// Log which storage implementation is being used
console.log(`Using ${process.env.DATABASE_URL ? 'PostgreSQL' : 'In-Memory'} storage implementation`);
