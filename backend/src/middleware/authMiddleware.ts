import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AccessTokenPayload extends jwt.JwtPayload {
  userId: number;
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Access token is missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

    if (typeof decoded === "string" || typeof decoded.userId !== "number") {
      return res.status(401).json({
        message: "Invalid access token.",
      });
    }

    const payload = decoded as AccessTokenPayload;

    req.userId = payload.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token.",
    });
  }
};
