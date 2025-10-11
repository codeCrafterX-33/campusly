// Quick test script to check comment system
import pool from "./db.js";

async function testComments() {
  try {
    console.log("Testing comment system...");

    // Check if the new columns exist
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND column_name IN ('parent_post_id', 'comment_depth', 'comment_count', 'like_count')
    `);

    console.log("Comment columns:", columnsResult.rows);

    // Check recent posts
    const postsResult = await pool.query(`
      SELECT id, content, comment_depth, parent_post_id, createdon 
      FROM posts 
      ORDER BY createdon DESC 
      LIMIT 5
    `);

    console.log("Recent posts:", postsResult.rows);

    // Check if there are any comments
    const commentsResult = await pool.query(`
      SELECT id, content, comment_depth, parent_post_id, createdon 
      FROM posts 
      WHERE comment_depth > 0
      ORDER BY createdon DESC 
      LIMIT 5
    `);

    console.log("Comments found:", commentsResult.rows);
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await pool.end();
  }
}

testComments();
