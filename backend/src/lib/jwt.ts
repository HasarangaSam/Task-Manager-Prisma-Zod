import jwt from "jsonwebtoken";

export const createAccessToken = (userId: number) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    },
  );
};
