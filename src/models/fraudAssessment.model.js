const mongoose = require("mongoose");

const fraudAssessmentSchema = new mongoose.Schema(
    {
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",
            required: true,
            unique: true,
        },

        riskScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        riskLevel: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            required: true,
        },

        reasons: {
            type: [String],
            default: [],
        },

        recommendation: {
            type: String,
            enum: ["ALLOW", "REVIEW", "BLOCK"],
            required: true,
        },

        status: {
            type: String,
            enum: ["CLEAR", "FLAGGED", "REVIEWED"],
            default: "CLEAR",
        },

        modelVersion: {
            type: String,
            default: "gemini-3-flash-preview",
        },

        assessedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "FraudAssessment",
    fraudAssessmentSchema
);