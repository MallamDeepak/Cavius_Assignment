# Full Stack Development Internship Assignment

This repository contains the source code for my Full Stack Development Internship Assignment. It implements a robust, scalable task management application built with modern technologies, strictly adhering to the assignment's technical and design requirements.

## 🚀 Key Features Implemented

- **Clean & Maintainable Architecture**: A decoupled backend and frontend structure ensuring high maintainability and easy scalability.
- **Secure Authentication**: Registered users with encrypted passwords and JWT-based session management.
- **MongoDB Integration (Seamless Data Handling)**: Efficient NoSQL database interaction using Mongoose for storing users and tasks seamlessly.
- **Generative AI Integration**: Powered by Google's Gemini API to magically map broad goals into concise, actionable sub-tasks, drastically enhancing the user experience.
- **Modern Premium UI**: Built with Next.js and Tailwind CSS featuring dynamic micro-animations, glassmorphism, responsive design, and an intuitive user flow.
- **Troubleshooting & Performance**: Designed with centralized error handling, Zod validation, and optimized React re-renders for top-tier performance.

## 📁 Project Structure

- `backend/` - Node.js + Express REST API, MongoDB models, Auth middleware, and AI controller.
- `frontend/` - Next.js 14 React Application UI featuring Server Components & Client Hooks.
- `ARCHITECTURE.md` - Short document explaining all technical design and architecture decisions.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB instance (Local or Cloud URI)
- Google Gemini API key

### 1. Backend Setup
1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your specific keys.
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`*

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env.local`. Set the API URL if different from the default.
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`*

## 📝 Submission Guidelines Checklist

- [x] Submit source code via GitHub repository.
- [x] Include README with complete setup instructions.
- [x] Provide a short document explaining architecture decisions (`ARCHITECTURE.md`).
- [x] *Optional*: Provide a short demo video (3-5 minutes). *(Can be added as a link here later)*

Built with ❤️ to demonstrate modern full stack capabilities, scalable design patterns, and clean code practices.
