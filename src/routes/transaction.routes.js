const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router()

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRoutes.post("/" , authMiddleware.authMiddleware ,transactionController.createTransaction )

/* create initial funds transaction from user system */

transactionRoutes.post("/system/initial-funds" , authMiddleware.authSystemUserMiddleware)

module.exports = transactionRoutes