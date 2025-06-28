import mongoose from "mongoose";

const checkoutVerificationSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	products: { type: Array, required: true },
	totalAmount: { type: Number, required: true },
	code: { type: String, required: true },
	expiresAt: { type: Date, required: true },
});

export default mongoose.model("CheckoutVerification", checkoutVerificationSchema);
