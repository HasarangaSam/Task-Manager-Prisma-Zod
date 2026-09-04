import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
const app = express();
app.use(cors({
    origin: (origin, callback) => {
        const configuredOrigin = process.env.FRONTEND_URL;
        const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production" &&
            (!origin || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));
        if (origin === configuredOrigin || isLocalDevelopmentOrigin) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (_req, res) => {
    res.json({
        message: "Task Manager API is running",
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
export default app;
