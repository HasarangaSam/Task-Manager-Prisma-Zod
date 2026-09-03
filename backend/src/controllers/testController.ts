import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const testDatabase = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      message: "Database connection works",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
};
