import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = "https://ysaysbafnzylzvwzvkdj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYXlzYmFmbnp5bHp2d3p2a2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDIwNjMsImV4cCI6MjA3OTkxODA2M30.IORl_2TG4NJuCQe5jhHKGCTL-D6gAaxnud7ySRETQ1w";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log("🚀 Initializing Supabase Database...");
  console.log(`📍 Project URL: ${supabaseUrl}`);

  try {
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), "drizzle", "0001_create_tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("📝 Executing SQL migrations...");

    // Execute the SQL
    const { error } = await supabase.rpc("exec", {
      sql: sql,
    });

    if (error) {
      console.error("❌ Error executing migrations:", error);
      throw error;
    }

    console.log("✅ Database tables created successfully!");

    // Verify tables were created
    console.log("\n📊 Verifying tables...");

    const tables = [
      "profiles",
      "services_categories",
      "services",
      "staff_skills",
      "clients",
      "appointments",
      "users",
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        console.warn(`⚠️  Table ${table} might not exist:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    }

    console.log("\n🎉 Setup complete!");
    console.log("You can now deploy to Vercel with the DATABASE_URL from .env.local");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
