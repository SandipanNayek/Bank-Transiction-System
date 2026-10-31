const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const FraudAssessment = require("../models/fraudAssessment.model");
const { analyzeTransaction } = require("../services/fraudDetection.service");

const analyzeFraud = async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!mongoose.isValidObjectId(transactionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID",
            });
        }

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        if (transaction.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Only completed transactions can be analyzed",
            });
        }

        const historicalStats = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: transaction.fromAccount,
                    status: "COMPLETED",
                    _id: { $ne: transaction._id },
                    createdAt: { $lt: transaction.createdAt },
                },
            },
            {
                $group: {
                    _id: null,
                    averageAmount: { $avg: "$amount" },
                },
            },
        ]);

        const averageTransactionAmount =
            historicalStats.length > 0
                ? historicalStats[0].averageAmount
                : null;

        const previous24Hours = new Date(
            transaction.createdAt.getTime() - 24 * 60 * 60 * 1000
        );

        const recentTransactionCount =
            await Transaction.countDocuments({
                fromAccount: transaction.fromAccount,
                status: "COMPLETED",
                _id: { $ne: transaction._id },
                createdAt: {
                    $gte: previous24Hours,
                    $lt: transaction.createdAt,
                },
            });

        const assessment = await analyzeTransaction({
            transactionId: transaction._id.toString(),
            amount: transaction.amount,
            averageTransactionAmount,
            recentTransactionCount,
        });

        return res.status(200).json({
            success: true,
            message: "AI fraud assessment completed",
            data: assessment,
        });
    } catch (error) {
        console.error("Fraud analysis error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to analyze transaction",
        });
    }
};

const getFraudAssessment = async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!mongoose.isValidObjectId(transactionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID",
            });
        }

        const assessment = await FraudAssessment.findOne({
            transactionId,
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Fraud assessment not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: assessment,
        });
    } catch (error) {
        console.error("Assessment retrieval error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve fraud assessment",
        });
    }
};

module.exports = {
    analyzeFraud,
    getFraudAssessment,
};