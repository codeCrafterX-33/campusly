import pool from "../db.js";

export const createEvent = async (req, res) => {
  const {
    eventName,
    eventImage,
    location,
    link,
    eventDate,
    eventTime,
    u_email,
    user_id,
  } = req.body;

  console.log(req.body);

  try {
    const result = await pool.query(
      `INSERT INTO events VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, DEFAULT, $8) RETURNING *`,
      [
        eventName,
        location,
        link,
        eventImage,
        eventDate,
        eventTime,
        u_email,
        user_id,
      ]
    );

    res.status(201).json({
      message: "Event created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Event creation failed",
      error: error?.response?.data,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const result =
      await pool.query(`select events.*, users.firstname as username from events
inner join users
on events.user_id=users.id
order by id desc;`);

    res.status(200).json({
      message: "Events fetched successfully",
      data: result.rows,
    });
    console.log(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Events fetching failed", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    eventName,
    eventImage,
    location,
    link,
    eventDate,
    eventTime,
    user_id,
  } = req.body;

  try {
    // First check if the user is the creator of the event
    const checkResult = await pool.query(
      `SELECT user_id FROM events WHERE id = $1`,
      [eventId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        message: "You can only edit events you created",
      });
    }

    const result = await pool.query(
      `UPDATE events SET name = $1, location = $2, link = $3, bannerurl = $4, event_date = $5, event_time = $6 WHERE id = $7 RETURNING *`,
      [eventName, location, link, eventImage, eventDate, eventTime, eventId]
    );

    res.status(200).json({
      message: "Event updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error.message);
    res.status(500).json({
      message: "Event update failed",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;

  try {
    const checkResult = await pool.query(
      `SELECT user_id FROM events WHERE id = $1`,
      [eventId]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (checkResult.rows[0].user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "You can only delete events you created" });
    }
    await pool.query(`DELETE FROM event_registration WHERE event_id = $1`, [
      eventId,
    ]);

    // Then delete the event
    const result = await pool.query(
      `DELETE FROM events WHERE id = $1 RETURNING *`,
      [eventId]
    );
    res
      .status(200)
      .json({ message: "Event deleted successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting event:", error.message);
    res
      .status(500)
      .json({ message: "Event deletion failed", error: error.message });
  }
};

export const getUserCreatedEvents = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT events.*, users.firstname || ' ' || users.lastname as username 
       FROM events 
       INNER JOIN users ON events.user_id = users.id 
       WHERE events.user_id = $1 
       ORDER BY events.id DESC`,
      [user_id]
    );

    res.status(200).json({
      message: "User created events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user created events:", error.message);
    res.status(500).json({
      message: "Failed to fetch user created events",
      error: error.message,
    });
  }
};

export const registerEvent = async (req, res) => {
  const { eventId, user_id } = req.body;
  console.log(eventId, user_id);

  try {
    const result = await pool.query(
      `INSERT INTO event_registration VALUES (DEFAULT,DEFAULT, $1, $2)`,
      [user_id, eventId]
    );

    res.status(201).json({
      message: "Event registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Event registration failed",
      error: error?.response?.data,
    });
  }
};

export const getRegisteredEvents = async (req, res) => {
  const { user_id } = req.params;
  console.log("user_id", user_id);
  try {
    const result = await pool.query(
      `SELECT events.*, event_registration.*, users.firstname as username FROM events
INNER JOIN event_registration ON events.id = event_registration.event_id
INNER JOIN users 
  ON events.user_id = users.id
WHERE event_registration.user_id = $1 ORDER BY event_registration.register_on DESC`,
      [user_id]
    );

    res.status(200).json({
      message: "Registered events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registered events fetching failed",
      error: error.message,
    });
  }
};

export const unregisterEvent = async (req, res) => {
  const { user_id } = req.params;
  const { eventId } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM event_registration WHERE user_id = $1 AND event_id = $2`,
      [user_id, eventId]
    );

    res.status(200).json({
      message: "Event unregistered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Event unregistration failed",
      error: error.message,
    });
  }
};
