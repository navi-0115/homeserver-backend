import { z } from "@hono/zod-openapi";
import prisma from "../../prisma/client";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import * as jwt from "../libs/jwt";
import * as crypto from "../libs/crypto";
import db from "../../prisma/client";

/**
 * Registers a new user.
 *
 * @param data The user data to register.
 * @returns The registered user.
 * @throws {Error} If the email is already in use.
 */
export const register = async (data: z.infer<typeof registerSchema>) => {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered!");
  }

  const hashedPassword = await crypto.hashValue(data.password);
  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  return { name: user.name };
};

/**
 * Logs in a user and returns JWT access and refresh tokens.
 *
 * @param data The login data (email and password).
 * @returns The generated access and refresh tokens.
 * @throws {Error} If the credentials are invalid.
 */
export const login = async (data: z.infer<typeof loginSchema>) => {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !(await crypto.verifyValue(data.password, user.password))) {
    throw new Error("Email or password is incorrect!");
  }

  const userId = user.id.toString();
  const [accessToken, refreshToken] = await Promise.all([
    jwt.createAccessToken(userId),
    jwt.createRefreshToken(userId),
  ]);

  return { accessToken, refreshToken };
};

/**
 * Retrieves the authenticated user from the database by user ID.
 *
 * @param userId The ID of the authenticated user.
 * @returns The user profile.
 */
export const getUserProfile = async (token: string) => {
  const decodedToken = await jwt.validateToken(token);
  if (!decodedToken?.subject) {
    throw new Error("Invalid or expired access token");
  }

  const user = await db.user.findUnique({
    where: { id: decodedToken.subject },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
