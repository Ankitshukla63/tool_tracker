import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "rfid-tool-tracker-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { id: number; username: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
}
