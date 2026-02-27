import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from 'cors';
import { auth } from "./auth.ts";
import jobsRouter from './routes/jobs.ts'
import HRRouter from './routes/hr.ts'
import resumeRouter from './routes/resume.ts'
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
config();

const app = express();
const port = process.env.PORT || 8000;

// Configure CORS middleware
app.use(
    cors({
        origin: ["http://127.0.0.1:8080", "http://localhost:8080", "https://conductumhr.netlify.app/"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.all("/api/auth/*splat", toNodeHandler(auth));


app.use(cookieParser())

app.use(express.json());

app.use('/api/jobs', jobsRouter);

app.use('/api/recruiter', HRRouter);

app.use('/api/resume', resumeRouter);


app.listen(port, () => {
    console.log(`Better Auth app listening on port ${port}`);
});

// export default app;