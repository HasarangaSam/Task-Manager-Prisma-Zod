import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Access token is missing.",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (typeof decoded === "string" || typeof decoded.userId !== "number") {
            return res.status(401).json({
                message: "Invalid access token.",
            });
        }
        const payload = decoded;
        req.userId = payload.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token.",
        });
    }
};
