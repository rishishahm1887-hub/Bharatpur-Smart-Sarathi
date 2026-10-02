import rateLimit from "express-rate-limit";

export const apiLimiter =
    rateLimit({
        windowMs: 60 * 1000,
        limit: 120,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            success: false,
            error: "Too many requests. Please try again later.",
        },
    });

export const navigationLimiter =
    rateLimit({
        windowMs: 60 * 1000,
        limit: 30,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            success: false,
            error: "Navigation request limit reached.",
        },
    });