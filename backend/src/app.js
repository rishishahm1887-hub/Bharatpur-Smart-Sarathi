import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";

import placesRoutes from "./routes/places.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import adminUsersRoutes from "./routes/admin/users.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";

import { requireAuth } from "./middleware/auth.js";
import { requireAdmin } from "./middleware/admin.js";
import { apiLimiter } from "./middleware/rateLimit.js";

import adminPlacesRoutes from "./routes/admin/places.routes.js";
import adminCategoriesRoutes from "./routes/admin/categories.routes.js";
import adminTripsRoutes from "./routes/admin/trips.routes.js";
import adminReviewsRoutes from "./routes/admin/reviews.routes.js";

import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin", }, }),);

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(compression());
app.use(express.json({ limit: "100kb", }),);
app.use(express.urlencoded({ extended: false, limit: "50kb", }),);

app.use(pinoHttp());
app.use(clerkMiddleware());
app.use("/api", apiLimiter);
app.get("/health", (req, res) => { res.json({ success: true, service: "bharatpur-ai-api", timestamp: new Date().toISOString(), }); });

app.use("/api/places", placesRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use("/api/admin/places", requireAuth, requireAdmin, adminPlacesRoutes);
app.use("/api/admin/categories", requireAuth, requireAdmin, adminCategoriesRoutes);
app.use("/api/admin/trips", requireAuth, requireAdmin, adminTripsRoutes);
app.use("/api/admin/reviews", requireAuth, requireAdmin, adminReviewsRoutes);
app.use("/api/admin/users", requireAuth, requireAdmin, adminUsersRoutes);
app.use("/api/admin/dashboard", requireAuth, requireAdmin, adminDashboardRoutes,
);

app.use(notFound);
app.use(errorHandler);

export default app;
