import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    message: "Task Manager API is running",
  });
});

export default app;
