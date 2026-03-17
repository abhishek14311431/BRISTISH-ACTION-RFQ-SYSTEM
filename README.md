# British Auction RFQ System

## Overview
A full-stack British Auction RFQ (Request for Quotation) system built with FastAPI (backend), React (frontend), SQLite, and SQLAlchemy. Supports real-time auctions, bidding, RFQ management, and leaderboard tracking.

## Features
- Create and manage RFQs (auctions)
- Submit bids in real-time
- Automatic auction extension and closing
- Leaderboard and activity log
- Responsive UI with Tailwind CSS
- End-to-end error handling
- GitHub integration

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, APScheduler, SQLite
- **Frontend:** React, Tailwind CSS, Axios, React Router v6
- **Database:** SQLite
- **Version Control:** Git

## Folder Structure
```
backend/
  main.py
  models.py
  database.py
  routers/
  services/
frontend/
  src/
    api/
    components/
    pages/
```

## Setup Instructions

### Backend
1. Navigate to `backend` folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Start backend server:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to `frontend` folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start frontend server:
   ```sh
   npm start
   ```

### Environment Variables
- See `.env.example` in both backend and frontend for required environment variables.

## GitHub Repository
- https://github.com/abhishek14311431/BRISTISH-ACTION-RFQ-SYSTEM.git

## License
MIT License

## Author
Abhishek
