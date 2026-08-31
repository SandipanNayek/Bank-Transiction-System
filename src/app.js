const express = require("express")
const cookieParser = require("cookie-parser")

const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes =require("./routes/transaction.routes")

const app = express();

app.use(express.json({limit: "10kb"}))
app.use(express.urlencoded({ extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/auth" , authRouter)
app.use("/api/accounts" , accountRouter)
app.use("/api/transactions" , transactionRoutes)

module.exports=app