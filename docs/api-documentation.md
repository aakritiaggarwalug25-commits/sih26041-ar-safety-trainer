# API Documentation

## Base URL
`https://sih-ar-backend.onrender.com/api`

## Endpoints

### 1. Register User
- **Method:** POST
- **Endpoint:** `/auth/register`
- **Purpose:** Create new user account
- **Request:** email, password, name, role, organization
- **Response:** uid, email

### 2. Login User
- **Method:** POST
- **Endpoint:** `/auth/login`
- **Purpose:** Authenticate user
- **Request:** email, password
- **Response:** uid, token, name, role

### 3. Submit Training Result
- **Method:** POST
- **Endpoint:** `/results`
- **Purpose:** Save completed scenario score
- **Request:** scenarioId, score, maxScore, rating, steps, timeTaken
- **Response:** resultId

### 4. Get All Results
- **Method:** GET
- **Endpoint:** `/results`
- **Purpose:** Fetch all training results (trainer view)
- **Response:** Array of all results

### 5. Get User Results
- **Method:** GET
- **Endpoint:** `/results/user/:userId`
- **Purpose:** Fetch results for specific trainee
- **Response:** Array of user's results

### 6. Dashboard Summary
- **Method:** GET
- **Endpoint:** `/dashboard/summary`
- **Purpose:** Get aggregated statistics
- **Response:** totalTrainees, avgScore, scenarioStats
