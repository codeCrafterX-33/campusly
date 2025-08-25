import pool from "./db.js";

async function checkEventsSchema() {
  try {
    console.log("Checking events table schema...");
    
    // Check if events table exists and get its structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position;
    `);
    
    console.log("Events table columns:");
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if there are any events in the table
    const eventsCount = await pool.query("SELECT COUNT(*) FROM events");
    console.log(`\nTotal events in table: ${eventsCount.rows[0].count}`);
    
    // Check if there are any users in the table
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    console.log(`Total users in table: ${usersCount.rows[0].count}`);
    
    // Try to get a sample event to see the structure
    const sampleEvent = await pool.query("SELECT * FROM events LIMIT 1");
    if (sampleEvent.rows.length > 0) {
      console.log("\nSample event structure:");
      console.log(sampleEvent.rows[0]);
    }
    
    // Check users table structure
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log("\nUsers table columns:");
    usersResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error("Error checking schema:", error.message);
  } finally {
    await pool.end();
  }
}

checkEventsSchema();
