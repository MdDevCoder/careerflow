# CareerFlow 🌊

A modern, high-performance, data-driven job search management platform built with the MERN stack. Designed for professionals who want to treat their job hunt like a sales pipeline.

## ✨ Features

- **Kanban Hero Experience**: Drag-and-drop applications across visually stunning columns (`Wishlist` to `Accepted`).
- **Smart Reminders**: Never miss a scheduled interview with the intelligent upcoming reminders panel.
- **Application Command Center**: An elegant side drawer to edit applications, track salaries, and manage metadata.
- **Activity Timeline**: A fully automated chronological feed logging every status change and interview update.
- **Interview Tracker**: Built-in multi-round interview tracking (Online, Onsite, Phone).
- **Data-Driven Analytics**: Rule-based Insight Engine and beautiful interactive charts (Recharts) detailing funnel conversions, source performance, and pipeline health.

## 🛠️ Tech Stack

**Frontend**:
- React 18 (Vite)
- Tailwind CSS & Framer Motion (Styling and Micro-animations)
- `@tanstack/react-query` (Data fetching & caching)
- `@dnd-kit/core` (Drag and drop)
- `zustand` (Global Auth State)
- `react-hook-form` & `zod` (Validation)
- `recharts` (Data visualization)

**Backend**:
- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- JWT (Authentication)
- bcryptjs (Password Hashing)

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file with `PORT=5000`, `MONGODB_URI`, and `JWT_SECRET`
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📦 Deployment Instructions

1. **Environment Variables**: Ensure your production server has a strong `JWT_SECRET` and a secure MongoDB Atlas connection string.
2. **Build Frontend**: Run `npm run build` inside the `frontend` directory. The `/dist` folder can be hosted on Vercel, Netlify, or S3.
3. **Build Backend**: Run `npx tsc` inside the `backend` directory. Host the resulting `/dist` folder on Render, Heroku, or AWS EC2.
4. **CORS**: Configure the backend `cors` middleware to accept requests *only* from your specific frontend deployment domain.
