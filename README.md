# 🏦 Banking Ledger Backend with AI-Powered Fraud Detection

A banking ledger backend built with **Node.js, Express.js, and MongoDB**, featuring account management, financial transactions, and AI-powered fraud assessment using **Google Gemini API and the Vercel AI SDK**.

The project combines core backend engineering concepts with generative AI to analyze transaction patterns, identify potentially suspicious activity, and generate risk assessments.

## 🚀 Features

### 🔐 Authentication
- User registration and login.
- Secure authentication using the project's configured authentication mechanism.
- Protected routes for authorized users.

### 💳 Account Management
- Create and manage banking accounts.
- Retrieve account information.
- Maintain account balances according to transaction rules.
- Associate transactions with their respective accounts.

### 💸 Transaction Management
- Transfer money between accounts.
- Validate transaction amounts.
- Track transaction statuses.
- Maintain transaction history.
- Use idempotency keys to help prevent duplicate transaction processing.

### 🤖 AI-Powered Fraud Detection

Integrated **Google Gemini AI using the Vercel AI SDK** to assess potentially suspicious banking transactions.

Key capabilities:

- **AI-Based Risk Assessment:** Analyzes transaction details and available historical statistics.
- **Risk Scoring:** Generates a heuristic risk score between 0 and 100.
- **Risk Classification:** Categorizes assessments as `LOW`, `MEDIUM`, or `HIGH`.
- **Explainable Results:** Provides reasons for the assessment.
- **Risk Recommendations:** Generates an `ALLOW`, `REVIEW`, or `BLOCK` recommendation.
- **Historical Transaction Analysis:** Uses the average transaction amount and recent transaction frequency as inputs.
- **Assessment Persistence:** Stores fraud assessments in MongoDB.
- **Assessment Retrieval:** Allows clients to retrieve previously saved assessments through a REST API.

The AI feature provides decision support; it does not independently prove fraud.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API development |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JWT / Cookies | Authentication, depending on implementation |
| Google Gemini API | AI-powered transaction risk analysis |
| Vercel AI SDK | Integration with Gemini |
| dotenv | Environment variable management |
| Postman | API testing |
| Git and GitHub | Version control |

---

## 🏗️ Project Architecture

```text
Banking Ledger Backend
          |
          v
     Express Server
          |
          v
        app.js
          |
          +-------------------+
          |         |         |
          v         v         v
       /api/auth /api/accounts /api/transactions
          |         |         |
          v         v         v
       Auth      Account   Transaction
     Controller  Controller Controller
          |         |         |
          +---------+---------+
                    |
                    v
                 MongoDB
                    |
                    v
              Transaction Data
                    |
                    v
               /api/fraud
                    |
                    v
             Fraud Controller
                    |
                    v
          Fraud Detection Service
                    |
                    v
              Vercel AI SDK
                    |
                    v
             Google Gemini API
                    |
                    v
             Risk Assessment
                    |
                    v
           FraudAssessment Model
                    |
                    v
                 MongoDB
                    |
                    v
          Assessment API Response
```

### AI Fraud Detection Workflow

1. The client submits a transaction ID to the fraud analysis endpoint.
2. The backend authenticates and authorizes the request.
3. The controller retrieves the transaction from MongoDB.
4. Historical statistics are collected from previous transactions.
5. The fraud detection service sends the selected transaction features to Gemini.
6. Gemini generates a risk score, risk level, reasons, and recommendation.
7. The backend validates the returned data.
8. The assessment is stored in MongoDB.
9. The API returns the assessment to the client.

---

## 📂 Project Structure

