import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true, trim: true },
        name: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        googlePlaceId: { type: String, trim: true, default: "", index: true },
        formattedAddress: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviews: { type: Number, default: 0 },
        category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
        estimatedCost: { type: Number, default: 0, min: 0 },
        estimatedVisitMinutes: { type: Number, default: 120, min: 15, max: 720 },
        locationPoint: {
            type: { type: String, enum: ["Point"], required: true, default: "Point" },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (value) {
                        if (!Array.isArray(value) || value.length !== 2) {
                            return false;
                        }
                        const [longitude, latitude] = value;
                        return (
                            Number.isFinite(longitude) &&
                            Number.isFinite(latitude) &&
                            longitude >= -180 &&
                            longitude <= 180 &&
                            latitude >= -90 &&
                            latitude <= 90 &&
                            !(longitude === 0 && latitude === 0)
                        );
                    },
                    message: "locationPoint.coordinates must be [longitude, latitude] with valid coordinates.",
                },
            },
        },
        locationSource: { type: String, default: "google-places" },
        providerPlaceId: { type: String, default: "" },
        lastVerifiedAt: { type: Date, default: null },
        details: {
            bestFor: { type: String, default: "" },
            suggestedTime: { type: String, default: "" },
            cost: { type: String, default: "" },
            nearby: { type: String, default: "" },
            review: { type: String, default: "" },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);



/*VIRTUAL LATITUDE*/
placeSchema.virtual("latitude").get(function () {
    return this.locationPoint?.coordinates?.[1] ?? null;
});

/*VIRTUAL LONGITUDE*/
placeSchema.virtual("longitude").get(function () {
    return this.locationPoint?.coordinates?.[0] ?? null;
});

/*INDEXES*/
placeSchema.index({ locationPoint: "2dsphere" });
placeSchema.index({ providerPlaceId: 1 });

export default mongoose.model("Place", placeSchema);
