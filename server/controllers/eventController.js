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
  } = req.body;

  console.log(
    eventName,
    eventImage,
    location,
    link,
    eventDate,
    eventTime,
    u_email
  );
  try {
    const result = await pool.query(
      `INSERT INTO events VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, DEFAULT) RETURNING *`,
      [eventName, location, link, eventImage, eventDate, eventTime, u_email]
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
      await pool.query(`select events.*, users.name as username from events
inner join users
on events.createdby=users.email
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

export const registerEvent = async (req, res) => {
  const { eventId, u_email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO event_registration VALUES (DEFAULT, $1, $2, DEFAULT)`,
      [eventId, u_email]
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
  const { u_email } = req.params;

  try {
    const result = await pool.query(
      `SELECT events.*, event_registration.*, users.name as username FROM events
INNER JOIN event_registration ON events.id = event_registration.event_id
INNER JOIN users 
  ON events.createdby = users.email
WHERE event_registration.user_email = $1 ORDER BY event_registration.register_on DESC`,
      [u_email]
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
  const { u_email } = req.params;
  const { eventId } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM event_registration WHERE user_email = $1 AND event_id = $2`,
      [u_email, eventId]
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