```text
banking-ledger-backend/
│
├── controllers/
│   ├── auth.controller.js
│   ├── account.controller.js
│   ├── transaction.controller.js
│   └── fraud.controller.js
│
├── models/
│   ├── user.model.js
│   ├── account.model.js
│   ├── transaction.model.js
│   └── fraudAssessment.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── account.routes.js
│   ├── transaction.routes.js
│   └── fraud.routes.js
│
├── services/
│   └── fraudDetection.service.js
│
├── middlewares/
│   └── auth.middleware.js
│
├── config/
│   └── db.js
│
├── public/
│
├── app.js
├── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

*Note: Adjust the structure to match your actual project files and filenames.*

---

## 🧠 AI Fraud Detection

### How It Works

The fraud detection service uses Gemini through the Vercel AI SDK to evaluate selected transaction features.

Currently considered features include:

- Transaction amount.
- Average historical transaction amount.
- Number of previous transactions within the preceding 24 hours.

The AI returns a structured assessment that the backend validates and saves to MongoDB.

### Example Assessment

```json
{
  "transactionId": "YOUR_TRANSACTION_ID",
  "riskScore": 72,
  "riskLevel": "HIGH",
  "reasons": [
    "The transaction amount may be unusual compared with the available transaction history."
  ],
  "recommendation": "REVIEW",
  "status": "FLAGGED"
}
```

This is an illustrative example, not an actual assessment.

### Risk Levels

| Risk Level | Meaning |
|---|---|
| `LOW` | The available information does not indicate significant unusual activity |
| `MEDIUM` | The transaction may require additional checks |
| `HIGH` | The transaction warrants further investigation |

### Recommendations

| Recommendation | Meaning |
|---|---|
| `ALLOW` | The assessment does not identify sufficient concerns to recommend additional intervention |
| `REVIEW` | The transaction should be reviewed |
| `BLOCK` | The model recommends blocking, but the recommendation must not independently trigger a real financial block |

**Important:** The risk score is a heuristic, not a calibrated probability of fraud. AI output can be inaccurate, so use appropriate validation and human review before making consequential financial decisions.

---

## 🔗 API Endpoints

The following endpoints represent the main API groups in the application. Update the paths if your route files use different endpoints.

### Authentication

Base path:

```text
/api/auth
```

Used for registration, login, and other authentication operations implemented by the application.

### Account Management

Base path:

```text
/api/accounts
```

Used for account-related operations implemented by the application.

### Transaction Management

Base path:

```text
/api/transactions
```

Used for financial transaction operations implemented by the application.

### AI Fraud Detection

Base path:

```text
/api/fraud
```

#### 1. Analyze a Transaction

```http
POST /api/fraud/analyze/:transactionId
```

**Purpose:** Analyze a completed transaction and save its fraud assessment.

Example:

```http
POST http://localhost:3000/api/fraud/analyze/YOUR_TRANSACTION_ID
```

Expected response structure:

```json
{
  "success": true,
  "message": "AI fraud assessment completed",
  "data": {
    "riskScore": 25,
    "riskLevel": "LOW",
    "reasons": [
      "No significant unusual pattern was identified from the available information."
    ],
    "recommendation": "ALLOW",
    "status": "CLEAR"
  }
}
```

The example values are illustrative.

#### 2. Retrieve a Fraud Assessment

```http
GET /api/fraud/assessment/:transactionId
```

**Purpose:** Retrieve a previously saved assessment for a transaction.

Example:

```http
GET http://localhost:3000/api/fraud/assessment/YOUR_TRANSACTION_ID
```

Both endpoints should enforce authentication and authorization so users can access only transactions and assessments they are permitted to view.

---

## 🗄️ Database Design

MongoDB stores the application's primary data and AI assessment results.

### Transaction Model

The transaction model records information such as:

- Source account.
- Destination account.
- Transaction amount.
- Transaction status.
- Idempotency key.
- Creation and update timestamps.

### Fraud Assessment Model

The fraud assessment model stores information such as:

| Field | Description |
|---|---|
| `transactionId` | Reference to the associated transaction |
| `riskScore` | Heuristic risk score between 0 and 100 |
| `riskLevel` | `LOW`, `MEDIUM`, or `HIGH` |
| `reasons` | Explanations returned by the AI |
| `recommendation` | `ALLOW`, `REVIEW`, or `BLOCK` |
| `status` | Assessment workflow status |
| `modelVersion` | Identifier of the AI model |
| `assessedAt` | Assessment timestamp |

The transaction and fraud assessment are stored separately, keeping the financial record distinct from the AI-generated analysis.

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Node.js and npm.
- MongoDB or a MongoDB Atlas account.
- A Google Gemini API key.
- Postman for API testing.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd banking-ledger-backend
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install Dependencies

```bash
npm install
```

Install the AI integration packages if they are not already installed:

```bash
npm install ai @ai-sdk/google dotenv
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

Use the exact database environment variable name expected by your existing database connection code.

Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).

**Security:** Never commit `.env` or expose your Gemini API key in frontend code or a public repository.

### 4. Start the Server

Use the start command configured in your `package.json`.

For example, if your project has a `dev` script:

```bash
npm run dev
```

Otherwise, use your configured start script, such as:

```bash
npm start
```

The server should start on the configured port.

---

## 🧪 Testing with Postman

### Test 1: AI Fraud Analysis

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/fraud/analyze/YOUR_TRANSACTION_ID`
- **Authentication:** Use the credentials, token, or cookies required by your application.
- **Body:** No body is required by the described controller.

Expected result: A successful response containing the risk score, risk level, reasons, and recommendation.

### Test 2: Retrieve the Assessment

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/fraud/assessment/YOUR_TRANSACTION_ID`
- **Authentication:** Use the same applicable authorization requirements.

Expected result: The saved fraud assessment.

### Additional Tests

- Invalid transaction ID.
- Transaction that does not exist.
- Transaction that is not completed.
- Missing authentication.
- Access to a transaction owned by another user.
- Gemini API failure.
- Invalid AI-generated output.

---

## 🔐 Security and Reliability

- Keep API keys in environment variables.
- Validate transaction IDs and all incoming data.
- Protect fraud endpoints with authentication and account-level authorization.
- Validate AI-generated responses before saving them.
- Avoid sending unnecessary sensitive banking data to an external AI service.
- Handle Gemini API errors and timeouts safely.
- Use database transactions or another suitable consistency mechanism for ledger operations.
- Enforce idempotency to reduce the risk of duplicate transaction processing.
- Do not treat an AI service failure as evidence that a transaction is safe.
- Do not automatically block or reverse real financial transactions based solely on an AI recommendation.

---

## 🔮 Future Improvements

Potential extensions include:

- Rule-based fraud detection alongside AI assessment.
- Detection of unusual transaction amounts and frequencies.
- A dashboard for reviewing flagged transactions.
- Notifications for suspicious activity.
- An audit trail for fraud assessments.
- Background processing for large transaction volumes.
- Automated integration and security tests.
- Monitoring false positives and assessment quality.

---

## 📌 Project Highlights

- REST API development using Node.js and Express.js.
- Database modeling with MongoDB and Mongoose.
- Banking account and transaction management.
- Idempotency-aware transaction processing.
- Integration of a generative AI API into a backend service.
- AI-assisted transaction risk assessment.
- Historical transaction analysis.
- Persistent fraud assessment records.
- API testing using Postman.
- Environment-based secret management.

## 👨‍💻 Conclusion

This project combines banking ledger functionality with an AI-assisted fraud detection feature.

The backend manages accounts and transactions using Node.js, Express.js, and MongoDB. The fraud detection service integrates Google Gemini through the Vercel AI SDK to analyze selected transaction features, generate risk assessments, and store the results for later retrieval.

The project demonstrates practical backend engineering, database design, REST API development, external AI integration, and secure handling of AI-generated assessments.