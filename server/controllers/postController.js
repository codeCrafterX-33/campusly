import client from "../db.js";

export const createPost = async (req, res) => {
  const { content, imageUrl, visibleIn, email } = req.body;
  console.log(content, imageUrl, visibleIn, email);

  try {
    const result = await client.query(
      `INSERT INTO POSTS (content, imageurl, createdon, createdby, club)
       VALUES ($1, $2, DEFAULT, $3, $4) RETURNING *`,
      [content, imageUrl, email, visibleIn]
    );

    res.status(201).json({
      message: "Post created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Post creation failed",
      error: error.message,
    });
  }
};


export const getPosts = async (req, res) => {
  const { club, userEmail, orderField = "createdon" } = req.query;

  if (userEmail) {
    const result = await client.query(
      `SELECT * FROM posts 
      INNER JOIN users ON posts.createdby = users.email
      WHERE createdby = $1
      ORDER BY ${orderField} DESC`,
      [userEmail]
    );
    return res.status(200).json({
      message: "Posts fetched successfully",
      data: result.rows,
    });
  }

  if (club) {
    try {
      const result = await client.query(
        `SELECT * FROM posts
   INNER JOIN users ON posts.createdby = users.email
   WHERE club in (${club})
   ORDER BY ${orderField} DESC`
      );
      console.log(result.rows);

      res.status(200).json({
        message: "Posts fetched successfully",
        data: result.rows,
      });
    } catch (error) {
      res.status(500).json({
        message: "Posts fetching failed",
        error: error.message,
      });
    }
  }
};
