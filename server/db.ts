import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, stories, characters } from '@shared/schema';

// Create the database connection
const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore - Workaround for type incompatibility
export const db = drizzle(sql);

// Initialize the database schema
export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Check if the users table exists
    const userTableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    
    const usersTableExists = userTableCheck[0]?.exists;
    
    if (!usersTableExists) {
      console.log("Creating database schema...");
      
      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `;
      
      // Create stories table
      await sql`
        CREATE TABLE IF NOT EXISTS stories (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          theme TEXT NOT NULL,
          setting TEXT,
          date_generated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Create characters table
      await sql`
        CREATE TABLE IF NOT EXISTS characters (
          id SERIAL PRIMARY KEY,
          story_id INTEGER NOT NULL REFERENCES stories(id),
          name TEXT NOT NULL,
          description TEXT
        )
      `;
      
      console.log("Database schema created successfully");
    } else {
      console.log("Database schema already exists");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}