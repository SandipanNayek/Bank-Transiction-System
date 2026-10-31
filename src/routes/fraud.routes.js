const express = require("express");

const {
  analyzeFraud,
  getFraudAssessment,
} = require("../controllers/fraud.controller");

const router = express.Router();

router.post("/analyze/:transactionId", analyzeFraud);

router.get("/assessment/:transactionId", getFraudAssessment);

module.exports = router;