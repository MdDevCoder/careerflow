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

## 🚀 Local Setup & Development Workflow

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)

### Environment Variables

The backend uses a centralized validation approach (Zod) for environment variables. If required variables are missing, the server will fail fast on startup. Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerflow
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

In the `frontend` directory, create a `.env` file (if testing a remote API) or rely on Vite defaults:
```env
VITE_API_URL=http://localhost:5000
```

### Development Workflow
1. **Backend**: 
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**: 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Visit `http://localhost:5173` to view the application.

## 📦 Production Deployment

1. **Environment Configuration**: Ensure your production server has a strong `JWT_SECRET` and a secure MongoDB Atlas connection string. Set `NODE_ENV=production`. The application will instantly crash with descriptive logs if any required variable is omitted.
2. **Database Indexes**: The MongoDB models are optimized with compound indexes for fast paginated and sorted queries (e.g. `user_id` + `applied_date`).
3. **Build Frontend**: Run `npm run build` inside the `frontend` directory. The resulting `/dist` folder can be hosted on Vercel, Netlify, or S3.
4. **Build Backend**: Run `npm run build` inside the `backend` directory. Host the resulting `/dist` folder on Render, Heroku, or AWS EC2. Start the server using `npm start`.
5. **CORS**: Configure `FRONTEND_URL` in the backend environment variables to accept requests *only* from your specific frontend deployment domain.
