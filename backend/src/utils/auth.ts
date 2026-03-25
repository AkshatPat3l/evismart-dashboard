import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const JWT_SECRET = "super-secret-evismart-key";
const prisma = new PrismaClient();

export const getUserFromToken = async (token: string): Promise<User | null> => {
  try {
    if (token) {
      const decoded: any = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
      return prisma.user.findUnique({ where: { id: decoded.userId } });
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30m" });
};
