import { Client } from "node-postgres";

const client = new Client({
  user: process.env.EXPO_PUBLIC_DB_USERNAME,
  password: process.env.EXPO_PUBLIC_DB_PASSWORD,
  host: process.env.EXPO_PUBLIC_DB_HOST,
  port: process.env.EXPO_PUBLIC_DB_PORT,
  database: process.env.EXPO_PUBLIC_DB_DATABASE,
});

export default client;
 