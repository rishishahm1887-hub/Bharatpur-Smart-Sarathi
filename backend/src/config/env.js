import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  MONGODB_URI: process.env.MONGODB_URI,

  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",

  GOOGLE_MAPS_API_KEY:
    process.env.GOOGLE_MAPS_API_KEY,
};