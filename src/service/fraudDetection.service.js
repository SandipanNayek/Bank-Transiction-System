const mongoose = require("mongoose");
const FraudAssessment = require("../models/fraudAssessment.model");

const analyzeTransaction = async ({
    transactionId,
    amount,
    averageTransactionAmount = null,
    recentTransactionCount = 0,
}) => {
    if (!mongoose.isValidObjectId(transactionId)) {
        throw new Error("Invalid transaction ID");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Transaction amount must be positive");
    }

    if (
        averageTransactionAmount !== null &&
        (!Number.isFinite(averageTransactionAmount) ||
            averageTransactionAmount <= 0)
    ) {
        throw new Error("Invalid average transaction amount");
    }

    if (
        !Number.isInteger(recentTransactionCount) ||
        recentTransactionCount < 0
    ) {
        throw new Error("Invalid recent transaction count");
    }

    const [{ generateText }, { google }] = await Promise.all([
        import("ai"),
        import("@ai-sdk/google"),
    ]);

    const prompt = `
You are an assistant that analyzes unusual banking transaction patterns.

Analyze these transaction features:
- Transaction amount: ${amount}
- Historical average amount: ${
        averageTransactionAmount === null
            ? "Unavailable"
            : averageTransactionAmount
    }
- Previous transactions in the last 24 hours: ${recentTransactionCount}

Rules:
- Identify potentially unusual activity.
- Never claim that unusual activity proves fraud.
- Do not invent missing information.
- Treat the risk score as a heuristic, not a probability of fraud.
- If information is insufficient, mention the limitation.

Return only a JSON object:
{
  "riskScore": 0,
  "riskLevel": "LOW",
  "reasons": ["Explanation"],
  "recommendation": "ALLOW"
}

Constraints:
- riskScore: integer from 0 to 100.
- riskLevel: LOW, MEDIUM, or HIGH.
- recommendation: ALLOW, REVIEW, or BLOCK.
`;

    const { text } = await generateText({
        model: google("gemini-3-flash-preview"),
        prompt,
        temperature: 0,
    });

    let result;

    try {
        result = JSON.parse(text);
    } catch {
        throw new Error("Gemini returned invalid JSON");
    }

    if (
        !Number.isInteger(result.riskScore) ||
        result.riskScore < 0 ||
        result.riskScore > 100 ||
        !["LOW", "MEDIUM", "HIGH"].includes(result.riskLevel) ||
        !["ALLOW", "REVIEW", "BLOCK"].includes(result.recommendation) ||
        !Array.isArray(result.reasons) ||
        !result.reasons.every(
            (reason) => typeof reason === "string"
        )
    ) {
        throw new Error("Invalid fraud assessment returned by Gemini");
    }

    const assessmentData = {
        transactionId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        reasons: result.reasons,
        recommendation: result.recommendation,
        status: result.riskLevel === "HIGH" ? "FLAGGED" : "CLEAR",
        modelVersion: "gemini-3-flash-preview",
        assessedAt: new Date(),
    };

    return FraudAssessment.findOneAndUpdate(
        { transactionId },
        { $set: assessmentData },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
};

module.exports = { analyzeTransaction };