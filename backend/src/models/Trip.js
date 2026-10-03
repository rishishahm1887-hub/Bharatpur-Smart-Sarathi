import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true, trim: true },
        placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    },
    { timestamps: true },
);

/*One user cannot save the same place twice.*/
tripSchema.index({ userId: 1, placeId: 1 }, { unique: true });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
