import mongoose from "mongoose";
import { env } from "./config/env.js";
import app from "./app.js";

const startServer = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("MongoDB connected");
        app.listen(env.PORT, () => {
            console.log(`API running on http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
