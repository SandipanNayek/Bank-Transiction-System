const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const emailService = require("../service/email.service")
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req , res){

    /**
     * 1. Validate request
     */

    const {fromAccount , toAccount , amount , idempotencyKey} = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "Missing required fields"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message: "Invalid sender account"
        })
    }

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid recipient account"
        })
    }

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already completed",

            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still pending",
                
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction has failed",
                
            })
        }
        
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction has been REVERSED",
                
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}`
        })
    }

    /**
      * 5. Create transaction (PENDING)
    */

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        type: "DEBIT",
        amount: amount,
        transaction: transaction[0]._id
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        type: "CREDIT",
        amount: amount,
        transaction: transaction[0]._id
    }], { session })

    transaction[0].status = "COMPLETED"
    await transaction[0].save({ session })

    await session.commitTransaction()
    session.endSession()

    /* email send notification */
    await emailService.sendTransactionEmail(req.user.email , req.user.name , amount , toAccount)

     return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
    
}

module.exports = {
    createTransaction
}