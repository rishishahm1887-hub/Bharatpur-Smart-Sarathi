import { clerkClient } from "@clerk/express";
import Place from "../../models/Place.js";
import Trip from "../../models/Trip.js";
import TripReview from "../../models/TripReview.js";

export const getDashboard = async (req, res) => {
    try {
        const usersResult =
            await clerkClient.users.getUserList({
                limit: 1,
                offset: 0,
            });

        const totalUsers =
            usersResult.totalCount || 0;

        const [
            totalPlaces,
            totalTrips,
            totalReviews,
        ] = await Promise.all([
            Place.countDocuments(),

            Trip.countDocuments(),

            TripReview.countDocuments({ placeId: { $exists: true } }),
        ]);

        const categoryResult =
            await Place.aggregate([
                {
                    $unwind: "$category",
                },
                {
                    $match: {
                        category: {
                            $nin: [
                                null,
                                "",
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: "$category",
                    },
                },
                {
                    $count: "total",
                },
            ]);

        const totalCategories =
            categoryResult[0]?.total || 0;

        const recentUsersResult =
            await clerkClient.users.getUserList({
                limit: 5,
                offset: 0,
                orderBy: "-created_at",
            });

        const recentUsers =
            recentUsersResult.data.map(
                (user) => ({
                    id: user.id,

                    name:
                        [
                            user.firstName,
                            user.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ") ||
                        "Unknown User",

                    email:
                        user.emailAddresses?.find(
                            (email) =>
                                email.id ===
                                user.primaryEmailAddressId
                        )?.emailAddress || "",

                    imageUrl:
                        user.imageUrl,

                    role:
                        user.publicMetadata?.role ||
                        "user",

                    status:
                        user.banned
                            ? "blocked"
                            : "active",

                    createdAt:
                        user.createdAt,
                })
            );


        const recentPlaces =
            await Place.find()
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .select(
                    "name slug image category rating createdAt"
                )
                .lean();

        const recentTrips =
            await Trip.find()
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .populate(
                    "placeId",
                    "name image"
                )
                .lean();

        const recentReviews =
            await TripReview.find({ placeId: { $exists: true } })
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .populate("tripId", "createdAt")
                .populate("placeId", "name slug image")
                .lean();

        return res.json({
            success: true,

            stats: {
                users: totalUsers,

                places: totalPlaces,

                categories: totalCategories,

                trips: totalTrips,

                reviews: totalReviews,
            },

            recent: {
                users: recentUsers,

                places: recentPlaces,

                trips: recentTrips,

                reviews: recentReviews,
            },
        });
    } catch (error) {
        console.error(
            "Admin dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Failed to load dashboard data.",
        });
    }
};