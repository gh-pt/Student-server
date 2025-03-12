import mongoose from "mongoose";
import { Schema } from "mongoose";

const transactionSchema = new Schema({
    merchantID: { type: String, required: true },
    merchantName: { type: String, required: true },
    bankID: { type: String, required: true },
    transactionID: { type: String, required: true, },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    issuer: { type: String },
    maskedCardNo: { type: String, default: null },
    cardHolderName: { type: String, default: null },
    productType: { type: String, required: true },
    network: { type: String, default: null },
    status: { type: String, required: true, enum: ["SUCCESS", "FAILURE"] },
    preReconStatus: { type: String, default: null },
    failureReason: { type: String, default: null },
    bankReferenceNo: { type: String },
    ref1: { type: String },
    ref2: { type: String, default: null },
    ref3: { type: String, default: null },
    ref4: { type: String, default: null },
    ref5: { type: String, default: null },
    ref6: { type: String, default: null },
    ref7: { type: String, default: null },
    ref8: { type: String, default: null },
    ipAddress: { type: String, required: true }
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
