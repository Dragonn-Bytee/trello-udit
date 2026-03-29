# Trello Clone - Full Stack Project

A feature-rich Kanban-style project management application built with React, Node.js, and PostgreSQL.

## 🏗️ Project Structure

- **`frontend/`**: React application using Vite, Axios, and `@hello-pangea/dnd` for drag-and-drop.
- **`backend/`**: Express server handling API routes, authentication (JWT), and database operations.
- **`backend/db/`**: Database schema and seed files for PostgreSQL.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Setup Backend

1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the environment variables needed:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/trello_clone
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Start the server: `npm start` (or `node index.js`)

### Setup Frontend

1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the app at `http://localhost:5173`

## 📄 License

This project is licensed under the ISC License.
