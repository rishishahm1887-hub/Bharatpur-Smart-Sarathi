import { clerkClient } from "@clerk/express";
import { getAuth } from "@clerk/express";

export const requireAdmin = async (req, res, next) => {
    try {
        const auth = getAuth(req);

        if (!auth.isAuthenticated || !auth.userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
        }

        const user = await clerkClient.users.getUser(auth.userId);

        const role = user.publicMetadata?.role || "user";

        if (role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Admin access required.",
            });
        }

        req.adminUser = user;
        req.userId = auth.userId;

        next();
    } catch (error) {
        console.error("Admin authorization error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to verify admin authorization.",
        });
    }
};