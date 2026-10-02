import {
    getAuth,
} from "@clerk/express";

export const requireAuth = (
    req,
    res,
    next
) => {
    const auth = getAuth(req);

    if (!auth.isAuthenticated) {
        return res.status(401).json({
            success: false,
            error: "Authentication required.",
        });
    }

    req.userId = auth.userId;

    next();
};