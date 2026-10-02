import mongoose from "mongoose";

const tripReviewSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
        },
        placeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true,
            index: true,
        },
        reviewerName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "Bharatpur AI Traveler",
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

// A user can publish one review per place, even if they remove and re-save it.
// The partial filter allows old reviews without placeId to remain in the database.
tripReviewSchema.index(
    { userId: 1, placeId: 1 },
    {
        unique: true,
        partialFilterExpression: { placeId: { $type: "objectId" } },
    }
);

export default mongoose.model("TripReview", tripReviewSchema);
