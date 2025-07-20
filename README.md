# 🌦️ Backend Weather Tracker App

A Node.js + Express backend application featuring user authentication, session management, and real-time weather data fetching. Users can sign up, log in, save favorite locations, and view weather details rendered via EJS templates.

---

## Features

- User signup and login with password hashing (bcrypt)  
- Session-based authentication using express-session 
- Fetches weather data from the Open-Meteo API  
- Save, view, and delete favorite weather locations per user  
- EJS-rendered frontend pages for login, signup, favorites, and weather  
- Protected private routes accessible only to authenticated users  

---

## Tech Stack

- Node.js  
- Express.js  
- PostgreSQL (using `pg` module)  
- EJS templating engine  
- express-session for session management  
- bcrypt for password hashing  
- dotenv for environment variable management  

---

## 📁 Project Structure
├── app.js # Main Express app
├── db.js # PostgreSQL connection setup
├── middleware/ # Authentication middleware
├── utils/ # Weather API logic
├── views/ # EJS templates
├── public/ # Static assets (CSS, JS, images)
├── .env.example # Example environment variables file
├── package.json # Project dependencies
└── README.md # This file

## 💻 Getting Started Locally

### Prerequisites

- Node.js installed (v16+ recommended)  
- PostgreSQL database running locally or remotely  

### Steps

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/backend-weather-app.git
   cd backend-weather-app

2. Install Dependencies
   npm install axios bcrypt cors dotenv ejs express@5 express-session jsonwebtoken pg

3. Create a .env file in the root directory based on .env.example:
PORT=3000
SESSION_SECRET=yourSecretKey
DATABASE_URL=postgresql://username:password@localhost:5432/yourdbname

4. Set up your PostgreSQL database schema (make sure tables for users, favorites, etc. exist).

CREATE TABLE favorites (
	id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL
)

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


5. Start The Server.
