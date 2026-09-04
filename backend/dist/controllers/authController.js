import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../types/auth.js";
import { createAccessToken } from "../lib/jwt.js";
import { generateRefreshToken, hashRefreshToken } from "../lib/refreshToken.js";
export const register = async (req, res) => {
    try {
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        const { name, email, password } = validationResult.data;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        // Don't send password to the client
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const login = async (req, res) => {
    try {
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        const { email, password } = validationResult.data;
        // Find user
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        // Compare password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        // Create access token
        const accessToken = createAccessToken(user.id);
        // Create refresh token
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);
        // Refresh token expires in 7 days
        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
        // Store hashed refresh token
        await prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                expiresAt: refreshTokenExpiresAt,
                userId: user.id,
            },
        });
        // Send refresh token as HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        // Don't send password
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is missing",
            });
        }
        // Hash the token from the cookie
        const tokenHash = hashRefreshToken(refreshToken);
        // Find the stored refresh token
        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
        if (!storedToken) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }
        // Check expiration
        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({
                where: {
                    id: storedToken.id,
                },
            });
            return res.status(401).json({
                message: "Refresh token has expired",
            });
        }
        // Generate a new refresh token
        const newRefreshToken = generateRefreshToken();
        // Hash the new refresh token before storing it
        const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
        // New refresh token expires in 7 days
        const newRefreshTokenExpiresAt = new Date();
        newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 7);
        // Replace old refresh token with new one
        await prisma.$transaction([
            prisma.refreshToken.delete({
                where: {
                    id: storedToken.id,
                },
            }),
            prisma.refreshToken.create({
                data: {
                    tokenHash: newRefreshTokenHash,
                    expiresAt: newRefreshTokenExpiresAt,
                    userId: storedToken.userId,
                },
            }),
        ]);
        // Create a new access token
        const accessToken = createAccessToken(storedToken.userId);
        // Send new refresh token to browser
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            accessToken,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const getMe = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.status(200).json({
            user,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const tokenHash = hashRefreshToken(refreshToken);
            await prisma.refreshToken.deleteMany({
                where: {
                    tokenHash,
                },
            });
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json({
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
