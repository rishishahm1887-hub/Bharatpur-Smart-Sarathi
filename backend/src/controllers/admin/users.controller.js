import { clerkClient } from "@clerk/express";

export const getUsers = async (req, res) => {
    try {
        const { query, limit = 50, offset = 0 } = req.query;

        const result = await clerkClient.users.getUserList({
            ...(query ? { query } : {}),
            limit: Number(limit),
            offset: Number(offset),
            orderBy: "-created_at",
        });

        const users = result.data.map((user) => ({
            id: user.id,

            firstName: user.firstName,
            lastName: user.lastName,

            name:
                [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unknown User",

            email:
                user.emailAddresses?.find(
                    (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress || "",

            imageUrl: user.imageUrl,

            role: user.publicMetadata?.role || "user",

            status: user.banned
                ? "blocked"
                : "active",

            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            lastSignInAt: user.lastSignInAt,
        }));

        return res.json({
            success: true,
            users,
            total: result.totalCount,
        });
    } catch (error) {
        console.error("Get admin users error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to fetch users.",
        });
    }
};


export const getUser = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(
            req.params.id
        );

        return res.json({
            success: true,
            user: {
                id: user.id,

                firstName: user.firstName,
                lastName: user.lastName,

                name:
                    [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ") || "Unknown User",

                email:
                    user.emailAddresses?.find(
                        (email) =>
                            email.id === user.primaryEmailAddressId
                    )?.emailAddress || "",

                imageUrl: user.imageUrl,

                role:
                    user.publicMetadata?.role || "user",

                status: user.banned
                    ? "blocked"
                    : "active",

                createdAt: user.createdAt,
                updatedAt: user.updatedAt,

                lastSignInAt: user.lastSignInAt,
            },
        });
    } catch (error) {
        console.error("Get admin user error:", error);

        return res.status(404).json({
            success: false,
            error: "User not found.",
        });
    }
};


export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({
                success: false,
                error: "Role must be admin or user.",
            });
        }

        const targetUserId = req.params.id;

        // Prevent an admin from accidentally removing
        // their own admin access.
        if (
            targetUserId === req.userId &&
            role !== "admin"
        ) {
            return res.status(400).json({
                success: false,
                error: "You cannot remove your own admin role.",
            });
        }

        const user =
            await clerkClient.users.updateUserMetadata(
                targetUserId,
                {
                    publicMetadata: {
                        role,
                    },
                }
            );

        return res.json({
            success: true,
            message: "User role updated successfully.",
            user: {
                id: user.id,
                role:
                    user.publicMetadata?.role || "user",
            },
        });
    } catch (error) {
        console.error(
            "Update user role error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to update user role.",
        });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        if (targetUserId === req.userId) {
            return res.status(400).json({
                success: false,
                error: "You cannot delete your own account.",
            });
        }

        await clerkClient.users.deleteUser(
            targetUserId
        );

        return res.json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete admin user error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to delete user.",
        });
    }
};